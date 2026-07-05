/**
 * Shared MongoDB connection for OmdaFit.
 *
 * The client is memoized on the Node global so warm serverless invocations
 * (Vercel) reuse the same connection pool instead of opening a new one on
 * every request.
 */
import dns from 'dns';
import { MongoClient, type Db } from 'mongodb';

const rawUri = process.env.MONGODB_URI || '';

declare global {
  // eslint-disable-next-line no-var
  var _omdaMongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * `mongodb+srv://` needs a DNS SRV + TXT lookup. Some networks (corporate
 * VPNs, certain Windows/antivirus setups) let normal browser lookups through
 * but block the raw SRV/TXT queries Node's driver makes internally, which
 * surfaces as a confusing ECONNREFUSED on every connection attempt. When that
 * happens we resolve the records ourselves with public resolvers and hand the
 * driver a plain `mongodb://host1,host2,host3/...` string instead.
 */
async function resolveSrvUri(uri: string): Promise<string> {
  const m = /^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(uri);
  if (!m) return uri;
  const [, userinfo, host, dbPath = '', query = ''] = m;

  const resolver = new dns.promises.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => []),
  ]);

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
  const txtParams = txtRecords.map((chunks) => chunks.join('')).join('&');

  const params = new URLSearchParams(query.replace(/^\?/, ''));
  params.set('tls', 'true');
  for (const pair of txtParams.split('&')) {
    const [k, v] = pair.split('=');
    if (k && v && !params.has(k)) params.set(k, v);
  }

  return `mongodb://${userinfo}@${hosts}${dbPath}?${params.toString()}`;
}

let resolvedUriPromise: Promise<string> | null = null;

function resolvedUri(): Promise<string> {
  if (!rawUri) return Promise.reject(new Error('MONGODB_URI is not set'));
  if (!resolvedUriPromise) {
    resolvedUriPromise = rawUri.startsWith('mongodb+srv://')
      ? resolveSrvUri(rawUri).catch((e) => {
          console.error('Manual SRV resolution failed, falling back to driver default', e);
          return rawUri;
        })
      : Promise.resolve(rawUri);
  }
  return resolvedUriPromise;
}

async function client(): Promise<MongoClient> {
  if (!global._omdaMongoClientPromise) {
    global._omdaMongoClientPromise = resolvedUri().then((uri) => new MongoClient(uri).connect());
  }
  return global._omdaMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await client();
  // Database name comes from the connection string path, or defaults to "omdafit".
  return c.db(process.env.MONGODB_DB || 'omdafit');
}

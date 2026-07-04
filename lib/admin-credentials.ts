export type OmdaAdminCredential = {
  label: string;
  role: 'full' | 'swim';
  password: string;
  scope: string;
};

// Fallback keys used only when the ADMIN_KEY / SWIM_ADMIN_KEY env vars are not
// set. CHANGE THESE (or, better, set the env vars) before going live — anyone
// who knows them can open /admin.
export const DEFAULT_ADMIN_KEY = 'change-me-admin-key';
export const DEFAULT_SWIM_ADMIN_KEY = 'change-me-swim-key';

export function getAdminKey() {
  return process.env.ADMIN_KEY || DEFAULT_ADMIN_KEY;
}

export function getSwimAdminKey() {
  return process.env.SWIM_ADMIN_KEY || DEFAULT_SWIM_ADMIN_KEY;
}

export function getOmdaAdminCredentials(): OmdaAdminCredential[] {
  return [
    {
      label: 'OmdaFit owner / main coach',
      role: 'full',
      password: getAdminKey(),
      scope: 'Full /admin access: approvals, pricing, content, Telegram',
    },
    {
      label: 'Swimming coach',
      role: 'swim',
      password: getSwimAdminKey(),
      scope: 'Swimmers Bundle orders only',
    },
  ];
}

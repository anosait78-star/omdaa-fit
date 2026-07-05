import type { Order } from './store';
import { findOrder, recordApproval, recordRejection, getOrderImages, IMAGE_KEYS } from './store';
import { toIntlDigits } from './site';
import { getDb } from './mongo';

type InlineButton = { text: string; callback_data?: string; url?: string };
type InlineKeyboard = { inline_keyboard: InlineButton[][] };

let botUsername: string | null = null;

function token() {
  return process.env.OMDAFIT_TELEGRAM_BOT_TOKEN || '';
}

function configured() {
  return !!token();
}

function api(method: string) {
  return `https://api.telegram.org/bot${token()}/${method}`;
}

async function settingsCol() {
  const db = await getDb();
  return db.collection<{ key: string; data: unknown }>('settings');
}

async function getSetting<T>(key: string): Promise<T | null> {
  const col = await settingsCol();
  const doc = await col.findOne({ key });
  return (doc?.data as T) ?? null;
}

async function setSetting(key: string, data: unknown) {
  const col = await settingsCol();
  await col.updateOne({ key }, { $set: { data, updatedAt: new Date() } }, { upsert: true });
}

async function deleteSetting(key: string) {
  const col = await settingsCol();
  await col.deleteOne({ key });
}

async function resolveBotUsername() {
  if (botUsername || !configured()) return botUsername;
  try {
    const res = await fetch(api('getMe'));
    const data: any = await res.json().catch(() => null);
    botUsername = data?.result?.username || null;
  } catch {
    botUsername = null;
  }
  return botUsername;
}

async function sendToChat(chatId: string, text: string, replyMarkup?: InlineKeyboard) {
  if (!configured()) return;
  try {
    await fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
  } catch {
    /* best-effort */
  }
}

/** Upload a base64 data-URL image to the chat (Telegram needs multipart). */
async function sendPhoto(chatId: string, dataUrl: string, caption?: string) {
  if (!configured()) return;
  try {
    const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(dataUrl || '');
    if (!m) return;
    const buf = Buffer.from(m[2], 'base64');
    const ext = m[1].split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
    const form = new FormData();
    form.append('chat_id', chatId);
    if (caption) form.append('caption', caption);
    form.append('photo', new Blob([buf], { type: m[1] }), `photo.${ext}`);
    await fetch(api('sendPhoto'), { method: 'POST', body: form });
  } catch {
    /* best-effort — a bad image shouldn't break the flow */
  }
}

/** Acknowledge a button tap so Telegram stops the loading spinner. */
async function answerCallback(callbackId: string, text?: string) {
  if (!configured()) return;
  try {
    await fetch(api('answerCallbackQuery'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackId, ...(text ? { text } : {}) }),
    });
  } catch {
    /* best-effort */
  }
}

/* ── Conversation state (single connected chat) ────────────────────────────
   Stored in omda_settings so the "type the rejection reason" step survives the
   stateless serverless webhook between two Telegram updates. */
async function getState() {
  return (await getSetting<{ awaitingRejectFor?: string }>('telegram_state').catch(() => null)) || null;
}
async function setState(state: { awaitingRejectFor?: string }) {
  await setSetting('telegram_state', state);
}
async function clearState() {
  await deleteSetting('telegram_state').catch(() => undefined);
}

const isSwimmers = (o: { bundle?: string | null; planId?: string }) =>
  o.bundle === 'swimmers' || String(o.planId || '').startsWith('swim');

/** Readable, sectioned summary of a new order for Telegram. */
function orderSummary(order: Order): string {
  const measures =
    order.heightCm || order.weightKg
      ? `${order.heightCm ?? '—'} سم / ${order.weightKg ?? '—'} كجم`
      : null;
  return [
    '🔔 طلب اشتراك جديد في عُمدة',
    isSwimmers(order) ? '🏊 باقة السبّاحين' : null,
    `🔖 ${order.reference}`,
    '',
    `👤 الاسم: ${order.customerName}`,
    `📱 الموبايل: ${order.customerPhone}`,
    order.customerEmail ? `✉️ الإيميل: ${order.customerEmail}` : null,
    `📦 الباقة: ${order.months} شهر — ${order.amountEGP.toLocaleString()} ج.م`,
    order.payerHandle ? `💳 دفع من: ${order.payerHandle}` : null,
    '',
    '— بيانات العميل —',
    order.gender ? `• النوع: ${order.gender}` : null,
    order.age ? `• السن: ${order.age}` : null,
    measures ? `• القياسات: ${measures}` : null,
    order.trainingDays ? `• أيام التمرين: ${order.trainingDays}/أسبوع` : null,
    order.trainingDaysNotes ? `• الأيام المحددة: ${order.trainingDaysNotes}` : null,
    order.goal ? `🎯 الهدف: ${order.goal}` : null,
    order.sport ? `• الرياضة: ${order.sport}` : null,
    order.sportMetrics ? `• الأداء: ${order.sportMetrics}` : null,
    order.illness ? `⚕️ أمراض/إصابات: ${order.illness}` : null,
    order.supplements ? `💊 مكملات: ${order.supplements}` : null,
    order.notes ? `📝 ملاحظات: ${order.notes}` : null,
    '',
    '👇 راجع الصور تحت، وبعدين اقبل أو ارفض من الأزرار.',
  ]
    .filter((l) => l != null)
    .join('\n');
}

/** Notify the coach via Telegram that an order was approved. */
async function sendApproval(chatId: string, order: Order) {
  await sendToChat(
    chatId,
    [
      '✅ تم قبول الطلب',
      `🔖 ${order.reference} · ${order.customerName}`,
      'تواصل مع العميل على واتساب وابعتله بيانات اشتراكه.',
    ].join('\n'),
  );
}

function helpMessage() {
  return [
    '🤖 بوت عُمدة',
    '',
    'لما يجيلك طلب اشتراك جديد هيوصلك هنا أوتوماتيك:',
    '• كل بيانات العميل',
    '• كل الصور (إن بودي، صور الجسم، الإيصال)',
    '• زرار ✅ قبول وزرار ❌ رفض',
    '',
    'لما تضغط قبول → الطلب يتفعل وتقدر تتواصل مع العميل على واتساب.',
    'لما تضغط رفض → هيطلب منك سبب الرفض، وبعدها زرار واتساب لإبلاغ العميل.',
    '',
    'الأوامر:',
    '/credentials — رابط لوحة الأدمن',
    '/help — المساعدة دي',
  ].join('\n');
}

/**
 * Passwords are now hashed in MongoDB (no plaintext to show), so this just
 * points the coach to the login page — the email/password were set up when
 * the account was created (ADMIN_EMAIL/ADMIN_PASSWORD, or reset from /admin).
 */
function credentialsMessage() {
  return [
    'بيانات دخول OmdaFit admin',
    'https://omdafit.vercel.app/admin',
    '',
    'سجّل دخولك بالإيميل والباسورد اللي ضبطتهم وقت الإعداد.',
  ].join('\n');
}

async function getConnectedChatId() {
  const saved = await getSetting<{ chatId?: string }>('telegram').catch(() => null);
  return saved?.chatId ? String(saved.chatId) : null;
}

export async function getTelegramLink(baseUrl: string) {
  if (!configured()) return { configured: false, connected: false, link: null };

  try {
    await fetch(api('setWebhook'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook`, allowed_updates: ['message', 'callback_query'] }),
    });
    await fetch(api('setMyCommands'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'credentials', description: 'Show OmdaFit admin passwords' },
          { command: 'help', description: 'Show OmdaFit bot commands' },
        ],
      }),
    });
  } catch {
    /* best-effort: Telegram can still be linked if webhook was already set */
  }

  const username = await resolveBotUsername();
  const saved = await getSetting<{ chatId?: string }>('telegram');
  return {
    configured: true,
    connected: !!saved?.chatId,
    link: username ? `https://t.me/${username}?start=omdafit` : null,
  };
}

export async function disconnectTelegram() {
  const saved = await getSetting<{ chatId?: string }>('telegram').catch(() => null);
  if (saved?.chatId) {
    await sendToChat(
      saved.chatId,
      'تم فصل إشعارات OmdaFit من هذا الشات.\nOmdaFit notifications have been disconnected from this chat.',
    );
  }
  await deleteSetting('telegram');
  return { ok: true, connected: false };
}

export async function handleTelegramUpdate(update: any) {
  // ── Button taps (Approve / Reject) ──
  if (update?.callback_query) {
    return handleCallback(update.callback_query);
  }

  const msg = update?.message;
  const chatId = msg?.chat?.id;
  const text = String(msg?.text || '');
  if (!chatId) return { ok: true };
  const chatIdText = String(chatId);
  const connectedChatId = await getConnectedChatId();

  if (/^\/start(?:\s+omdafit)?\b/.test(text)) {
    if (connectedChatId && connectedChatId !== chatIdText) {
      await sendToChat(
        chatIdText,
        'OmdaFit is already connected to another Telegram chat. Disconnect it from /admin first.',
      );
      return { ok: true };
    }

    await setSetting('telegram', { chatId: chatIdText, connectedAt: new Date().toISOString() });
    await sendToChat(
      chatIdText,
      [
        'تم ربط OmdaFit بنجاح. أي طلب عميل جديد هيوصل هنا فوراً.',
        'OmdaFit connected. New client requests will arrive here.',
        '',
        helpMessage(),
      ].join('\n'),
    );
    return { ok: true };
  }

  if (/^\/(?:credentials|creds|passwords)(?:@\w+)?\b/i.test(text)) {
    if (connectedChatId !== chatIdText) {
      await sendToChat(chatIdText, 'Unauthorized. Connect this chat from OmdaFit /admin first.');
      return { ok: true };
    }
    await sendToChat(chatIdText, credentialsMessage());
    return { ok: true };
  }

  if (/^\/help(?:@\w+)?\b/i.test(text)) {
    if (connectedChatId === chatIdText) {
      await sendToChat(chatIdText, helpMessage());
    }
    return { ok: true };
  }

  if (/^\/cancel\b/i.test(text)) {
    await clearState();
    if (connectedChatId === chatIdText) await sendToChat(chatIdText, 'تم الإلغاء.');
    return { ok: true };
  }

  // ── Reject-reason step: any plain text while we're awaiting a reason ──
  if (connectedChatId === chatIdText) {
    const state = await getState();
    if (state?.awaitingRejectFor && text.trim() && !text.startsWith('/')) {
      const reason = text.trim();
      if (reason.length < 3) {
        await sendToChat(chatIdText, 'اكتب سبب واضح (3 أحرف على الأقل) أو /cancel للإلغاء.');
        return { ok: true };
      }
      const order = await findOrder(state.awaitingRejectFor);
      await clearState();
      if (!order) {
        await sendToChat(chatIdText, 'الطلب لم يعد موجوداً.');
        return { ok: true };
      }
      await recordRejection(order.id, reason);
      const digits = toIntlDigits(order.customerPhone || '');
      const waMsg = `مرحبا ${order.customerName}، بخصوص طلبك في عُمدة (${order.reference}) — للأسف محتاج تعديل:\n${reason}\n\nياريت تظبط ده وتبعتلنا تاني. لو عندك أي استفسار اكتبلنا هنا.`;
      const waLink = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(waMsg)}` : null;
      await sendToChat(
        chatIdText,
        [`❌ تم رفض طلب ${order.customerName}`, `🔖 ${order.reference}`, '', `السبب: ${reason}`].join('\n'),
        waLink ? { inline_keyboard: [[{ text: '📲 إبلاغ العميل على واتساب', url: waLink }]] } : undefined,
      );
      return { ok: true };
    }
  }

  return { ok: true };
}

/** Handle an Approve/Reject button tap from the order message. */
async function handleCallback(cb: any) {
  const chatId = String(cb?.message?.chat?.id || '');
  const data = String(cb?.data || '');
  const connectedChatId = await getConnectedChatId();
  if (!chatId || connectedChatId !== chatId) {
    await answerCallback(cb?.id, 'Unauthorized');
    return { ok: true };
  }
  const [action, orderId] = data.split(':');
  const order = await findOrder(orderId || '');
  if (!order) {
    await answerCallback(cb.id, 'الطلب غير موجود');
    return { ok: true };
  }

  if (action === 'approve') {
    await answerCallback(cb.id, 'جاري قبول الطلب…');
    if (order.status === 'ACTIVE') {
      await sendApproval(chatId, order);
      return { ok: true };
    }
    const updated = await recordApproval(order.id);
    await sendApproval(chatId, updated || order);
    return { ok: true };
  }

  if (action === 'reject') {
    await answerCallback(cb.id);
    await setState({ awaitingRejectFor: order.id });
    await sendToChat(
      chatId,
      `✍️ اكتب سبب رفض طلب ${order.customerName} (${order.reference}).\nالعميل هيشوف السبب ده. اكتب /cancel للإلغاء.`,
    );
    return { ok: true };
  }

  await answerCallback(cb.id);
  return { ok: true };
}

export async function notifyNewOrder(order: Order) {
  if (!configured()) return;
  const saved = await getSetting<{ chatId?: string }>('telegram').catch(() => null);
  if (!saved?.chatId) return;
  const chatId = String(saved.chatId);

  // 1) Full, readable request summary + Approve / Reject buttons.
  await sendToChat(chatId, orderSummary(order), {
    inline_keyboard: [
      [{ text: '✅ قبول الطلب', callback_data: `approve:${order.id}` }],
      [{ text: '❌ رفض الطلب', callback_data: `reject:${order.id}` }],
    ],
  });

  // 2) Every photo the customer uploaded, captioned, so the coach reviews
  //    everything inside Telegram without opening the admin panel.
  try {
    const images = await getOrderImages(order.id);
    if (images) {
      const labels: Record<string, string> = {
        inbody: '📊 إن بودي / InBody',
        photoFront: '🧍 أمامي / Front',
        photoBack: '🧍 خلفي / Back',
        photoSideRight: '🧍 يمين / Right',
        photoSideLeft: '🧍 يسار / Left',
        receipt: '🧾 الإيصال / Receipt',
      };
      for (const key of IMAGE_KEYS) {
        const src = images[key];
        if (src) await sendPhoto(chatId, src, `${labels[key] || key} — ${order.reference}`);
      }
    }
  } catch {
    /* best-effort: photos are a bonus, the summary + buttons already arrived */
  }
}

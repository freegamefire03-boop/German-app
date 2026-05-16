// Cloudflare Worker — Push notifications + progress sync for Deutsch Lernen PWA
// KV namespace binding: DEUTSCH_PROGRESS (set in wrangler.toml)

// VAPID keys come from secrets or env vars (set via wrangler secret put)
// VAPID_PUBLIC_KEY  — public key for push subscription
// VAPID_PRIVATE_KEY — private key for sending push notifications
// VAPID_SUBJECT    — mailto: or https:// contact URI

const WEB_PUSH_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── Helper: send Web Push notification ─────────────────────────────
async function sendPushNotification(subscription, title, body, icon, url) {
  if (!subscription || !subscription.endpoint) return false;

  const payload = JSON.stringify({ title, body, icon, url });
  const encrypted = await encryptPayload(payload, subscription);

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Content-Encoding': 'aes128gcm',
      ...encrypted.headers,
    },
    body: encrypted.body,
  });

  // If subscription expired, delete it
  if (res.status === 410) {
    await DEUTSCH_PROGRESS.delete('pushSubscription');
  }
  return res.ok;
}

// ─── Web Push encryption (minimal implementation) ───────────────────
async function encryptPayload(payload, subscription) {
  const key = subscription.keys;
  if (!key) {
    // Unencrypted fallback for some push services
    return { headers: {}, body: new TextEncoder().encode(payload) };
  }

  const p256dh = base64UrlToBuffer(key.p256dh);
  const auth = base64UrlToBuffer(key.auth);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );

  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', publicKey: await crypto.subtle.importKey('raw', p256dh, { name: 'ECDH', namedCurve: 'P-256' }, false, []), privateKey: serverKeyPair.privateKey },
    256
  );

  const clientPublicKey = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);

  const prk = await hkdf(auth, new Uint8Array(sharedSecret), new TextEncoder().encode('WebPush: info\0'), 32);
  const ce = await hkdf(salt, prk, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, prk, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);

  const plaintext = new TextEncoder().encode(payload);
  const recordSize = 4096;
  const padding = recordSize - (plaintext.length + 1);
  const padded = new Uint8Array(plaintext.length + 1 + padding);
  padded.set(plaintext, 0);
  padded[plaintext.length] = 2; // padding delimiter

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: new Uint8Array(recordSize.toString().padStart(2, '0').split('').map(Number)) },
    await crypto.subtle.importKey('raw', ce, 'AES-GCM', false, ['encrypt']),
    padded
  );

  const body = new Uint8Array(3 + salt.length + clientPublicKey.length + new Uint8Array(encrypted).length);
  body[0] = (salt.length) >>> 8;
  body[1] = (salt.length) & 0xff;
  body[2] = (salt.length) >>> 0;
  body.set(salt, 3);
  body.set(new Uint8Array(clientPublicKey), 3 + salt.length);
  body.set(new Uint8Array(encrypted), 3 + salt.length + clientPublicKey.length);

  return { headers: { 'Content-Encoding': 'aes128gcm' }, body };
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', salt, info, hash: 'SHA-256' }, key, length * 8
  );
  return new Uint8Array(bits);
}

function base64UrlToBuffer(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

// ─── Notification message builder ───────────────────────────────────
function buildNotification(progress, timeOfDay) {
  const { lastStudyDate, streak, minutesToday } = progress;
  const today = new Date().toISOString().slice(0, 10);
  const studiedToday = lastStudyDate === today && minutesToday > 0;

  const time = timeOfDay || getTimeOfDay();

  if (studiedToday && minutesToday >= 10) return null; // Already done

  if (studiedToday && minutesToday < 10) {
    const remaining = 10 - minutesToday;
    const msgs = [
      'Almost there! ' + remaining + ' more min to lock in your ' + streak + '-day streak 🔥',
      'You did ' + minutesToday + ' min — just ' + remaining + ' more to go! 💪',
      'So close! ' + remaining + ' min and your streak is safe 🛡️',
    ];
    return { title: 'Keep going!', body: msgs[Math.floor(Math.random() * msgs.length)], icon: '/assets/icons/icon-192.png', url: '/apps/flashcards/' };
  }

  if (streak > 0) {
    const urgentMsgs = [
      'Your ' + streak + '-day streak is at risk! A quick 10 min is all it takes ⏳',
      '⚠️ ' + streak + '-day streak will reset! Open the app now to save it.',
      'Don\'t lose your ' + streak + '-day streak! 10 min and you\'re good 🔥',
    ];
    return { title: 'Streak at risk!', body: urgentMsgs[Math.floor(Math.random() * urgentMsgs.length)], icon: '/assets/icons/icon-192.png', url: '/apps/flashcards/' };
  }

  const welcomeMsgs = [
    'Start your streak today! 10 min of German practice 🎯',
    'Ready to learn? Open the app for a quick session 🇩🇪',
    'A new day, a new word! Practice makes progress 📚',
  ];
  return { title: 'Deutsch Lernen', body: welcomeMsgs[Math.floor(Math.random() * welcomeMsgs.length)], icon: '/assets/icons/icon-192.png', url: '/apps/flashcards/' };
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ─── Cron handler ───────────────────────────────────────────────────
async function handleCron() {
  const progress = await DEUTSCH_PROGRESS.get('progress', 'json') || { lastStudyDate: null, streak: 0, minutesToday: 0 };
  const subscription = await DEUTSCH_PROGRESS.get('pushSubscription', 'json');
  if (!subscription) return;

  // Don't send during first cron run of the day if user already studied
  const lastNotif = await DEUTSCH_PROGRESS.get('lastNotificationDate');
  const today = new Date().toISOString().slice(0, 10);
  if (lastNotif === today && progress.lastStudyDate === today) return;

  const notif = buildNotification(progress);
  if (!notif) return;

  await sendPushNotification(subscription, notif.title, notif.body, notif.icon, notif.url);
  await DEUTSCH_PROGRESS.put('lastNotificationDate', today);
}

// ─── Request handler ────────────────────────────────────────────────
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: WEB_PUSH_HEADERS });
  }

  // POST /subscribe — store push subscription
  if (path === '/subscribe' && request.method === 'POST') {
    try {
      const body = await request.json();
      await DEUTSCH_PROGRESS.put('pushSubscription', JSON.stringify(body.subscription));
      return new Response(JSON.stringify({ ok: true }), { headers: WEB_PUSH_HEADERS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: WEB_PUSH_HEADERS });
    }
  }

  // POST /progress — store session progress
  if (path === '/progress' && request.method === 'POST') {
    try {
      const body = await request.json();
      const existing = await DEUTSCH_PROGRESS.get('progress', 'json') || {};

      // Merge progress
      const merged = {
        lastStudyDate: body.date || existing.lastStudyDate,
        streak: body.streak || existing.streak || 0,
        minutesToday: body.minutes || existing.minutesToday || 0,
        wordsPassed: (existing.wordsPassed || 0) + (body.wordsPassed || 0),
        genderMastered: (existing.genderMastered || 0) + (body.genderMastered || 0),
        pluralMastered: (existing.pluralMastered || 0) + (body.pluralMastered || 0),
      };

      await DEUTSCH_PROGRESS.put('progress', JSON.stringify(merged));
      return new Response(JSON.stringify({ ok: true, streak: merged.streak }), { headers: WEB_PUSH_HEADERS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: WEB_PUSH_HEADERS });
    }
  }

  // GET /status — check subscription health
  if (path === '/status' && request.method === 'GET') {
    const sub = await DEUTSCH_PROGRESS.get('pushSubscription', 'json');
    const progress = await DEUTSCH_PROGRESS.get('progress', 'json');
    return new Response(JSON.stringify({
      subscribed: !!sub,
      hasProgress: !!progress,
    }), { headers: WEB_PUSH_HEADERS });
  }

  return new Response('Not found', { status: 404 });
}

// ─── Entry ──────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    // Make KV binding available globally in this module
    globalThis.DEUTSCH_PROGRESS = env.DEUTSCH_PROGRESS;
    return handleRequest(request);
  },
  async scheduled(event, env, ctx) {
    globalThis.DEUTSCH_PROGRESS = env.DEUTSCH_PROGRESS;
    ctx.waitUntil(handleCron());
  },
};

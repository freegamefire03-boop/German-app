const CONFIG = {
  // After deploying the Cloudflare Worker, paste its URL here:
  WORKER_URL: 'https://your-worker.your-subdomain.workers.dev',

  // Generated via: npx web-push generate-vapid-keys
  VAPID_PUBLIC_KEY: 'YOUR_VAPID_PUBLIC_KEY_HERE',

  TIMER_DURATION: 600, // 10 minutes in seconds
};

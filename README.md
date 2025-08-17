# Paystack + GitHub Pages + Render (Node/Express)

A production-ready example:
- **Frontend**: GitHub Pages (static) in `frontend/`
- **Backend**: Render (Node/Express) in `backend/`
- **Payments**: Paystack transaction initialize + verify + webhook

## Quick Start

### 1) Backend on Render
1. Create a new private GitHub repo and push `backend/`.
2. On Render: **New Web Service** → connect repo.
3. Runtime: **Node**. Start command: `npm start`.
4. Env Var: add `PAYSTACK_SECRET_KEY` (from Paystack Dashboard).
5. Deploy → you get a URL like `https://your-app.onrender.com`.
6. (Optional) Add a custom domain later.

**CORS**: Edit `backend/server.js` → `allowedOrigins` to include your GitHub Pages origin:
```
'https://<your-username>.github.io',
'https://<your-username>.github.io/<your-repo>',
```

**Webhook** (optional but recommended):
- Set in Paystack Dashboard → `https://your-app.onrender.com/api/paystack/webhook`.

### 2) Frontend on GitHub Pages
1. Push `frontend/` into a public repo.
2. In `frontend/app.js` and `frontend/verify.js`, set:
```
const API_BASE = "https://your-app.onrender.com";
```
3. Enable GitHub Pages for that repo (Settings → Pages → Deploy from branch).
4. Visit `https://<username>.github.io/<repo>/`.

### 3) Test Payment
- Use **test keys** first.
- Enter email + amount (NGN) and pay.
- After redirect, `success.html` verifies the transaction via your backend.

## Security Notes
- Never put `PAYSTACK_SECRET_KEY` in the frontend or commit it to Git.
- Verify webhooks using `x-paystack-signature` (already implemented).
- Lock CORS to your exact Pages origin(s).
- Consider logging orders server-side before initialization and reconciling on webhook.

## Files
- `backend/server.js` — Express app with initialize/verify/webhook
- `backend/package.json` — dependencies and start script
- `backend/.env.example` — copy to `.env` locally (Render uses dashboard env vars)
- `frontend/index.html` — main page
- `frontend/styles.css` — modern, responsive design
- `frontend/app.js` — init payment/redirect
- `frontend/success.html` + `frontend/verify.js` — post-payment verification
- `frontend/cancel.html` — cancel page

---

Made for a clean GitHub Pages + Render split while keeping secrets safe.

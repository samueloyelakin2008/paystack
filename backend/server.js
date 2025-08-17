require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();

// Capture raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.use(helmet());

// CORS — set this to your GitHub Pages origin(s)
const allowedOrigins = [
  'https://<your-username>.github.io',
  'https://<your-username>.github.io/<your-repo>',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/server-to-server
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));

// Basic rate limit for public endpoints
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api/', limiter);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  console.error('Missing PAYSTACK_SECRET_KEY in env');
  process.exit(1);
}

const PAYSTACK_API = 'https://api.paystack.co';

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Paystack backend running' });
});

// Initialize transaction
app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { email, amount, currency = 'NGN', callback_url } = req.body || {};
    if (!email || !amount) {
      return res.status(400).json({ error: 'email and amount are required' });
    }

    const amountInKobo = Math.round(Number(amount) * 100);

    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      { email, amount: amountInKobo, currency, callback_url },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    res.json(response.data);
  } catch (err) {
    const e = err?.response?.data || { message: err.message };
    console.error('Initialize error:', e);
    res.status(500).json({ error: 'Failed to initialize transaction', details: e });
  }
});

// Verify transaction
app.get('/api/paystack/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    res.json(response.data);
  } catch (err) {
    const e = err?.response?.data || { message: err.message };
    console.error('Verify error:', e);
    res.status(500).json({ error: 'Failed to verify transaction', details: e });
  }
});

// Paystack webhook
app.post('/api/paystack/webhook', (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const computed = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex');
    if (signature !== computed) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    // TODO: handle event.data.status === 'success' etc.
    // e.g., update your database with event.data.reference
    console.log('Webhook event:', event?.event, event?.data?.reference);

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server running on port', PORT));

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();

// --- Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// --- Stripe init
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = (STRIPE_KEY && STRIPE_KEY.startsWith('sk_')) ? new Stripe(STRIPE_KEY) : null;

// --- Debug memory
const recent = { lastEmail: null, lastEventTypes: [] };

// --- Webhook
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) return res.status(500).json({ ok: false });
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, secret);
    recent.lastEventTypes.push(event.type);
    if (recent.lastEventTypes.length > 40) recent.lastEventTypes.shift();
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      recent.lastEmail = s.customer_details?.email || null;
      console.log('[Stripe] checkout.session.completed for', recent.lastEmail);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// --- Checkout session
app.post('/api/v1/checkout/session', async (req, res) => {
  try {
    const priceId = req.body.priceId || process.env.PRICE_ID;
    const email = req.body.email || 'test@example.com';
    if (!priceId) return res.status(400).json({ ok: false, message: 'Missing priceId' });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_WEB_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_WEB_URL || 'http://localhost:3000'}/onboarding/cancel`
    });
    res.json({ ok: true, data: { url: session.url } });
  } catch (e) {
    console.error('[checkout/session] error:', e.message);
    res.status(400).json({ ok: false, message: 'Could not create session' });
  }
});

// --- Billing portal
app.post('/api/v1/billing/portal', async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) return res.status(400).json({ ok: false, message: 'Missing email' });
    const { data } = await stripe.customers.list({ email, limit: 1 });
    if (!data.length) return res.status(404).json({ ok: false, message: 'Customer not found' });
    const portal = await stripe.billingPortal.sessions.create({
      customer: data[0].id,
      return_url: (process.env.APP_WEB_URL || 'http://localhost:3000') + '/account'
    });
    res.json({ ok: true, url: portal.url });
  } catch (e) {
    console.error('[billing/portal] error:', e.message);
    res.status(400).json({ ok: false, message: 'Could not create portal session' });
  }
});

// --- Subscription status
app.get('/api/v1/subscription/status', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ ok: false, message: 'Missing email' });
    const { data: customers } = await stripe.customers.list({ email, limit: 1 });
    if (!customers.length) return res.status(404).json({ ok: false, message: 'Customer not found' });
    const customerId = customers[0].id;
    const { data: subs } = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 });
    if (!subs.length) return res.json({ ok: true, email, status: 'none', subscription: null });
    const s = subs[0];
    const item = s.items?.data?.[0];
    const price = item?.price || null;
    res.json({
      ok: true,
      email,
      status: s.status,
      current_period_end: s.current_period_end,
      subscription_id: s.id,
      price: price ? { id: price.id, currency: price.currency, unit_amount: price.unit_amount } : null
    });
  } catch (e) {
    console.error('[status] error:', e.message);
    res.status(400).json({ ok: false, message: 'Could not fetch status' });
  }
});

// --- Cancel subscription
app.post('/api/v1/subscription/cancel', async (req, res) => {
  try {
    const email = req.body.email;
    const atPeriodEnd = !!req.body.atPeriodEnd;
    if (!email) return res.status(400).json({ ok: false, message: 'Missing email' });
    const { data: customers } = await stripe.customers.list({ email, limit: 1 });
    if (!customers.length) return res.status(404).json({ ok: false, message: 'Customer not found' });
    const { data: subs } = await stripe.subscriptions.list({ customer: customers[0].id, status: 'active', limit: 1 });
    if (!subs.length) return res.status(404).json({ ok: false, message: 'No active subscription' });
    const sub = subs[0];
    let result;
    if (atPeriodEnd) {
      result = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
      return res.json({ ok: true, mode: 'at_period_end', id: result.id, status: result.status });
    } else {
      result = await stripe.subscriptions.del(sub.id);
      return res.json({ ok: true, mode: 'immediate', id: result.id, status: result.status });
    }
  } catch (e) {
    console.error('[subscription/cancel] error:', e.message);
    res.status(400).json({ ok: false, message: 'Could not cancel subscription' });
  }
});

// --- Debug + Health
app.get('/api/v1/debug/stripe', (_req, res) => res.json({ ok: true, lastEmail: recent.lastEmail, lastEventTypes: recent.lastEventTypes }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- Start
const PORT = process.env.PORT || 8083;
const HOST = process.env.HOST || '127.0.0.1';
console.log('[BOOT clean] server starting…');
app.listen(PORT, HOST, () => console.log('[API] listening on', PORT, 'host', HOST));

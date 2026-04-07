import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { priceId, serviceId } = req.body;
  if (!priceId || !serviceId) return res.status(400).json({ error: 'Missing parameters' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || 'https://chintai-support.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}&svc=${serviceId}`,
      cancel_url: `${origin}/`,
      locale: 'ja',
      payment_method_types: ['card'],
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

import { Router, type IRouter } from 'express';
import { stripeStorage } from '../stripeStorage';
import { getUncachableStripeClient } from '../stripeClient';

const router: IRouter = Router();

router.get('/stripe/plans', async (_req, res) => {
  try {
    const rows = await stripeStorage.listProductsWithPrices();

    const productsMap = new Map<string, { id: string; name: string; description: string | null; prices: object[] }>();
    for (const row of rows as any[]) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          prices: [],
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id)!.prices.push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }

    res.json({ data: Array.from(productsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/checkout', async (req, res) => {
  try {
    const { priceId, email } = req.body as { priceId: string; email: string };
    if (!priceId || !email) {
      res.status(400).json({ error: 'priceId and email are required' });
      return;
    }

    const stripe = await getUncachableStripeClient();

    let user = await stripeStorage.getUserByEmail(email);
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { email } });
      customerId = customer.id;
      await stripeStorage.upsertUser({
        id: customerId,
        email,
        stripeCustomerId: customerId,
      });
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/portal', async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    const user = await stripeStorage.getUserByEmail(email);
    if (!user?.stripeCustomerId) {
      res.status(404).json({ error: 'No billing account found for this email' });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

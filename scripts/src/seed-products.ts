import { getUncachableStripeClient } from './stripeClient';

const PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for individual recruiters. Unlimited roles, 50 AI screenings per month.',
    monthlyAmount: 900,
    yearlyAmount: 8640,
    metadata: { plan: 'starter', screenings_per_month: '50' },
  },
  {
    name: 'Pro',
    description: 'For growing teams. Unlimited roles, unlimited AI screenings, batch processing, priority AI.',
    monthlyAmount: 1900,
    yearlyAmount: 18240,
    metadata: { plan: 'pro', screenings_per_month: 'unlimited' },
  },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('Creating HireRight AI subscription plans in Stripe...\n');

  for (const plan of PLANS) {
    const existing = await stripe.products.search({
      query: `name:'${plan.name}' AND active:'true'`,
    });

    if (existing.data.length > 0) {
      console.log(`✓ "${plan.name}" already exists (${existing.data[0].id}) — skipping`);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata,
    });
    console.log(`✓ Created product: ${product.name} (${product.id})`);

    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyAmount,
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`  → Monthly: $${(plan.monthlyAmount / 100).toFixed(2)}/mo (${monthly.id})`);

    const yearly = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyAmount,
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log(`  → Yearly:  $${(plan.yearlyAmount / 100).toFixed(2)}/yr (${yearly.id})`);
  }

  console.log('\nDone! Webhooks will sync products to your database automatically.');
}

seedProducts().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

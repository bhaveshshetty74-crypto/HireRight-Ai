import { db, usersTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';

export class StripeStorage {
  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        WITH paginated_products AS (
          SELECT id, name, description, metadata, active
          FROM stripe.products
          WHERE active = ${active}
          ORDER BY id
        )
        SELECT
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM paginated_products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        ORDER BY p.name, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  }

  async upsertUser(data: { id: string; email: string; stripeCustomerId?: string; stripeSubscriptionId?: string; plan?: string }) {
    const [user] = await db
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: data.email,
          ...(data.stripeCustomerId ? { stripeCustomerId: data.stripeCustomerId } : {}),
          ...(data.stripeSubscriptionId ? { stripeSubscriptionId: data.stripeSubscriptionId } : {}),
          ...(data.plan ? { plan: data.plan } : {}),
        },
      })
      .returning();
    return user;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }
}

export const stripeStorage = new StripeStorage();

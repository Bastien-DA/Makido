import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialOrders1760000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE articles_category_enum AS ENUM ('BURGER', 'MENU', 'SIDE', 'DRINK', 'DESSERT', 'SAUCE');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(120) NOT NULL,
        description text,
        category articles_category_enum NOT NULL DEFAULT 'BURGER',
        price decimal(10,2) NOT NULL,
        "imageUrl" varchar,
        "isAvailable" boolean NOT NULL DEFAULT true,
        allergens text,
        customizations jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      "ALTER TABLE articles ADD COLUMN IF NOT EXISTS ingredients text[] NOT NULL DEFAULT '{}'",
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_counters (
        day date PRIMARY KEY,
        value integer NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "idempotencyKey" varchar NOT NULL UNIQUE,
        "requestHash" varchar NOT NULL,
        reference varchar NOT NULL,
        "shortReference" varchar NOT NULL,
        "createdAt" timestamptz(3) NOT NULL,
        "totalCents" bigint NOT NULL,
        items jsonb NOT NULL,
        "paymentConfirmed" boolean NOT NULL DEFAULT false,
        "ticketSent" boolean NOT NULL DEFAULT false,
        UNIQUE (reference, "createdAt")
      )
    `);
  }

  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Migration irréversible : sauvegarder les données et effectuer un retour arrière manuel.',
      ),
    );
  }
}

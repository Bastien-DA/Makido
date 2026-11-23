CREATE TYPE articles_category_enum AS ENUM (
    'BURGER',
    'MENU',
    'SIDE',
    'DRINK',
    'DESSERT',
    'SAUCE'
);

CREATE TABLE articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(120) NOT NULL,
    description text,
    category articles_category_enum NOT NULL DEFAULT 'BURGER',
    price numeric(10, 2) NOT NULL,
    "imageUrl" varchar,
    "isAvailable" boolean NOT NULL DEFAULT true,
    allergens text,
    customizations jsonb NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

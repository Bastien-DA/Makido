-- Demo articles, inserted manually after TypeORM initializes the schema.

WITH customization_templates (id, groups) AS (
    VALUES
        ('burger', '[
          {"id":"garniture","name":"Garniture supplémentaire","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"portion","name":"Portion supplémentaire de la garniture principale","additionalPrice":1.50}]},
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"ketchup","name":"Ketchup","additionalPrice":0.30},{"id":"mayonnaise","name":"Mayonnaise","additionalPrice":0.40},{"id":"barbecue","name":"Barbecue","additionalPrice":0.40}]}
        ]'::jsonb),
        ('burger-double', '[
          {"id":"garniture","name":"Garniture supplémentaire","minSelections":0,"maxSelections":1,"includedSelections":0,"options":[{"id":"portion","name":"Portion supplémentaire de la garniture principale","additionalPrice":1.50}]},
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"ketchup","name":"Ketchup","additionalPrice":0.30},{"id":"mayonnaise","name":"Mayonnaise","additionalPrice":0.40},{"id":"barbecue","name":"Barbecue","additionalPrice":0.40}]}
        ]'::jsonb),
        ('menu', '[
          {"id":"accompagnement","name":"Accompagnement","minSelections":1,"maxSelections":1,"includedSelections":1,"options":[{"id":"frites","name":"Frites maison","additionalPrice":0},{"id":"potatoes","name":"Potatoes aux herbes","additionalPrice":0}]},
          {"id":"boisson","name":"Boisson","minSelections":1,"maxSelections":1,"includedSelections":1,"options":[{"id":"cola-zero","name":"Cola zéro","additionalPrice":0},{"id":"citronnade","name":"Citronnade maison","additionalPrice":0},{"id":"the-peche","name":"Thé glacé pêche","additionalPrice":0}]}
        ]'::jsonb),
        ('side', '[
          {"id":"sauces","name":"Sauce","minSelections":0,"maxSelections":1,"includedSelections":0,"options":[{"id":"ketchup","name":"Ketchup","additionalPrice":0.30},{"id":"mayonnaise","name":"Mayonnaise","additionalPrice":0.40}]}
        ]'::jsonb),
        ('drink', '[
          {"id":"glacons","name":"Glaçons","minSelections":0,"maxSelections":1,"includedSelections":0,"options":[{"id":"glacons","name":"Avec glaçons","additionalPrice":0}]}
        ]'::jsonb),
        ('dessert', '[
          {"id":"supplement","name":"Supplément","minSelections":0,"maxSelections":1,"includedSelections":0,"options":[{"id":"chantilly","name":"Chantilly","additionalPrice":0.60}]}
        ]'::jsonb),
        ('sauce', '[
          {"id":"epices","name":"Épices","minSelections":0,"maxSelections":1,"includedSelections":0,"options":[{"id":"piment","name":"Piment","additionalPrice":0}]}
        ]'::jsonb)
)
INSERT INTO articles (
    "id",
    "name",
    "description",
    "category",
    "price",
    "imageUrl",
    "isAvailable",
    "allergens",
    "customizations",
    "createdAt",
    "updatedAt"
)
VALUES
    (
        '11111111-1111-4111-8111-111111111101',
        'Classic Cheese Burger',
        'Pain brioché, steak haché façon bouchère, cheddar affiné, oignons caramélisés et sauce maison.',
        'BURGER',
        7.50,
        'https://cdn.example.com/kiosk/burgers/classic-cheese.png',
        true,
        'gluten,lactose,oeufs,moutarde',
        (SELECT groups FROM customization_templates WHERE id = 'burger'),
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour'
    ),
    (
        '11111111-1111-4111-8111-111111111102',
        'Double Bacon BBQ',
        'Double steak, bacon grillé fumé, cheddar, sauce barbecue fumée.',
        'BURGER',
        9.90,
        'https://cdn.example.com/kiosk/burgers/double-bacon-bbq.png',
        true,
        'gluten,lactose,sulfites',
        (SELECT groups FROM customization_templates WHERE id = 'burger-double'),
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '3 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111103',
        'Menu Classic Cheese',
        'Classic Cheese Burger + Frites moyennes + Boisson 33cl au choix.',
        'MENU',
        10.90,
        'https://cdn.example.com/kiosk/menus/menu-classic-cheese.png',
        true,
        'gluten,lactose,oeufs,moutarde',
        (SELECT groups FROM customization_templates WHERE id = 'menu'),
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111104',
        'Frites Maison',
        'Frites croustillantes dorées à point, légèrement salées.',
        'SIDE',
        3.20,
        'https://cdn.example.com/kiosk/sides/fries.png',
        true,
        NULL,
        (SELECT groups FROM customization_templates WHERE id = 'side'),
        NOW() - INTERVAL '24 hours',
        NOW() - INTERVAL '24 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111105',
        'Cola Zéro 33cl',
        'Boisson gazeuse sans sucres servie bien fraîche.',
        'DRINK',
        2.50,
        'https://cdn.example.com/kiosk/drinks/cola-zero.png',
        true,
        NULL,
        (SELECT groups FROM customization_templates WHERE id = 'drink'),
        NOW() - INTERVAL '48 hours',
        NOW() - INTERVAL '48 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111106',
        'Crispy Chicken Burger',
        'Filet de poulet pané croustillant, coleslaw croquant, pickles et sauce moutarde au miel.',
        'BURGER',
        8.20,
        'https://cdn.example.com/kiosk/burgers/crispy-chicken.png',
        true,
        'gluten,lactose,oeufs,moutarde',
        (SELECT groups FROM customization_templates WHERE id = 'burger'),
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111107',
        'Veggie Mushroom Smash',
        'Galette champignons de Paris et légumineuses, emmental, roquette et sauce ail rôti.',
        'BURGER',
        8.00,
        'https://cdn.example.com/kiosk/burgers/veggie-mushroom-smash.png',
        true,
        'gluten,lactose,soja',
        (SELECT groups FROM customization_templates WHERE id = 'burger'),
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '4 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111108',
        'Blue Cheese & Truffle Burger',
        'Steak haché, fourme d''Ambert AOP, oignons confits et mayonnaise à la truffe.',
        'BURGER',
        10.50,
        'https://cdn.example.com/kiosk/burgers/blue-cheese-truffle.png',
        true,
        'gluten,lactose,oeufs',
        (SELECT groups FROM customization_templates WHERE id = 'burger'),
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111109',
        'Spicy Jalapeño Burger',
        'Double steak smashé, cheddar fort, piments jalapeños, tomates fraîches et sauce piquante.',
        'BURGER',
        9.40,
        'https://cdn.example.com/kiosk/burgers/spicy-jalapeno.png',
        true,
        'gluten,lactose,oeufs',
        (SELECT groups FROM customization_templates WHERE id = 'burger-double'),
        NOW() - INTERVAL '7 hours',
        NOW() - INTERVAL '7 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111110',
        'Menu Double Bacon BBQ',
        'Double Bacon BBQ + Frites Maison + Boisson 33cl au choix.',
        'MENU',
        13.20,
        'https://cdn.example.com/kiosk/menus/menu-double-bacon-bbq.png',
        true,
        'gluten,lactose,sulfites',
        (SELECT groups FROM customization_templates WHERE id = 'menu'),
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '8 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111111',
        'Menu Crispy Chicken',
        'Crispy Chicken Burger + Potatoes ou Frites + Boisson 33cl.',
        'MENU',
        11.50,
        'https://cdn.example.com/kiosk/menus/menu-crispy-chicken.png',
        true,
        'gluten,lactose,oeufs,moutarde',
        (SELECT groups FROM customization_templates WHERE id = 'menu'),
        NOW() - INTERVAL '9 hours',
        NOW() - INTERVAL '9 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111112',
        'Menu Veggie Gourmet',
        'Veggie Mushroom Smash + Frites Maison + Boisson 33cl.',
        'MENU',
        11.20,
        'https://cdn.example.com/kiosk/menus/menu-veggie-gourmet.png',
        true,
        'gluten,lactose,soja',
        (SELECT groups FROM customization_templates WHERE id = 'menu'),
        NOW() - INTERVAL '10 hours',
        NOW() - INTERVAL '10 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111113',
        'Potatoes aux Herbes',
        'Quartiers de pommes de terre rôtis au four avec romarin, ail et paprika doux.',
        'SIDE',
        3.60,
        'https://cdn.example.com/kiosk/sides/herb-potatoes.png',
        true,
        NULL,
        (SELECT groups FROM customization_templates WHERE id = 'side'),
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '12 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111114',
        'Onion Rings (x8)',
        'Huit rondelles d''oignon panées croustillantes servies chaudes.',
        'SIDE',
        4.20,
        'https://cdn.example.com/kiosk/sides/onion-rings.png',
        true,
        'gluten',
        (SELECT groups FROM customization_templates WHERE id = 'side'),
        NOW() - INTERVAL '14 hours',
        NOW() - INTERVAL '14 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111115',
        'Mozzarella Sticks (x6)',
        'Six bâtonnets de mozzarella fondante en panure dorée.',
        'SIDE',
        4.80,
        'https://cdn.example.com/kiosk/sides/mozzarella-sticks.png',
        false,
        'gluten,lactose',
        (SELECT groups FROM customization_templates WHERE id = 'side'),
        NOW() - INTERVAL '16 hours',
        NOW() - INTERVAL '16 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111116',
        'Citronnade Maison 33cl',
        'Citron pressé, eau pétillante, légère touche de sucre de canne et feuilles de menthe.',
        'DRINK',
        3.10,
        'https://cdn.example.com/kiosk/drinks/lemonade.png',
        true,
        NULL,
        (SELECT groups FROM customization_templates WHERE id = 'drink'),
        NOW() - INTERVAL '18 hours',
        NOW() - INTERVAL '18 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111117',
        'Thé Glacé Pêche 33cl',
        'Infusion de thé noir glacé aromatisée à la pêche blanche.',
        'DRINK',
        2.80,
        'https://cdn.example.com/kiosk/drinks/iced-tea-peach.png',
        true,
        NULL,
        (SELECT groups FROM customization_templates WHERE id = 'drink'),
        NOW() - INTERVAL '20 hours',
        NOW() - INTERVAL '20 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111118',
        'Milkshake Vanille Bourbon',
        'Glace vanille et lait frais mixés onctueusement, surmontés de chantilly.',
        'DESSERT',
        4.50,
        'https://cdn.example.com/kiosk/desserts/vanilla-milkshake.png',
        true,
        'lactose',
        (SELECT groups FROM customization_templates WHERE id = 'dessert'),
        NOW() - INTERVAL '22 hours',
        NOW() - INTERVAL '22 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111119',
        'Cookie Chocolat Noir & Noisette',
        'Cookie moelleux au cœur coulant, pépites de chocolat noir et éclats de noisettes torréfiées.',
        'DESSERT',
        3.40,
        'https://cdn.example.com/kiosk/desserts/choco-hazelnut-cookie.png',
        true,
        'gluten,lactose,oeufs,fruits_a_coque',
        (SELECT groups FROM customization_templates WHERE id = 'dessert'),
        NOW() - INTERVAL '26 hours',
        NOW() - INTERVAL '26 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111120',
        'Sauce Burger Maison',
        'Pot de sauce crémeuse relevée aux herbes, cornichons hachés et épices douces.',
        'SAUCE',
        0.90,
        'https://cdn.example.com/kiosk/sauces/house-burger-sauce.png',
        true,
        'oeufs,moutarde,sulfites',
        (SELECT groups FROM customization_templates WHERE id = 'sauce'),
        NOW() - INTERVAL '30 hours',
        NOW() - INTERVAL '30 hours'
    ),
    (
        '11111111-1111-4111-8111-111111111121',
        'Tokyo Saumon',
        'Pain de riz au sésame, saumon frais, avocat et concombre.',
        'BURGER',
        11.90,
        'https://cdn.example.com/kiosk/burgers/tokyo-saumon.png',
        true,
        'poisson,soja,sesame',
        '[
          {"id":"saumon","name":"Portions de saumon","minSelections":1,"maxSelections":3,"includedSelections":1,"options":[{"id":"morceau-saumon","name":"Morceau de saumon","additionalPrice":2.20}]},
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"ponzu-yuzu","name":"Ponzu yuzu","additionalPrice":0.50},{"id":"mayo-sesame","name":"Mayonnaise sésame","additionalPrice":0.50},{"id":"mayo-spicy","name":"Mayonnaise épicée","additionalPrice":0.50}]},
          {"id":"supplements","name":"Suppléments","minSelections":0,"maxSelections":3,"includedSelections":0,"options":[{"id":"avocat","name":"Avocat","additionalPrice":1.00},{"id":"cream-cheese","name":"Cream cheese","additionalPrice":0.80},{"id":"oignons-croustillants","name":"Oignons croustillants","additionalPrice":0.60}]}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '11111111-1111-4111-8111-111111111122',
        'Thon Épicé',
        'Pain de riz, thon mariné, concombre, avocat et sésame.',
        'BURGER',
        10.90,
        'https://cdn.example.com/kiosk/burgers/thon-epice.png',
        true,
        'poisson,soja,sesame',
        '[
          {"id":"thon","name":"Portions de thon","minSelections":1,"maxSelections":3,"includedSelections":1,"options":[{"id":"morceau-thon","name":"Morceau de thon","additionalPrice":2.00}]},
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"mayo-spicy","name":"Mayonnaise épicée","additionalPrice":0.50},{"id":"teriyaki","name":"Teriyaki","additionalPrice":0.50},{"id":"ponzu-yuzu","name":"Ponzu yuzu","additionalPrice":0.50}]},
          {"id":"supplements","name":"Suppléments","minSelections":0,"maxSelections":3,"includedSelections":0,"options":[{"id":"avocat","name":"Avocat","additionalPrice":1.00},{"id":"masago","name":"Œufs de poisson","additionalPrice":1.20},{"id":"oignons-croustillants","name":"Oignons croustillants","additionalPrice":0.60}]}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '11111111-1111-4111-8111-111111111123',
        'Ebi Tempura',
        'Pain de riz, crevettes tempura, salade croquante et avocat.',
        'BURGER',
        10.50,
        'https://cdn.example.com/kiosk/burgers/ebi-tempura.png',
        true,
        'crustaces,gluten,soja,sesame',
        '[
          {"id":"crevettes","name":"Crevettes tempura","minSelections":1,"maxSelections":3,"includedSelections":1,"options":[{"id":"crevette-tempura","name":"Crevette tempura","additionalPrice":1.80}]},
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"mayo-yuzu","name":"Mayonnaise yuzu","additionalPrice":0.50},{"id":"teriyaki","name":"Teriyaki","additionalPrice":0.50},{"id":"mayo-spicy","name":"Mayonnaise épicée","additionalPrice":0.50}]},
          {"id":"supplements","name":"Suppléments","minSelections":0,"maxSelections":3,"includedSelections":0,"options":[{"id":"avocat","name":"Avocat","additionalPrice":1.00},{"id":"cream-cheese","name":"Cream cheese","additionalPrice":0.80},{"id":"edamame","name":"Edamame","additionalPrice":0.70}]}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '11111111-1111-4111-8111-111111111124',
        'Umami Végétal',
        'Pain de riz au sésame, tofu grillé, shiitakés, chou rouge et avocat.',
        'BURGER',
        9.90,
        'https://cdn.example.com/kiosk/burgers/umami-vegetal.png',
        true,
        'soja,sesame',
        '[
          {"id":"sauces","name":"Sauces","minSelections":0,"maxSelections":2,"includedSelections":0,"options":[{"id":"mayo-yuzu","name":"Mayonnaise yuzu","additionalPrice":0.50},{"id":"teriyaki","name":"Teriyaki","additionalPrice":0.50},{"id":"ponzu-yuzu","name":"Ponzu yuzu","additionalPrice":0.50}]},
          {"id":"supplements","name":"Suppléments","minSelections":0,"maxSelections":3,"includedSelections":0,"options":[{"id":"avocat","name":"Avocat","additionalPrice":1.00},{"id":"shiitake","name":"Shiitakés","additionalPrice":0.90},{"id":"cream-cheese","name":"Cream cheese","additionalPrice":0.80},{"id":"edamame","name":"Edamame","additionalPrice":0.70}]}
        ]'::jsonb,
        NOW(),
        NOW()
    )
ON CONFLICT ("id") DO UPDATE
SET "customizations" = EXCLUDED."customizations"
WHERE articles."customizations" = '[]'::jsonb
  AND EXCLUDED."customizations" <> '[]'::jsonb;
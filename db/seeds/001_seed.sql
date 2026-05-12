-- Deterministic local seed data. Password hashes are placeholders for development only.

INSERT INTO users (username, email, password, role, referral_code, referral_points)
SELECT * FROM (VALUES
  ('customer_demo', 'customer@example.com', '$2b$10$developmenthashcustomer', 'customer', 'REF000001', 0),
  ('driver_demo', 'driver@example.com', '$2b$10$developmenthashdriver', 'driver', 'REF000002', 0),
  ('admin_demo', 'admin@example.com', '$2b$10$developmenthashadmin', 'admin', 'REF000003', 0)
) AS seed(username, email, password, role, referral_code, referral_points)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = seed.email);

INSERT INTO stores (name, address, latitude, longitude)
SELECT * FROM (VALUES
  ('Shopta Market', '100 Market Street, San Francisco, CA', 37.793700, -122.396500),
  ('Corner Grocery', '200 Mission Street, San Francisco, CA', 37.791200, -122.395000),
  ('Fresh Basket', '300 Howard Street, San Francisco, CA', 37.788600, -122.394200)
) AS seed(name, address, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE stores.name = seed.name);

INSERT INTO items (name, category)
SELECT * FROM (VALUES
  ('Milk', 'Dairy'),
  ('Bread', 'Bakery'),
  ('Apples', 'Produce'),
  ('Coffee', 'Pantry'),
  ('Laundry Detergent', 'Household')
) AS seed(name, category)
WHERE NOT EXISTS (SELECT 1 FROM items WHERE items.name = seed.name);

INSERT INTO store_items (store_id, item_id, price)
SELECT s.id, i.id, v.price
FROM (VALUES
  ('Shopta Market', 'Milk', 4.49),
  ('Shopta Market', 'Bread', 3.29),
  ('Shopta Market', 'Apples', 1.99),
  ('Corner Grocery', 'Coffee', 9.99),
  ('Corner Grocery', 'Laundry Detergent', 12.49),
  ('Fresh Basket', 'Apples', 1.79),
  ('Fresh Basket', 'Milk', 4.29)
) AS v(store_name, item_name, price)
JOIN stores s ON s.name = v.store_name
JOIN items i ON i.name = v.item_name
ON CONFLICT (store_id, item_id) DO NOTHING;

INSERT INTO promotions (store_id, title, description, discount_percentage, start_date, end_date, is_active)
SELECT s.id, 'Welcome grocery deal', 'Seeded promotion for local development.', 10.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE
FROM stores s
WHERE s.name = 'Shopta Market'
  AND NOT EXISTS (SELECT 1 FROM promotions p WHERE p.store_id = s.id AND p.title = 'Welcome grocery deal');

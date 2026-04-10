-- Administrator/Analytics setup script
-- Run this in Supabase SQL editor to support:
-- 1) Sales history (with filters and order detail rows)
-- 2) Inventory management updates/additions/removals
-- 3) User account maintenance + purchase history linkage

-- Sales order header table used by Admin Sales History view.
CREATE TABLE IF NOT EXISTS "SalesOrders" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES "User" (id) ON DELETE SET NULL,
    subtotal numeric(10, 2) NOT NULL,
    tax numeric(10, 2) NOT NULL,
    total numeric(10, 2) NOT NULL,
    shipping_address text NOT NULL,
    shipping_city text NOT NULL,
    shipping_zip text NOT NULL,
    shipping_province text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Sales order line items table used for per-order product details.
CREATE TABLE IF NOT EXISTS "SalesOrderItems" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES "SalesOrders" (id) ON DELETE CASCADE,
    product_id integer REFERENCES "Products" (id) ON DELETE SET NULL,
    product_name text NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    line_total numeric(10, 2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes for common admin filters and lookup patterns.
CREATE INDEX IF NOT EXISTS sales_orders_user_id_idx ON "SalesOrders" (user_id);
CREATE INDEX IF NOT EXISTS sales_orders_created_at_idx ON "SalesOrders" (created_at DESC);
CREATE INDEX IF NOT EXISTS sales_order_items_order_id_idx ON "SalesOrderItems" (order_id);
CREATE INDEX IF NOT EXISTS sales_order_items_product_name_idx ON "SalesOrderItems" (product_name);

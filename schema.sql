-- =========================================================
-- Kishan Electronics - Complete MySQL Database Schema (DDL)
-- Production ECE Components Catalogue & Ordering System
-- =========================================================

CREATE DATABASE IF NOT EXISTS kishan_electronics_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE kishan_electronics_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (name, description) VALUES
('ROLE_CUSTOMER', 'Registered standard shopper with personal order tracking'),
('ROLE_ADMIN', 'Store administrator with catalog, order, and stock privileges');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB;

-- 3. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  house_shop_no VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pin_code VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_address_user (user_id)
) ENGINE=InnoDB;

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  model_number VARCHAR(100),
  category_id VARCHAR(64) NOT NULL,
  brand VARCHAR(100) NOT NULL DEFAULT 'Generic',
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent INT DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  description TEXT,
  features_json JSON,
  applications_json JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  datasheet_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_products_category (category_id),
  INDEX idx_products_brand (brand),
  INDEX idx_products_price (price),
  INDEX idx_products_sku (sku),
  FULLTEXT idx_products_search (name, sku, brand, description)
) ENGINE=InnoDB;

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_prod_images (product_id)
) ENGINE=InnoDB;

-- 7. PRODUCT SPECIFICATIONS TABLE (Dynamic key-value attributes)
CREATE TABLE IF NOT EXISTS product_specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255) NOT NULL,
  CONSTRAINT fk_product_specs_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_specs_prod (product_id),
  INDEX idx_specs_key (spec_key)
) ENGINE=InnoDB;

-- 8. PROJECT KITS TABLE
CREATE TABLE IF NOT EXISTS project_kits (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  description TEXT,
  image_url VARCHAR(500),
  difficulty VARCHAR(50) DEFAULT 'Beginner',
  category VARCHAR(100) DEFAULT 'General Electronics',
  stock_quantity INT NOT NULL DEFAULT 10,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kits_slug (slug)
) ENGINE=InnoDB;

-- 9. PROJECT KIT ITEMS TABLE
CREATE TABLE IF NOT EXISTS project_kit_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kit_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kit_items_kit FOREIGN KEY (kit_id) REFERENCES project_kits(id) ON DELETE CASCADE,
  CONSTRAINT fk_kit_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_kit_items (kit_id)
) ENGINE=InnoDB;

-- 10. CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
  user_id VARCHAR(64) PRIMARY KEY,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  is_kit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES carts(user_id) ON DELETE CASCADE,
  INDEX idx_cart_user (user_id)
) ENGINE=InnoDB;

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY, -- e.g. KE-2026-000101
  user_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  order_type ENUM('Pickup', 'Delivery') NOT NULL DEFAULT 'Pickup',
  pickup_location VARCHAR(255),
  delivery_house_shop_no VARCHAR(100),
  delivery_street VARCHAR(255),
  delivery_city VARCHAR(100),
  delivery_state VARCHAR(100),
  delivery_pin_code VARCHAR(20),
  payment_method ENUM('Cash on Pickup', 'Pay on Delivery', 'UPI / Online') NOT NULL DEFAULT 'Cash on Pickup',
  payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
  order_status ENUM('Order Placed', 'Confirmed', 'Preparing', 'Ready for Pickup / Shipped', 'Delivered / Collected', 'Cancelled') NOT NULL DEFAULT 'Order Placed',
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_date (created_at)
) ENGINE=InnoDB;

-- 13. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items (order_id)
) ENGINE=InnoDB;

-- 14. ORDER TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS order_timeline_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_timeline_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_timeline_order (order_id)
) ENGINE=InnoDB;

-- 15. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

-- 16. WISHLISTS & WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id)
) ENGINE=InnoDB;

-- 17. PRODUCT ENQUIRIES & QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS product_questions (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_questions_prod (product_id)
) ENGINE=InnoDB;

-- 18. DATASHEETS TABLE
CREATE TABLE IF NOT EXISTS datasheets (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_datasheets_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO store_settings (setting_key, setting_value) VALUES
('shop_name', 'Kishan Electronics'),
('tagline', 'Your Trusted ECE & Electronics Components Store'),
('phone', '+91 98765 43210'),
('whatsapp_number', '+91 98765 43210'),
('email', 'contact@kishanelectronics.com'),
('address', 'Shop #14, Nehru Electronics Complex, Station Road, Tech Hub, Pune, Maharashtra 411001'),
('opening_hours', 'Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM'),
('pickup_available', 'true'),
('delivery_available', 'true'),
('currency', '₹'),
('delivery_fee', '49'),
('free_delivery_threshold', '499');

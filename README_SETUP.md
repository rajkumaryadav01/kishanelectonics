# Kishan Electronics - Full-Stack ECE & Electronics Components Store

A complete, production-ready full-stack online catalogue, order management, and shop pickup reservation system built for **Kishan Electronics**.

---

## ⚡ Default Accounts for Testing

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@kishanelectronics.com` | `admin123` | Full admin portal `/admin`, products CRUD, stock management, order status tracker, sales reports, shop settings |
| **Demo Customer** | `customer@kishanelectronics.com` | `customer123` | Browsing, ordering, cart persistence, store pickup/delivery, order tracking, reviews, wishlist |

*(You can also click **Register** to create any new customer account with your own credentials).*

---

## 🚀 Key Functional Modules

1. **Product Catalogue & Dynamic ECE Specifications**:
   - 21 Categories: ICs, Resistors, Capacitors, Diodes, Transistors, LEDs, Sensors, Arduino, ESP32, Raspberry Pi, Modules, Displays, Motors, Relays, PCBs, Breadboards, Wires & Cables, Connectors, Power Supplies, Batteries, Project Kits.
   - Dynamic, component-specific technical parameters (e.g. Operating Voltage, Operating Current, Package Type, Interface, Flash Memory).
   - Real-time search by Product Name, SKU, Model Number, Brand, and Category with live autocomplete suggestions.
   - Multi-parameter filtering: Brand, Category, Price Range Slider, Stock Availability, and Multi-Option Sorting (Price Low-to-High, Price High-to-Low, Popularity, Rating, Newest).
   - Real downloadable Technical PDF Datasheet viewer & download.
   - Customer ratings, verified reviews, and customer Q&A enquiry section.
   - WhatsApp Enquiry generator with pre-filled SKU, Product Name, and Price.

2. **ECE "Build My Project" Recommendation Engine**:
   - Curated engineering project templates (Line Following Robot, Smart Obstacle Avoider, ESP32 IoT Weather Station, Smart Home Automation Relay, 555 & LM358 Analog Circuit Lab).
   - Real-time compatibility & inventory check.
   - One-click **"Add All Available Components to Cart"**!

3. **Interactive Side-by-Side Product Comparison**:
   - Select up to 4 components and compare Price, Brand, Voltage, Current, Dimensions, and Package type on a responsive specification matrix.

4. **Cart & Reservation Checkout**:
   - Stock-checked quantity adjustment (prevents ordering beyond in-store inventory).
   - Order types: **Pickup from Kishan Electronics** (with pickup counter notice) vs. **Doorstep Delivery**.
   - Modular payment options: Cash on Pickup, Pay on Delivery, and UPI / Online.
   - Generates unique Order IDs formatted as `KE-2026-XXXXXX`.

5. **Visual Order Tracking & Timeline**:
   - Step-by-step progress: `Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready for Pickup / Shipped` ➔ `Delivered / Collected`.

6. **Admin Dashboard & Management Portal (`/admin`)**:
   - Executive KPIs: Total Products, Categories, Customers, Orders, Revenue, Low Stock Alerts, Out-of-stock items.
   - Complete Product CRUD with image upload & PDF datasheet upload.
   - Real-time stock quantity adjustment (+/-, set, or mark out-of-stock).
   - Order status management and pickup/delivery marking.
   - Customer directory with lifetime purchase metrics.
   - Full Shop Settings configuration (Store Name, Phone, WhatsApp, Address, Opening Hours, Google Maps Embed Link, Delivery thresholds).

---

## 🗄️ Database Architecture (MySQL)

A complete relational DDL script is provided in `schema.sql` covering all 18 tables:
- `users`, `roles`, `addresses`
- `categories`, `products`, `product_images`, `product_specifications`
- `project_kits`, `project_kit_items`
- `carts`, `cart_items`
- `orders`, `order_items`, `order_timeline_events`
- `reviews`, `wishlist_items`, `product_questions`, `datasheets`, `store_settings`

---

## ☕ Spring Boot Reference Architecture

For deployment with Java & Spring Boot, the backend controllers map 1:1 to the implemented REST endpoints:
- `com.kishanelectronics.controller.AuthController` ➔ `/api/auth/*`
- `com.kishanelectronics.controller.ProductController` ➔ `/api/products/*`
- `com.kishanelectronics.controller.CartController` ➔ `/api/cart/*`
- `com.kishanelectronics.controller.OrderController` ➔ `/api/orders/*`
- `com.kishanelectronics.controller.AdminController` ➔ `/api/admin/*`
- `com.kishanelectronics.security.JwtAuthenticationFilter` ➔ Bearer token validation
- `com.kishanelectronics.service.PaymentService` ➔ UPI/Razorpay integration interface

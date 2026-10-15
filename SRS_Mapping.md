# FoodieGo — SRS Mapping

## System Perspective
FoodieGo is organized as a web-based Online Food Delivery System connecting:
- Customer
- Restaurant
- Delivery Partner
- Administrator

The central database stores user, restaurant, menu, cart/order, payment, delivery and review-related data.

## Project Modules
1. Customer: browse, search, cart, checkout, payment, tracking, reviews, support.
2. Restaurant: menu, availability, orders, preparation, earnings.
3. Delivery Partner: assigned deliveries, status, availability, delivery events.
4. Administrator: users, restaurants, orders, payments, reports, support, system controls.
5. Payment: server-created payment order, checkout, server-side signature verification.
6. Database: SQLite schema with users, restaurants, menu, orders, payments, support, notifications and delivery events.

## Important limitation
This mapping uses the FoodieGo SRS/Product Perspective previously established in the project context. An exact section-by-section mapping requires the complete SRS document to be present in the project files.

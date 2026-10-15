
const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "data", "foodiego.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 phone TEXT DEFAULT '',
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'customer',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS restaurants (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 owner_id INTEGER,
 status TEXT NOT NULL DEFAULT 'open',
 rating REAL DEFAULT 0,
 FOREIGN KEY(owner_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS menu_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 restaurant_id INTEGER,
 name TEXT NOT NULL,
 category TEXT,
 price REAL NOT NULL,
 veg INTEGER DEFAULT 1,
 available INTEGER DEFAULT 1,
 rating REAL DEFAULT 0,
 description TEXT DEFAULT '',
 FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
);
CREATE TABLE IF NOT EXISTS orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 public_id TEXT NOT NULL UNIQUE,
 user_id INTEGER,
 restaurant_id INTEGER,
 subtotal REAL NOT NULL,
 discount REAL DEFAULT 0,
 delivery_fee REAL DEFAULT 0,
 total REAL NOT NULL,
 address TEXT NOT NULL,
 phone TEXT DEFAULT '',
 payment_method TEXT NOT NULL,
 payment_status TEXT NOT NULL DEFAULT 'pending',
 status TEXT NOT NULL DEFAULT 'Order Confirmed',
 scheduled_for TEXT,
 delivery_partner_id INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(restaurant_id) REFERENCES restaurants(id),
 FOREIGN KEY(delivery_partner_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS order_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL,
 menu_item_id INTEGER,
 name TEXT NOT NULL,
 quantity INTEGER NOT NULL,
 unit_price REAL NOT NULL,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL,
 provider TEXT NOT NULL,
 provider_order_id TEXT,
 provider_payment_id TEXT,
 amount REAL NOT NULL,
 currency TEXT DEFAULT 'INR',
 status TEXT NOT NULL DEFAULT 'created',
 signature TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS support_tickets (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 type TEXT DEFAULT 'Support',
 message TEXT NOT NULL,
 status TEXT DEFAULT 'Open',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 message TEXT NOT NULL,
 type TEXT DEFAULT 'system',
 order_id INTEGER,
 is_read INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS delivery_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL,
 status TEXT NOT NULL,
 note TEXT DEFAULT '',
 lat REAL,
 lng REAL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);
`);

const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (!count) {
  const add = db.prepare("INSERT INTO users(name,email,phone,password_hash,role) VALUES(?,?,?,?,?)");
  add.run("FoodieGo Admin","admin@foodiego.com","",bcrypt.hashSync("admin123",12),"admin");
  add.run("Restaurant Owner","owner@foodiego.com","",bcrypt.hashSync("owner123",12),"owner");
  add.run("Delivery Partner","delivery@foodiego.com","",bcrypt.hashSync("delivery123",12),"delivery");
}
const rc = db.prepare("SELECT COUNT(*) AS c FROM restaurants").get().c;
if (!rc) {
  const owner = db.prepare("SELECT id FROM users WHERE email=?").get("owner@foodiego.com");
  const r = db.prepare("INSERT INTO restaurants(name,owner_id,status,rating) VALUES(?,?,?,?)")
    .run("Spice Route", owner.id, "open", 4.8);
  const items = [
    ["Royal Chicken Biryani","Indian",329,0,4.9,"Aromatic basmati rice with tender chicken."],
    ["Paneer Tikka Bowl","Indian",259,1,4.8,"Tandoori paneer with rice and mint chutney."],
    ["Butter Chicken","Indian",289,0,4.8,"Creamy tomato gravy with tender chicken."]
  ];
  const addItem = db.prepare("INSERT INTO menu_items(restaurant_id,name,category,price,veg,rating,description) VALUES(?,?,?,?,?,?,?)");
  for (const x of items) addItem.run(r.lastInsertRowid,...x);
}
module.exports = db;

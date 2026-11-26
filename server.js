"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = __dirname;
const DB_PATH =
  process.env.DB_PATH || path.join(ROOT, "data", "fade-masters.sqlite");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(
  "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
);

const INDIA_REGIONS = new Set([
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Delhi",
  "Puducherry",
]);

const CATALOG = [
  [
    "haircut",
    "Everyday Haircut",
    299,
    35,
    "Hair",
    "A neat, comfortable cut for your everyday look.",
    "male",
  ],
  [
    "fade",
    "Skin Fade & Style",
    349,
    45,
    "Hair",
    "A precise fade, blended and finished your way.",
    "male",
  ],
  [
    "taper",
    "Low Taper Fade",
    399,
    45,
    "Hair",
    "A clean low taper with a natural blend and styled finish.",
    "male",
  ],
  [
    "texturedcrop",
    "Textured Crop",
    399,
    45,
    "Hair",
    "A modern textured top with a neat cropped fringe.",
    "male",
  ],
  [
    "frenchcrop",
    "French Crop",
    349,
    40,
    "Hair",
    "A short, easy-care crop shaped to your face and hair.",
    "male",
  ],
  [
    "buzz",
    "Buzz Cut & Line-up",
    249,
    30,
    "Hair",
    "An even clipper cut with a crisp, clean hairline.",
    "male",
  ],
  [
    "pompadour",
    "Classic Pompadour Style",
    449,
    50,
    "Hair",
    "A consultation-led volume style with a polished finish.",
    "male",
  ],
  [
    "kids",
    "Kids' Haircut",
    199,
    30,
    "Hair",
    "A gentle, no-rush trim for the little ones.",
    "all",
  ],
  [
    "hairspa",
    "Hair Spa & Wash",
    399,
    45,
    "Hair",
    "A relaxing wash and scalp-care refresh.",
    "all",
  ],
  [
    "colour",
    "Quick Hair Colour",
    499,
    50,
    "Hair",
    "A simple touch-up with shade consultation.",
    "male",
  ],
  [
    "beardshape",
    "Beard Shape",
    149,
    20,
    "Beard",
    "A clean outline and tidy shape for your beard.",
    "male",
  ],
  [
    "boxedbeard",
    "Boxed Beard Design",
    199,
    25,
    "Beard",
    "Defined cheek and neckline contours for a sharp boxed look.",
    "male",
  ],
  [
    "stubble",
    "Designer Stubble",
    129,
    20,
    "Beard",
    "A balanced short-beard length with precise edging.",
    "male",
  ],
  [
    "hotshave",
    "Hot Towel Shave",
    249,
    30,
    "Beard",
    "A traditional warm-towel prep and close shave.",
    "male",
  ],
  [
    "beardtrim",
    "Beard Trim",
    99,
    15,
    "Beard",
    "A quick, even trim to keep your beard sharp.",
    "male",
  ],
  [
    "faceclean",
    "Basic Face Clean-up",
    199,
    25,
    "Face",
    "A simple cleanse and freshen-up for your skin.",
    "all",
  ],
  [
    "facial",
    "Glow Face Clean-up",
    349,
    40,
    "Face",
    "A deeper clean, gentle exfoliation, and hydration.",
    "all",
  ],
  [
    "threading",
    "Brow & Upper-Lip Threading",
    149,
    20,
    "Threading",
    "Careful, precise threading with a quick comfort check.",
    "female",
  ],
  [
    "browdesign",
    "Brow Shape & Design",
    199,
    25,
    "Threading",
    "A consultation-led brow tidy shaped to your preference.",
    "female",
  ],
  [
    "waxing",
    "Underarm Wax",
    249,
    25,
    "Waxing",
    "A hygienic, single-use applicator service with aftercare.",
    "female",
  ],
  [
    "fullarmswax",
    "Full Arms Wax",
    499,
    45,
    "Waxing",
    "Gentle salon waxing with a patch-test and skin check.",
    "female",
  ],
  [
    "manicure",
    "Classic Manicure",
    399,
    40,
    "Nails",
    "Nail shaping, cuticle care, moisturising and polish.",
    "female",
  ],
  [
    "pedicure",
    "Relaxing Pedicure",
    499,
    50,
    "Nails",
    "A warm soak, nail care and a relaxing foot massage.",
    "female",
  ],
  [
    "nailart",
    "Gel Nails & Nail Art",
    799,
    75,
    "Nails",
    "A gel finish with simple nail art; extensions priced separately.",
    "female",
  ],
  [
    "nailextensions",
    "Nail Extensions",
    1299,
    100,
    "Nails",
    "Custom-length extensions with a shape and finish consultation.",
    "female",
  ],
  [
    "blowdry",
    "Wash, Cut & Blow-dry",
    699,
    60,
    "Hair",
    "A tailored haircut finished with a salon blow-dry.",
    "female",
  ],
  [
    "layercut",
    "Layered Haircut & Styling",
    599,
    60,
    "Hair",
    "Face-framing layers and a styled finish for your hair texture.",
    "female",
  ],
  [
    "wolfcut",
    "Wolf Cut & Texture",
    699,
    65,
    "Hair",
    "A modern, textured shag shaped to your hair density and styling routine.",
    "female",
  ],
  [
    "butterflycut",
    "Butterfly Layers",
    799,
    70,
    "Hair",
    "Soft face-framing layers with a longer, flowing shape.",
    "female",
  ],
  [
    "curtainfringe",
    "Curtain Fringe & Restyle",
    499,
    45,
    "Hair",
    "A fringe and shape refresh tailored to your face and hair texture.",
    "female",
  ],
  [
    "haircolor",
    "Hair Colour Consultation & Root Touch-up",
    899,
    75,
    "Hair",
    "Shade consultation and root touch-up; longer colour services quoted in shop.",
    "female",
  ],
  [
    "keratincare",
    "Hair Repair & Scalp Ritual",
    699,
    60,
    "Spa",
    "A restorative scalp and hair-care ritual with product consultation.",
    "female",
  ],
  [
    "deepcleanse",
    "Deep Cleanse Facial",
    699,
    60,
    "Face",
    "A skin-type consultation, cleanse, gentle exfoliation and hydration.",
    "female",
  ],
  [
    "cleanup",
    "Express Face Clean-up",
    299,
    30,
    "Face",
    "A quick cleanse and fresh finish for any customer.",
    "all",
  ],
  [
    "makeup",
    "Soft Glam Makeup",
    1499,
    90,
    "Makeup",
    "A polished occasion look with a shade and style consultation.",
    "female",
  ],
  [
    "bridaltrial",
    "Bridal / Event Look Trial",
    1999,
    120,
    "Bridal & Events",
    "A planned look trial; final event packages are confirmed with the salon.",
    "female",
  ],
  [
    "partyhair",
    "Party Hair Styling",
    899,
    60,
    "Bridal & Events",
    "A special-occasion style tailored to your outfit and hair.",
    "female",
  ],
  [
    "bodypolish",
    "Body Polish & Hydration",
    999,
    75,
    "Spa",
    "A gentle body exfoliation and moisturising ritual.",
    "female",
  ],
  [
    "headmassage",
    "Head Massage",
    199,
    20,
    "Care",
    "A quiet scalp massage to unwind between errands.",
    "all",
  ],
  [
    "cutbeard",
    "Cut + Beard Shape",
    399,
    50,
    "Combos",
    "A fresh haircut and a clean beard finish.",
    "male",
  ],
  [
    "grooming",
    "Full Grooming Combo",
    499,
    70,
    "Combos",
    "Haircut, beard shape, and a basic face clean-up.",
    "male",
  ],
].map(([id, name, price, duration, category, description, audience]) => ({
  id,
  name,
  price,
  duration,
  category,
  description,
  audience,
}));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('customer','owner','barber')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    email_lc TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT '',
    barber_preference TEXT NOT NULL DEFAULT 'any',
    location TEXT NOT NULL DEFAULT '',
    region TEXT NOT NULL DEFAULT '',
    employee_id TEXT,
    owner_id TEXT REFERENCES users(id),
    active INTEGER NOT NULL DEFAULT 1,
    profile_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email_lc);
  CREATE UNIQUE INDEX IF NOT EXISTS users_employee_id_unique ON users(employee_id) WHERE employee_id IS NOT NULL;
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
  CREATE TABLE IF NOT EXISTS catalog_services (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL,
    duration INTEGER NOT NULL, description TEXT NOT NULL, audience TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL, city TEXT NOT NULL, area TEXT NOT NULL, region TEXT NOT NULL,
    address TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', description TEXT NOT NULL,
    photo TEXT NOT NULL DEFAULT '', work_photos_json TEXT NOT NULL DEFAULT '[]',
    lat REAL, lng REAL, open TEXT NOT NULL DEFAULT 'Hours vary',
    tag TEXT NOT NULL DEFAULT 'Owner registered', created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS shops_owner ON shops(owner_id);
  CREATE INDEX IF NOT EXISTS shops_region_city ON shops(region, city);
  CREATE TABLE IF NOT EXISTS custom_services (
    id TEXT PRIMARY KEY, shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, category TEXT NOT NULL,
    price INTEGER NOT NULL, duration INTEGER NOT NULL, description TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('male','female','all'))
  );
  CREATE TABLE IF NOT EXISTS shop_services (
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL, price INTEGER NOT NULL,
    PRIMARY KEY (shop_id, service_id)
  );
  CREATE TABLE IF NOT EXISTS barber_shops (
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    barber_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, barber_id)
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY, shop_id TEXT NOT NULL REFERENCES shops(id),
    customer_id TEXT NOT NULL REFERENCES users(id), barber_id TEXT NOT NULL REFERENCES users(id),
    service_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending','confirmed','completed','cancelled')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid','recorded','included')),
    price INTEGER NOT NULL, membership_benefit TEXT, note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS appointment_slot_unique
    ON appointments(shop_id, barber_id, date, time) WHERE status <> 'cancelled';
  CREATE INDEX IF NOT EXISTS appointments_customer ON appointments(customer_id, date);
  CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES users(id),
    shop_id TEXT NOT NULL REFERENCES shops(id), status TEXT NOT NULL CHECK (status IN ('pending','active','cancelled')),
    plan_price INTEGER NOT NULL DEFAULT 499, payment_status TEXT NOT NULL DEFAULT 'demo_unpaid',
    requested_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id),
    shop_id TEXT NOT NULL REFERENCES shops(id), name TEXT NOT NULL, discount INTEGER NOT NULL,
    ends TEXT NOT NULL DEFAULT '', description TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS owner_settings (
    owner_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    incentive_amount INTEGER NOT NULL DEFAULT 2500, incentive_target INTEGER NOT NULL DEFAULT 20,
    commission_rate INTEGER NOT NULL DEFAULT 3
  );
  CREATE TABLE IF NOT EXISTS payroll (
    barber_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, paid INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (barber_id, month)
  );
`);

const insertCatalog = db.prepare(`
  INSERT OR IGNORE INTO catalog_services (id,name,category,price,duration,description,audience)
  VALUES (?,?,?,?,?,?,?)
`);
for (const service of CATALOG) {
  insertCatalog.run(
    service.id,
    service.name,
    service.category,
    service.price,
    service.duration,
    service.description,
    service.audience,
  );
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const nowIso = () => new Date().toISOString();
const randomId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const sqlUser = db.prepare("SELECT * FROM users WHERE id = ?");
const catalogById = db.prepare("SELECT * FROM catalog_services WHERE id = ?");
const authFailures = new Map();
const dummyPasswordRecord = passwordRecord("not-a-real-user-password");

function requireText(value, label, max = 160, minimum = 1) {
  if (typeof value !== "string")
    throw new HttpError(400, `${label} is required.`);
  const clean = value.trim();
  if (clean.length < minimum || clean.length > max)
    throw new HttpError(400, `${label} must be ${minimum}-${max} characters.`);
  return clean;
}

function optionalText(value, label, max = 500) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.trim().length > max)
    throw new HttpError(400, `${label} is too long.`);
  return value.trim();
}

function validEmail(value) {
  const email = requireText(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new HttpError(400, "Enter a valid email address.");
  return email;
}

function validPassword(value) {
  if (typeof value !== "string" || value.length < 10 || value.length > 200) {
    throw new HttpError(400, "Password must be at least 10 characters.");
  }
  return value;
}

function passwordRecord(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

function verifyPassword(password, saltHex, hashHex) {
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(
    String(password || ""),
    Buffer.from(saltHex, "hex"),
    expected.length,
  );
  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

function createUser({
  id = null,
  role,
  name,
  email,
  password,
  phone = "",
  gender = "",
  preferredBarberGender = "any",
  location = "",
  region = "",
  employeeId = null,
  ownerId = null,
  profile = {},
}) {
  const record = passwordRecord(validPassword(password));
  const userId = id || randomId(role);
  db.prepare(
    `
    INSERT INTO users (id,role,name,email,email_lc,phone,password_salt,password_hash,gender,barber_preference,location,region,employee_id,owner_id,profile_json,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `,
  ).run(
    userId,
    role,
    name,
    email,
    email.toLowerCase(),
    phone,
    record.salt,
    record.hash,
    gender,
    preferredBarberGender,
    location,
    region,
    employeeId,
    ownerId,
    JSON.stringify(profile),
    nowIso(),
  );
  if (role === "owner")
    db.prepare("INSERT INTO owner_settings (owner_id) VALUES (?)").run(userId);
  return sqlUser.get(userId);
}

function userView(row) {
  const profile = JSON.parse(row.profile_json || "{}");
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    preferredBarberGender: row.barber_preference,
    location: row.location,
    state: row.region,
    employeeId: row.employee_id,
    ownerId: row.owner_id,
    active: Boolean(row.active),
    ...profile,
  };
}

function currentUser(req) {
  const cookies = Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [
          item.slice(0, index),
          decodeURIComponent(item.slice(index + 1)),
        ];
      }),
  );
  const token = cookies.fm_session;
  if (!token) return null;
  const row = db
    .prepare(
      `
    SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id
    WHERE sessions.token_hash=? AND sessions.expires_at>? AND users.active=1
  `,
    )
    .get(sha256(token), Date.now());
  return row || null;
}

function requireRole(user, roles) {
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  if (!roles.includes(user.role))
    throw new HttpError(403, "This account cannot perform that action.");
  return user;
}

function authAttemptKey(req, identifier) {
  return `${req.socket.remoteAddress || "unknown"}:${identifier.toLowerCase()}`;
}

function checkAuthRateLimit(key) {
  const now = Date.now();
  const record = authFailures.get(key);
  if (record && now - record.startedAt < 15 * 60 * 1000 && record.count >= 8) {
    throw new HttpError(
      429,
      "Too many sign-in attempts. Try again in 15 minutes.",
    );
  }
  if (record && now - record.startedAt >= 15 * 60 * 1000)
    authFailures.delete(key);
}

function recordAuthFailure(key) {
  const now = Date.now();
  const record = authFailures.get(key);
  if (!record || now - record.startedAt >= 15 * 60 * 1000)
    authFailures.set(key, { startedAt: now, count: 1 });
  else record.count += 1;
}

function transaction(action) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = action();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    if (String(error.message).includes("UNIQUE constraint failed"))
      throw new HttpError(
        409,
        "That email, employee ID, or appointment slot is already in use.",
      );
    throw error;
  }
}

function audienceFor(service) {
  if (["male", "female", "all"].includes(service.audience))
    return service.audience;
  const id = String(service.id || "");
  const category = String(service.category || "").toLowerCase();
  if (
    [
      "haircut",
      "fade",
      "taper",
      "texturedcrop",
      "frenchcrop",
      "buzz",
      "pompadour",
      "colour",
      "beardshape",
      "boxedbeard",
      "stubble",
      "hotshave",
      "beardtrim",
      "cutbeard",
      "grooming",
    ].includes(id) ||
    category === "beard"
  )
    return "male";
  if (
    [
      "layercut",
      "wolfcut",
      "butterflycut",
      "curtainfringe",
      "blowdry",
      "haircolor",
      "threading",
      "browdesign",
      "waxing",
      "fullarmswax",
      "manicure",
      "pedicure",
      "nailart",
      "nailextensions",
      "deepcleanse",
      "makeup",
      "bridaltrial",
      "partyhair",
      "bodypolish",
    ].includes(id) ||
    ["threading", "waxing", "nails", "makeup", "bridal"].includes(category)
  )
    return "female";
  return "all";
}

function serviceRecord(serviceId, shopId) {
  const base = catalogById.get(serviceId);
  if (base) {
    const assigned = db
      .prepare(
        "SELECT price FROM shop_services WHERE shop_id=? AND service_id=?",
      )
      .get(shopId, serviceId);
    if (!assigned) return null;
    return { ...base, price: assigned.price };
  }
  const custom = db
    .prepare(
      `
    SELECT custom_services.*, shop_services.price AS assigned_price
    FROM custom_services JOIN shop_services ON shop_services.service_id=custom_services.id
    WHERE custom_services.id=? AND custom_services.shop_id=? AND shop_services.shop_id=?
  `,
    )
    .get(serviceId, shopId, shopId);
  return custom ? { ...custom, price: custom.assigned_price } : null;
}

function shopServices(shopId) {
  return db
    .prepare(
      `
    SELECT ss.service_id AS id, ss.price, c.name, c.category, c.duration, c.description, c.audience
    FROM shop_services ss JOIN catalog_services c ON c.id=ss.service_id WHERE ss.shop_id=?
    UNION ALL
    SELECT cs.id, ss.price, cs.name, cs.category, cs.duration, cs.description, cs.audience
    FROM shop_services ss JOIN custom_services cs ON cs.id=ss.service_id WHERE ss.shop_id=?
  `,
    )
    .all(shopId, shopId);
}

function shopView(row) {
  const serviceRows = shopServices(row.id);
  const staff = db
    .prepare(
      "SELECT barber_id FROM barber_shops WHERE shop_id=? ORDER BY barber_id",
    )
    .all(row.id)
    .map((item) => item.barber_id);
  const priceMap = Object.fromEntries(
    serviceRows.map((service) => [service.id, service.price]),
  );
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    city: row.city,
    area: row.area,
    region: row.region,
    address: row.address,
    phone: row.phone,
    description: row.description,
    photo: row.photo,
    workPhotos: JSON.parse(row.work_photos_json || "[]"),
    lat: row.lat,
    lng: row.lng,
    open: row.open,
    tag: row.tag,
    rating: row.rating || "New",
    reviews: row.reviews || 0,
    isDemo: false,
    services: serviceRows.map((service) => service.id),
    servicePrices: priceMap,
    barberIds: staff,
  };
}

function barberRows() {
  return db
    .prepare(
      "SELECT * FROM users WHERE role='barber' AND active=1 ORDER BY name",
    )
    .all()
    .map((row) => {
      const barber = userView(row);
      const shops = db
        .prepare(
          "SELECT shop_id FROM barber_shops WHERE barber_id=? ORDER BY shop_id",
        )
        .all(row.id);
      return {
        ...barber,
        shopId: shops[0]?.shop_id || "",
        shopIds: shops.map((item) => item.shop_id),
      };
    });
}

function audienceAllows(customer, service) {
  const audience = audienceFor(service);
  return (
    audience === "all" ||
    customer.gender === "nonbinary" ||
    customer.gender === audience
  );
}

function appointmentRows(user) {
  let rows;
  if (!user) return [];
  if (user.role === "customer") {
    rows = db
      .prepare(
        `
      SELECT a.*, u.name AS customer_name, u.email AS customer_email
      FROM appointments a JOIN users u ON u.id=a.customer_id WHERE a.customer_id=? ORDER BY a.date,a.time
    `,
      )
      .all(user.id);
  } else if (user.role === "barber") {
    rows = db
      .prepare(
        `
      SELECT a.*, u.name AS customer_name, u.email AS customer_email
      FROM appointments a JOIN users u ON u.id=a.customer_id WHERE a.barber_id=? ORDER BY a.date,a.time
    `,
      )
      .all(user.id);
  } else {
    rows = db
      .prepare(
        `
      SELECT a.*, u.name AS customer_name, u.email AS customer_email
      FROM appointments a JOIN users u ON u.id=a.customer_id JOIN shops s ON s.id=a.shop_id
      WHERE s.owner_id=? ORDER BY a.date,a.time
    `,
      )
      .all(user.id);
  }
  return rows.map((row) => ({
    id: row.id,
    shopId: row.shop_id,
    serviceId: row.service_id,
    barberId: row.barber_id,
    customer: row.customer_name,
    email: row.customer_email,
    date: row.date,
    time: row.time,
    status: row.status,
    paymentStatus:
      row.payment_status === "recorded" ? "paid" : row.payment_status,
    price: row.price,
    membershipBenefit: row.membership_benefit,
    note: row.note,
  }));
}

function stateFor(user) {
  const shops = db
    .prepare("SELECT * FROM shops ORDER BY created_at DESC")
    .all()
    .map(shopView);
  const visibleShopIds = new Set(shops.map((shop) => shop.id));
  const staff = barberRows();
  const shopStaff = Object.fromEntries(
    shops.map((shop) => [shop.id, shop.barberIds]),
  );
  let memberships = [];
  let promotions = [];
  let owners = [];
  let payrollPaid = {};
  let ownerSettings = {};
  let commissionRate = 3;
  let customServices = [];
  if (user?.role === "customer") {
    memberships = db
      .prepare(
        `
      SELECT m.*, u.name AS customer_name, u.email AS customer_email FROM memberships m
      JOIN users u ON u.id=m.customer_id WHERE m.customer_id=? ORDER BY m.requested_at DESC
    `,
      )
      .all(user.id)
      .map((m) => ({
        id: m.id,
        email: m.customer_email,
        customer: m.customer_name,
        shopId: m.shop_id,
        requestedAt: m.requested_at,
        status: m.status,
        price: m.plan_price,
        paymentStatus: m.payment_status,
      }));
    promotions = db
      .prepare("SELECT * FROM promotions ORDER BY rowid DESC")
      .all()
      .map((p) => ({
        id: p.id,
        ownerId: p.owner_id,
        shopId: p.shop_id,
        name: p.name,
        discount: p.discount,
        ends: p.ends,
        description: p.description,
      }));
  } else if (user?.role === "owner") {
    memberships = db
      .prepare(
        `
      SELECT m.*, u.name AS customer_name, u.email AS customer_email FROM memberships m
      JOIN users u ON u.id=m.customer_id JOIN shops s ON s.id=m.shop_id
      WHERE s.owner_id=? ORDER BY m.requested_at DESC
    `,
      )
      .all(user.id)
      .map((m) => ({
        id: m.id,
        email: m.customer_email,
        customer: m.customer_name,
        shopId: m.shop_id,
        requestedAt: m.requested_at,
        status: m.status,
        price: m.plan_price,
        paymentStatus: m.payment_status,
      }));
    promotions = db
      .prepare("SELECT * FROM promotions WHERE owner_id=? ORDER BY rowid DESC")
      .all(user.id)
      .map((p) => ({
        id: p.id,
        ownerId: p.owner_id,
        shopId: p.shop_id,
        name: p.name,
        discount: p.discount,
        ends: p.ends,
        description: p.description,
      }));
    const settings =
      db
        .prepare("SELECT * FROM owner_settings WHERE owner_id=?")
        .get(user.id) || {};
    ownerSettings[user.id] = {
      amount: settings.incentive_amount || 2500,
      target: settings.incentive_target || 20,
    };
    commissionRate = settings.commission_rate || 3;
    owners = [
      {
        id: user.id,
        name: user.name,
        email: user.email,
        shopIds: shops
          .filter((shop) => shop.ownerId === user.id)
          .map((shop) => shop.id),
      },
    ];
    const month = new Date().toISOString().slice(0, 7);
    payrollPaid = Object.fromEntries(
      db
        .prepare(
          `
      SELECT p.barber_id,p.paid FROM payroll p JOIN users b ON b.id=p.barber_id
      WHERE b.owner_id=? AND p.month=?
    `,
        )
        .all(user.id, month)
        .map((p) => [p.barber_id, Boolean(p.paid)]),
    );
  } else if (user?.role === "barber") {
    const row = db.prepare("SELECT * FROM users WHERE id=?").get(user.id);
    if (row?.owner_id) {
      const settings =
        db
          .prepare("SELECT * FROM owner_settings WHERE owner_id=?")
          .get(row.owner_id) || {};
      ownerSettings[row.owner_id] = {
        amount: settings.incentive_amount || 2500,
        target: settings.incentive_target || 20,
      };
    }
  }
  customServices = db
    .prepare("SELECT * FROM custom_services ORDER BY name")
    .all()
    .filter((service) => visibleShopIds.has(service.shop_id))
    .map((service) => ({
      id: service.id,
      shopId: service.shop_id,
      ownerId: service.owner_id,
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description,
      audience: service.audience,
    }));
  const customer =
    user?.role === "customer"
      ? userView(user)
      : {
          id: "",
          name: "",
          email: "",
          phone: "",
          gender: "",
          preferredBarberGender: "any",
          location: "",
          state: "",
        };
  const allCatalog = db
    .prepare("SELECT * FROM catalog_services ORDER BY category,name")
    .all();
  const commissionSummary =
    user?.role === "owner"
      ? (() => {
          const totals = db
            .prepare(
              `
      SELECT COUNT(*) AS count, COALESCE(SUM(a.price),0) AS gross FROM appointments a
      JOIN shops s ON s.id=a.shop_id WHERE s.owner_id=? AND (a.status='completed' OR a.payment_status='recorded') AND a.membership_benefit IS NULL
    `,
            )
            .get(user.id);
          return {
            bookings: totals.count,
            gross: totals.gross,
            rate: commissionRate,
            estimate: Math.round((totals.gross * commissionRate) / 100),
          };
        })()
      : null;
  return {
    state: {
      appointments: appointmentRows(user),
      customers: user?.role === "customer" ? [customer] : [],
      customer,
      owners,
      shops,
      shopOverrides: {},
      payrollPaid,
      memberships,
      selectedCity: customer.location || "",
      selectedState: customer.state || "All India",
      barbers: staff,
      promotions,
      shopStaff,
      ownerSettings,
      customServices,
      commissionRate,
      incentivePlan: 2500,
      incentiveTarget: 20,
      commissionSummary,
    },
    catalog: allCatalog.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      duration: row.duration,
      category: row.category,
      description: row.description,
      audience: row.audience,
    })),
  };
}

function bootstrap(user) {
  return {
    authenticated: Boolean(user),
    user: user ? userView(user) : null,
    placesEnabled: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    ...stateFor(user),
  };
}

function validateGender(gender, allowEmpty = false) {
  const value = gender === undefined || gender === null ? "" : String(gender);
  if (
    (allowEmpty && value === "") ||
    ["male", "female", "nonbinary", "unspecified"].includes(value)
  )
    return value;
  throw new HttpError(400, "Choose a valid gender option.");
}

function cleanImage(value, label) {
  const image = optionalText(value, label, 2048);
  if (!image) return "";
  let url;
  try {
    url = new URL(image);
  } catch {
    throw new HttpError(400, `${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:")
    throw new HttpError(400, `${label} must use HTTPS.`);
  return url.href;
}

function cleanShop(body, ownerId, newShop = false) {
  const id = requireText(body.id, "Shop ID", 80);
  if (newShop && !/^shop-[a-zA-Z0-9-]{5,75}$/.test(id))
    throw new HttpError(400, "Invalid shop ID.");
  const region = requireText(body.region, "State / Union Territory", 80);
  if (!INDIA_REGIONS.has(region))
    throw new HttpError(400, "Choose a valid Indian state or union territory.");
  const lat = body.lat === null || body.lat === "" ? null : Number(body.lat);
  const lng = body.lng === null || body.lng === "" ? null : Number(body.lng);
  if (
    (lat === null) !== (lng === null) ||
    (lat !== null &&
      (!Number.isFinite(lat) ||
        Math.abs(lat) > 90 ||
        !Number.isFinite(lng) ||
        Math.abs(lng) > 180))
  ) {
    throw new HttpError(
      400,
      "Map coordinates must be a valid latitude and longitude.",
    );
  }
  const workPhotos = Array.isArray(body.workPhotos)
    ? body.workPhotos.slice(0, 20).map((photo) => {
        if (typeof photo === "string")
          return cleanImage(photo, "Gallery image");
        return {
          url: cleanImage(photo?.url, "Gallery image"),
          caption: optionalText(photo?.caption, "Gallery caption", 120),
        };
      })
    : [];
  return {
    id,
    ownerId,
    name: requireText(body.name, "Shop name", 120, 2),
    city: requireText(body.city, "City", 100),
    area: requireText(body.area, "District / neighborhood", 120),
    region,
    address: requireText(body.address, "Address", 300),
    phone: optionalText(body.phone, "Phone", 40),
    description: requireText(body.description, "Shop description", 500, 2),
    photo: cleanImage(body.photo, "Shop photo"),
    workPhotos,
    lat,
    lng,
    open: optionalText(body.open, "Hours", 80) || "Hours vary",
  };
}

function addOrUpdateShop(owner, body, creating) {
  const shop = cleanShop(body, owner.id, creating);
  const existing = db.prepare("SELECT * FROM shops WHERE id=?").get(shop.id);
  if (creating && existing)
    throw new HttpError(409, "That shop ID already exists.");
  if (!creating && (!existing || existing.owner_id !== owner.id))
    throw new HttpError(404, "Shop not found in your account.");
  if (creating) {
    db.prepare(
      `
      INSERT INTO shops (id,owner_id,name,city,area,region,address,phone,description,photo,work_photos_json,lat,lng,open,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
    ).run(
      shop.id,
      owner.id,
      shop.name,
      shop.city,
      shop.area,
      shop.region,
      shop.address,
      shop.phone,
      shop.description,
      shop.photo,
      JSON.stringify(shop.workPhotos),
      shop.lat,
      shop.lng,
      shop.open,
      nowIso(),
    );
  } else {
    db.prepare(
      `
      UPDATE shops SET name=?,city=?,area=?,region=?,address=?,phone=?,description=?,photo=?,work_photos_json=?,lat=?,lng=?,open=? WHERE id=? AND owner_id=?
    `,
    ).run(
      shop.name,
      shop.city,
      shop.area,
      shop.region,
      shop.address,
      shop.phone,
      shop.description,
      shop.photo,
      JSON.stringify(shop.workPhotos),
      shop.lat,
      shop.lng,
      shop.open,
      shop.id,
      owner.id,
    );
  }
  if (Array.isArray(body.services))
    setShopServices(owner, shop.id, body.services, body.servicePrices || {});
  return shop;
}

function setShopServices(owner, shopId, ids, prices = {}) {
  if (
    !db
      .prepare("SELECT 1 FROM shops WHERE id=? AND owner_id=?")
      .get(shopId, owner.id)
  )
    throw new HttpError(404, "Shop not found in your account.");
  if (!Array.isArray(ids) || ids.length > 100)
    throw new HttpError(400, "Choose a valid service list.");
  const unique = [
    ...new Set(ids.map((id) => requireText(String(id), "Service ID", 100))),
  ];
  const insert = db.prepare(
    "INSERT INTO shop_services (shop_id,service_id,price) VALUES (?,?,?)",
  );
  db.prepare("DELETE FROM shop_services WHERE shop_id=?").run(shopId);
  for (const id of unique) {
    const base = catalogById.get(id);
    const custom = db
      .prepare(
        "SELECT * FROM custom_services WHERE id=? AND shop_id=? AND owner_id=?",
      )
      .get(id, shopId, owner.id);
    if (!base && !custom)
      throw new HttpError(
        400,
        "A selected service is not available in this shop's catalog.",
      );
    const defaultPrice = custom ? custom.price : base.price;
    const price = prices[id] === undefined ? defaultPrice : Number(prices[id]);
    if (!Number.isInteger(price) || price < 0 || price > 1000000)
      throw new HttpError(400, "Service prices must be whole rupee amounts.");
    insert.run(shopId, id, price);
  }
}

function createBarber(owner, shopId, body) {
  const shop = db
    .prepare("SELECT id FROM shops WHERE id=? AND owner_id=?")
    .get(shopId, owner.id);
  if (!shop) throw new HttpError(404, "Shop not found in your account.");
  const name = requireText(body.name, "Barber name", 120, 2);
  const email = validEmail(body.email);
  const employeeId = requireText(
    body.employeeId,
    "Employee ID",
    40,
  ).toUpperCase();
  const id = body.id
    ? requireText(body.id, "Barber ID", 100)
    : randomId("barber");
  if (db.prepare("SELECT id FROM users WHERE id=?").get(id))
    throw new HttpError(409, "That barber account already exists.");
  const tier = String(body.tier || "regular");
  if (!["intern", "regular", "specialist"].includes(tier))
    throw new HttpError(400, "Choose a valid barber tier.");
  const gender = validateGender(body.gender, true);
  const profile = {
    specialty: requireText(body.specialty, "Specialty", 160, 2),
    tier,
    initials: name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    base: Math.min(10000000, Math.max(0, Number(body.base) || 0)),
    commission: Math.min(10000000, Math.max(0, Number(body.commission) || 0)),
    rating: "New",
    active: true,
    shopId,
    shopIds: [shopId],
    photo: cleanImage(body.photo, "Barber photo"),
    workPhotos: body.workPhoto
      ? [cleanImage(body.workPhoto, "Work photo")]
      : [],
    duties:
      tier === "intern"
        ? "Assisted services, hygiene, practice cuts and supervised customer care."
        : tier === "specialist"
          ? "Advanced services, consultation and mentoring."
          : "Independent appointments and standard services.",
  };
  const user = createUser({
    id,
    role: "barber",
    name,
    email,
    password: body.password,
    phone: "",
    gender,
    employeeId,
    ownerId: owner.id,
    profile,
  });
  db.prepare("INSERT INTO barber_shops (shop_id,barber_id) VALUES (?,?)").run(
    shopId,
    user.id,
  );
  return userView(user);
}

function createAppointment(customer, body) {
  const shop = db
    .prepare("SELECT * FROM shops WHERE id=?")
    .get(String(body.shopId || ""));
  if (!shop)
    throw new HttpError(404, "This shop is not registered on Fade Masters.");
  const barber = db
    .prepare(
      `
    SELECT u.* FROM users u JOIN barber_shops bs ON bs.barber_id=u.id
    WHERE u.id=? AND bs.shop_id=? AND u.role='barber' AND u.active=1
  `,
    )
    .get(String(body.barberId || ""), shop.id);
  if (!barber)
    throw new HttpError(400, "Choose an active barber assigned to this shop.");
  const customerProfile = userView(customer);
  const preference = customerProfile.preferredBarberGender || "any";
  if (preference !== "any" && preference !== barber.gender)
    throw new HttpError(403, "Choose a barber matching your saved preference.");
  const service = serviceRecord(String(body.serviceId || ""), shop.id);
  if (!service)
    throw new HttpError(400, "Choose a service registered at this shop.");
  if (!audienceAllows(customerProfile, service))
    throw new HttpError(
      403,
      "That service is not available for your saved profile.",
    );
  const date = requireText(String(body.date || ""), "Appointment date", 10);
  const time = requireText(String(body.time || ""), "Appointment time", 5);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < new Date().toISOString().slice(0, 10) ||
    !/^(?:09|10|11|12|13|14|15|16|17|18|19):(?:00|30)$/.test(time)
  ) {
    throw new HttpError(
      400,
      "Choose a valid upcoming date and appointment time.",
    );
  }
  const id = randomId("visit");
  const membershipBenefit = body.membershipBenefit
    ? String(body.membershipBenefit)
    : null;
  if (membershipBenefit) {
    const benefits =
      customer.gender === "female"
        ? ["layercut", "browdesign", "cleanup"]
        : customer.gender === "male"
          ? ["haircut", "beardshape", "faceclean"]
          : [];
    if (membershipBenefit !== service.id || !benefits.includes(service.id))
      throw new HttpError(400, "Invalid membership benefit.");
    if (
      !db
        .prepare(
          "SELECT id FROM memberships WHERE customer_id=? AND shop_id=? AND status='active'",
        )
        .get(customer.id, shop.id)
    )
      throw new HttpError(
        403,
        "An active membership at this shop is required for this benefit.",
      );
    const month = date.slice(0, 7);
    if (
      db
        .prepare(
          "SELECT id FROM appointments WHERE customer_id=? AND membership_benefit=? AND substr(date,1,7)=? AND status<>'cancelled'",
        )
        .get(customer.id, service.id, month)
    )
      throw new HttpError(
        409,
        "This monthly membership benefit has already been used.",
      );
  }
  const note = optionalText(body.note, "Appointment note", 500);
  db.prepare(
    `
    INSERT INTO appointments (id,shop_id,customer_id,barber_id,service_id,date,time,status,payment_status,price,membership_benefit,note,created_at)
    VALUES (?,?,?,?,?,?,?,'pending',?,?,?, ?,?)
  `,
  ).run(
    id,
    shop.id,
    customer.id,
    barber.id,
    service.id,
    date,
    time,
    membershipBenefit ? "included" : "unpaid",
    service.price,
    membershipBenefit,
    note,
    nowIso(),
  );
  return id;
}

function syncCustomer(user, snapshot) {
  const profile = snapshot.customer || {};
  const name = requireText(profile.name, "Name", 120, 2);
  const email = validEmail(profile.email);
  const phone = optionalText(profile.phone, "Phone", 40);
  const gender = validateGender(profile.gender, true);
  const preference = ["any", "male", "female", "nonbinary"].includes(
    profile.preferredBarberGender,
  )
    ? profile.preferredBarberGender
    : "any";
  const location = optionalText(profile.location, "City", 100);
  const region =
    profile.state && INDIA_REGIONS.has(profile.state)
      ? profile.state
      : user.region;
  db.prepare(
    "UPDATE users SET name=?,email=?,email_lc=?,phone=?,gender=?,barber_preference=?,location=?,region=? WHERE id=?",
  ).run(
    name,
    email,
    email,
    phone,
    gender,
    preference,
    location,
    region,
    user.id,
  );
  const existing = new Map(
    db
      .prepare(
        "SELECT id,status,payment_status,membership_benefit FROM appointments WHERE customer_id=?",
      )
      .all(user.id)
      .map((row) => [row.id, row]),
  );
  const appointments = Array.isArray(snapshot.appointments)
    ? snapshot.appointments
    : [];
  for (const appointment of appointments) {
    const prior = existing.get(appointment.id);
    if (prior) {
      if (
        appointment.status === "cancelled" &&
        prior.status !== "cancelled" &&
        prior.status !== "completed"
      ) {
        db.prepare(
          "UPDATE appointments SET status='cancelled' WHERE id=? AND customer_id=?",
        ).run(prior.id, user.id);
      }
      continue;
    }
    if (appointment.status !== "pending")
      throw new HttpError(
        400,
        "New customer appointments must begin as pending requests.",
      );
    createAppointment(user, appointment);
  }
  const existingMemberships = new Set(
    db
      .prepare("SELECT id FROM memberships WHERE customer_id=?")
      .all(user.id)
      .map((row) => row.id),
  );
  for (const membership of Array.isArray(snapshot.memberships)
    ? snapshot.memberships
    : []) {
    if (existingMemberships.has(membership.id)) continue;
    const shopId = String(membership.shopId || "");
    const shop = db.prepare("SELECT id FROM shops WHERE id=?").get(shopId);
    if (!shop)
      throw new HttpError(
        404,
        "Choose a Fade Masters-registered shop for membership.",
      );
    const benefits =
      user.gender === "female"
        ? ["layercut", "browdesign", "cleanup"]
        : user.gender === "male"
          ? ["haircut", "beardshape", "faceclean"]
          : [];
    if (
      !benefits.length ||
      !benefits.every((id) => {
        const service = serviceRecord(id, shopId);
        return service && audienceAllows(userView(user), service);
      })
    )
      throw new HttpError(
        400,
        "This shop does not offer all membership facilities matching your profile.",
      );
    db.prepare(
      "INSERT INTO memberships (id,customer_id,shop_id,status,plan_price,payment_status,requested_at) VALUES (?,?,?,'pending',499,'demo_unpaid',?)",
    ).run(randomId("member"), user.id, shop.id, nowIso());
  }
}

function syncBarber(user, snapshot) {
  const prior = new Map(
    db
      .prepare(
        "SELECT id,status,payment_status FROM appointments WHERE barber_id=?",
      )
      .all(user.id)
      .map((row) => [row.id, row]),
  );
  for (const appointment of Array.isArray(snapshot.appointments)
    ? snapshot.appointments
    : []) {
    const old = prior.get(appointment.id);
    if (!old || appointment.status === old.status) continue;
    if (
      old.status === "pending" &&
      ["confirmed", "cancelled"].includes(appointment.status)
    ) {
      db.prepare(
        "UPDATE appointments SET status=? WHERE id=? AND barber_id=?",
      ).run(appointment.status, old.id, user.id);
    } else if (
      old.status === "confirmed" &&
      appointment.status === "completed"
    ) {
      db.prepare(
        "UPDATE appointments SET status='completed' WHERE id=? AND barber_id=?",
      ).run(old.id, user.id);
    } else {
      throw new HttpError(
        403,
        "That appointment status change is not allowed.",
      );
    }
    if (
      appointment.paymentStatus === "paid" &&
      old.payment_status === "unpaid" &&
      appointment.status === "completed"
    ) {
      db.prepare(
        "UPDATE appointments SET payment_status='recorded' WHERE id=? AND barber_id=?",
      ).run(old.id, user.id);
    }
  }
}

function syncOwner(user, snapshot) {
  const incomingShops = Array.isArray(snapshot.shops) ? snapshot.shops : [];
  const incomingById = new Map(
    incomingShops.map((shop) => [String(shop.id), shop]),
  );
  for (const [id, item] of incomingById) {
    const old = db
      .prepare("SELECT id FROM shops WHERE id=? AND owner_id=?")
      .get(id, user.id);
    const exists = db.prepare("SELECT id FROM shops WHERE id=?").get(id);
    if (old) addOrUpdateShop(user, item, false);
    else if (!exists && item.ownerId === user.id)
      addOrUpdateShop(user, item, true);
  }

  const shopIds = new Set(
    db
      .prepare("SELECT id FROM shops WHERE owner_id=?")
      .all(user.id)
      .map((row) => row.id),
  );
  const customInput = Array.isArray(snapshot.customServices)
    ? snapshot.customServices
    : [];
  const customIds = new Set();
  for (const service of customInput) {
    const shopId = String(service.shopId || "");
    if (!shopIds.has(shopId)) continue;
    const id = requireText(String(service.id || ""), "Service ID", 100);
    const name = requireText(service.name, "Service name", 120, 2);
    const category = requireText(service.category, "Service category", 60);
    const audience = ["male", "female", "all"].includes(service.audience)
      ? service.audience
      : "all";
    const price = Number(service.price);
    const duration = Number(service.duration);
    if (
      !Number.isInteger(price) ||
      price < 0 ||
      price > 1000000 ||
      !Number.isInteger(duration) ||
      duration < 5 ||
      duration > 240
    )
      throw new HttpError(400, "Custom service price or duration is invalid.");
    const existing = db
      .prepare("SELECT owner_id,shop_id FROM custom_services WHERE id=?")
      .get(id);
    if (
      existing &&
      (existing.owner_id !== user.id || existing.shop_id !== shopId)
    )
      throw new HttpError(403, "Cannot edit another shop's service.");
    if (!existing && !/^custom-[a-zA-Z0-9-]{5,90}$/.test(id))
      throw new HttpError(400, "Invalid custom service ID.");
    db.prepare(
      `
      INSERT INTO custom_services (id,shop_id,owner_id,name,category,price,duration,description,audience)
      VALUES (?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,price=excluded.price,duration=excluded.duration,description=excluded.description,audience=excluded.audience
    `,
    ).run(
      id,
      shopId,
      user.id,
      name,
      category,
      price,
      duration,
      optionalText(service.description, "Service description", 500),
      audience,
    );
    customIds.add(id);
  }

  for (const id of shopIds) {
    const incoming = incomingById.get(id);
    if (!incoming) continue;
    setShopServices(
      user,
      id,
      Array.isArray(incoming.services) ? incoming.services : [],
      incoming.servicePrices || {},
    );
  }

  const incomingBarbers = Array.isArray(snapshot.barbers)
    ? snapshot.barbers
    : [];
  for (const barber of incomingBarbers) {
    const barberId = String(barber.id || "");
    const current = db
      .prepare("SELECT * FROM users WHERE id=? AND role='barber'")
      .get(barberId);
    if (current && current.owner_id !== user.id) continue;
    if (!current && barber.ownerId === user.id) {
      const shopId = String(barber.shopId || "");
      if (!shopIds.has(shopId))
        throw new HttpError(
          403,
          "Assign a new barber to one of your own shops.",
        );
      createBarber(user, shopId, barber);
      continue;
    }
    if (!current) continue;
    const profile = JSON.parse(current.profile_json || "{}");
    const updated = {
      ...profile,
      specialty: requireText(
        barber.specialty || profile.specialty,
        "Specialty",
        160,
        2,
      ),
      tier: ["intern", "regular", "specialist"].includes(barber.tier)
        ? barber.tier
        : profile.tier,
      base: Math.min(10000000, Math.max(0, Number(barber.base) || 0)),
      commission: Math.min(
        10000000,
        Math.max(0, Number(barber.commission) || 0),
      ),
      initials: requireText(
        barber.initials || profile.initials || barber.name,
        "Initials",
        6,
      ),
      active: barber.active !== false,
      photo: cleanImage(barber.photo, "Barber photo"),
      workPhotos: Array.isArray(barber.workPhotos)
        ? barber.workPhotos
            .slice(0, 10)
            .map((photo) =>
              typeof photo === "string"
                ? cleanImage(photo, "Work photo")
                : {
                    url: cleanImage(photo.url, "Work photo"),
                    caption: optionalText(photo.caption, "Work caption", 120),
                  },
            )
        : [],
      duties: optionalText(barber.duties || profile.duties, "Duties", 240),
    };
    const email = validEmail(barber.email || current.email);
    db.prepare(
      "UPDATE users SET name=?,email=?,email_lc=?,gender=?,active=?,profile_json=? WHERE id=? AND owner_id=?",
    ).run(
      requireText(barber.name, "Barber name", 120, 2),
      email,
      email,
      validateGender(barber.gender, true),
      updated.active ? 1 : 0,
      JSON.stringify(updated),
      current.id,
      user.id,
    );
  }

  const staffInput =
    snapshot.shopStaff && typeof snapshot.shopStaff === "object"
      ? snapshot.shopStaff
      : {};
  for (const shopId of shopIds) {
    const row = incomingById.get(shopId);
    const desired = Array.isArray(staffInput[shopId])
      ? staffInput[shopId]
      : Array.isArray(row?.barberIds)
        ? row.barberIds
        : [];
    const allowed = desired.filter((barberId) => {
      const barber = db
        .prepare(
          "SELECT id FROM users WHERE id=? AND role='barber' AND owner_id=? AND active=1",
        )
        .get(String(barberId), user.id);
      return Boolean(barber);
    });
    db.prepare(
      "DELETE FROM barber_shops WHERE shop_id=? AND barber_id IN (SELECT id FROM users WHERE owner_id=?)",
    ).run(shopId, user.id);
    const link = db.prepare(
      "INSERT OR IGNORE INTO barber_shops (shop_id,barber_id) VALUES (?,?)",
    );
    for (const barberId of new Set(allowed)) link.run(shopId, barberId);
  }

  const settings = snapshot.ownerSettings?.[user.id] || {};
  const incentiveAmount = Math.min(
    10000000,
    Math.max(0, Math.round(Number(settings.amount) || 0)),
  );
  const incentiveTarget = Math.min(
    10000,
    Math.max(1, Math.round(Number(settings.target) || 20)),
  );
  const commissionRate = Math.min(
    5,
    Math.max(1, Math.round(Number(snapshot.commissionRate) || 3)),
  );
  db.prepare(
    `
    INSERT INTO owner_settings (owner_id,incentive_amount,incentive_target,commission_rate) VALUES (?,?,?,?)
    ON CONFLICT(owner_id) DO UPDATE SET incentive_amount=excluded.incentive_amount,incentive_target=excluded.incentive_target,commission_rate=excluded.commission_rate
  `,
  ).run(user.id, incentiveAmount, incentiveTarget, commissionRate);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const payroll =
    snapshot.payrollPaid && typeof snapshot.payrollPaid === "object"
      ? snapshot.payrollPaid
      : {};
  for (const [barberId, paid] of Object.entries(payroll)) {
    if (
      !db
        .prepare(
          "SELECT id FROM users WHERE id=? AND role='barber' AND owner_id=?",
        )
        .get(barberId, user.id)
    )
      continue;
    db.prepare(
      "INSERT INTO payroll (barber_id,month,paid) VALUES (?,?,?) ON CONFLICT(barber_id,month) DO UPDATE SET paid=excluded.paid",
    ).run(barberId, currentMonth, paid ? 1 : 0);
  }

  const incomingMemberships = Array.isArray(snapshot.memberships)
    ? snapshot.memberships
    : [];
  for (const membership of incomingMemberships) {
    if (!["active", "cancelled"].includes(membership.status)) continue;
    db.prepare(
      `
      UPDATE memberships SET status=? WHERE id=? AND status='pending'
      AND shop_id IN (SELECT id FROM shops WHERE owner_id=?)
    `,
    ).run(membership.status, membership.id, user.id);
  }

  const incomingPromotions = Array.isArray(snapshot.promotions)
    ? snapshot.promotions
    : [];
  const allowedPromotions = incomingPromotions.filter((promo) =>
    shopIds.has(String(promo.shopId || "")),
  );
  const existingPromotionIds = new Set(
    db
      .prepare("SELECT id FROM promotions WHERE owner_id=?")
      .all(user.id)
      .map((row) => row.id),
  );
  for (const promo of allowedPromotions) {
    const id = String(promo.id || "");
    if (existingPromotionIds.has(id)) continue;
    db.prepare(
      "INSERT INTO promotions (id,owner_id,shop_id,name,discount,ends,description) VALUES (?,?,?,?,?,?,?)",
    ).run(
      randomId("promo"),
      user.id,
      String(promo.shopId),
      requireText(promo.name, "Promotion name", 120, 2),
      Math.min(90, Math.max(1, Number(promo.discount) || 1)),
      optionalText(promo.ends, "Promotion end date", 10),
      requireText(promo.description, "Promotion details", 300, 2),
    );
  }
}

function syncState(user, snapshot) {
  if (!snapshot || typeof snapshot !== "object")
    throw new HttpError(400, "Invalid app state.");
  transaction(() => {
    if (user.role === "customer") syncCustomer(user, snapshot);
    else if (user.role === "barber") syncBarber(user, snapshot);
    else syncOwner(user, snapshot);
  });
  return bootstrap(sqlUser.get(user.id));
}

function createSession(user, res) {
  db.prepare("DELETE FROM sessions WHERE expires_at<=?").run(Date.now());
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  db.prepare(
    "INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)",
  ).run(sha256(token), user.id, expiresAt, nowIso());
  const secure =
    process.env.COOKIE_SECURE === "1" || process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `fm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure ? "; Secure" : ""}`,
  );
}

function clearSession(req, res) {
  const cookies = Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [
          item.slice(0, index),
          decodeURIComponent(item.slice(index + 1)),
        ];
      }),
  );
  if (cookies.fm_session)
    db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
      sha256(cookies.fm_session),
    );
  res.setHeader(
    "Set-Cookie",
    "fm_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
  );
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024)
      throw new HttpError(413, "Request body is too large.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Request must contain valid JSON.");
  }
}

function sendJson(res, status, value) {
  const data = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(data);
}

function checkOrigin(req) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host)
    throw new HttpError(403, "Cross-origin changes are not allowed.");
}

async function placesSearch(url) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { available: false, results: [] };
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lng"));
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    throw new HttpError(
      400,
      "Valid coordinates are required for nearby Google Places discovery.",
    );
  }
  const query = optionalText(
    url.searchParams.get("query") || "salon and barber shop",
    "Search query",
    120,
  );
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: { center: { latitude, longitude }, radius: 15000 },
        },
        maxResultCount: 10,
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok)
    throw new HttpError(
      502,
      "Google Places could not return nearby results. Check the server key and Places API access.",
    );
  const payload = await response.json();
  return {
    available: true,
    results: (payload.places || []).map((place) => ({
      id: place.id,
      name: place.displayName?.text || "Salon listing",
      address: place.formattedAddress || "",
      lat: place.location?.latitude ?? null,
      lng: place.location?.longitude ?? null,
      mapsUrl: place.googleMapsUri || "",
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? 0,
      source: "Google Places",
      bookable: false,
    })),
  };
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const rad = (value) => (value * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function apiRoute(req, res, url) {
  checkOrigin(req);
  const user = currentUser(req);
  const route = `${req.method} ${url.pathname}`;

  if (route === "GET /api/health")
    return sendJson(res, 200, { ok: true, database: "sqlite" });
  if (route === "GET /api/bootstrap")
    return sendJson(res, 200, bootstrap(user));
  if (route === "POST /api/auth/signup") {
    const body = await readJson(req);
    const role = String(body.role || "customer");
    if (!["customer", "owner"].includes(role))
      throw new HttpError(
        400,
        "Choose customer or shop owner account creation.",
      );
    const name = requireText(
      body.name,
      role === "owner" ? "Owner name" : "Full name",
      120,
      2,
    );
    const email = validEmail(body.email);
    const phone = optionalText(body.phone, "Phone", 40);
    const gender = role === "customer" ? validateGender(body.gender) : "";
    const region =
      body.state && INDIA_REGIONS.has(body.state) ? body.state : "";
    const account = transaction(() =>
      createUser({
        role,
        name,
        email,
        password: body.password,
        phone,
        gender,
        preferredBarberGender: ["any", "male", "female", "nonbinary"].includes(
          body.preferredBarberGender,
        )
          ? body.preferredBarberGender
          : "any",
        location: optionalText(body.location, "City", 100),
        region,
      }),
    );
    createSession(account, res);
    return sendJson(res, 201, bootstrap(account));
  }
  if (route === "POST /api/auth/login") {
    const body = await readJson(req);
    const role = String(body.role || "");
    if (!["customer", "owner", "barber"].includes(role))
      throw new HttpError(400, "Choose a valid account type.");
    const identifier = requireText(
      body.identifier,
      "Email or employee ID",
      254,
    ).toLowerCase();
    const attemptKey = authAttemptKey(req, identifier);
    checkAuthRateLimit(attemptKey);
    const account = db
      .prepare(
        `
      SELECT * FROM users WHERE role=? AND active=1 AND
      (email_lc=? OR (role='barber' AND lower(employee_id)=?))
    `,
      )
      .get(role, identifier, identifier);
    const passwordMatches = verifyPassword(
      body.password,
      account?.password_salt || dummyPasswordRecord.salt,
      account?.password_hash || dummyPasswordRecord.hash,
    );
    if (!account || !passwordMatches) {
      recordAuthFailure(attemptKey);
      throw new HttpError(401, "Email, employee ID, or password is incorrect.");
    }
    authFailures.delete(attemptKey);
    createSession(account, res);
    return sendJson(res, 200, bootstrap(account));
  }
  if (route === "POST /api/auth/logout") {
    clearSession(req, res);
    return sendJson(res, 200, { ok: true });
  }
  if (route === "GET /api/shops/nearby") {
    requireRole(user, ["customer"]);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));
    const radiusKm = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("radiusKm")) || 40),
    );
    if (
      !Number.isFinite(lat) ||
      Math.abs(lat) > 90 ||
      !Number.isFinite(lng) ||
      Math.abs(lng) > 180
    )
      throw new HttpError(400, "Valid latitude and longitude are required.");
    const results = db
      .prepare("SELECT * FROM shops WHERE lat IS NOT NULL AND lng IS NOT NULL")
      .all()
      .map((row) => {
        const shop = shopView(row);
        return { ...shop, distanceKm: distanceKm(lat, lng, row.lat, row.lng) };
      })
      .filter(
        (shop) =>
          shop.distanceKm <= radiusKm &&
          shopServices(shop.id).some((service) =>
            audienceAllows(userView(user), service),
          ),
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
    return sendJson(res, 200, { radiusKm, shops: results });
  }
  if (route === "GET /api/discovery/places") {
    requireRole(user, ["customer"]);
    return sendJson(res, 200, await placesSearch(url));
  }
  if (route === "PUT /api/state") {
    requireRole(user, ["customer", "owner", "barber"]);
    const body = await readJson(req);
    return sendJson(res, 200, syncState(user, body.state));
  }
  if (route === "GET /api/commission") {
    requireRole(user, ["owner"]);
    return sendJson(res, 200, bootstrap(user).state.commissionSummary);
  }

  const profileMatch = url.pathname.match(/^\/api\/barbers\/([^/]+)$/);
  if (req.method === "PATCH" && profileMatch) {
    requireRole(user, ["owner"]);
    const barber = db
      .prepare(
        "SELECT * FROM users WHERE id=? AND role='barber' AND owner_id=?",
      )
      .get(decodeURIComponent(profileMatch[1]), user.id);
    if (!barber) throw new HttpError(404, "Barber not found in your account.");
    const body = await readJson(req);
    const profile = JSON.parse(barber.profile_json || "{}");
    for (const shopId of db
      .prepare("SELECT shop_id FROM barber_shops WHERE barber_id=?")
      .all(barber.id)
      .map((row) => row.shop_id)) {
      if (
        !db
          .prepare("SELECT id FROM shops WHERE id=? AND owner_id=?")
          .get(shopId, user.id)
      )
        throw new HttpError(403, "Barber is not managed by this owner.");
    }
    const update = {
      ...profile,
      specialty: requireText(
        body.specialty ?? profile.specialty,
        "Specialty",
        160,
        2,
      ),
      tier: ["intern", "regular", "specialist"].includes(body.tier)
        ? body.tier
        : profile.tier,
      base: Math.max(
        0,
        Math.min(10000000, Number(body.base ?? profile.base) || 0),
      ),
      commission: Math.max(
        0,
        Math.min(10000000, Number(body.commission ?? profile.commission) || 0),
      ),
      photo: cleanImage(body.photo ?? profile.photo, "Barber photo"),
    };
    db.prepare("UPDATE users SET profile_json=? WHERE id=? AND owner_id=?").run(
      JSON.stringify(update),
      barber.id,
      user.id,
    );
    return sendJson(res, 200, bootstrap(user));
  }

  const shopMatch = url.pathname.match(
    /^\/api\/shops\/([^/]+)(?:\/(services|barbers))?$/,
  );
  if (shopMatch) {
    const shopId = decodeURIComponent(shopMatch[1]);
    if (req.method === "PATCH" && !shopMatch[2]) {
      requireRole(user, ["owner"]);
      const body = await readJson(req);
      transaction(() => addOrUpdateShop(user, { ...body, id: shopId }, false));
      return sendJson(res, 200, bootstrap(user));
    }
    if (req.method === "PUT" && shopMatch[2] === "services") {
      requireRole(user, ["owner"]);
      const body = await readJson(req);
      transaction(() => {
        const custom = Array.isArray(body.customServices)
          ? body.customServices
          : [];
        for (const service of custom) {
          if (service.shopId !== shopId) continue;
          const id = requireText(service.id, "Service ID", 100);
          const name = requireText(service.name, "Service name", 120, 2);
          const category = requireText(
            service.category,
            "Service category",
            60,
          );
          const audience = ["male", "female", "all"].includes(service.audience)
            ? service.audience
            : "all";
          const price = Number(service.price);
          const duration = Number(service.duration);
          if (
            !Number.isInteger(price) ||
            price < 0 ||
            !Number.isInteger(duration) ||
            duration < 5 ||
            duration > 240
          )
            throw new HttpError(400, "Custom service values are invalid.");
          const existing = db
            .prepare("SELECT owner_id,shop_id FROM custom_services WHERE id=?")
            .get(id);
          if (
            existing &&
            (existing.owner_id !== user.id || existing.shop_id !== shopId)
          )
            throw new HttpError(403, "Cannot replace another shop's service.");
          db.prepare(
            "INSERT INTO custom_services (id,shop_id,owner_id,name,category,price,duration,description,audience) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,price=excluded.price,duration=excluded.duration,description=excluded.description,audience=excluded.audience",
          ).run(
            id,
            shopId,
            user.id,
            name,
            category,
            price,
            duration,
            optionalText(service.description, "Description", 500),
            audience,
          );
        }
        setShopServices(user, shopId, body.services, body.servicePrices || {});
      });
      return sendJson(res, 200, bootstrap(user));
    }
    if (req.method === "POST" && shopMatch[2] === "barbers") {
      requireRole(user, ["owner"]);
      const body = await readJson(req);
      const barber = transaction(() => createBarber(user, shopId, body));
      return sendJson(res, 201, {
        barber: userView(barber),
        invite: {
          email: barber.email,
          employeeId: barber.employeeId,
          temporaryPassword: body.password,
          delivery: "preview_only",
        },
        ...bootstrap(user),
      });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/shops") {
    requireRole(user, ["owner"]);
    const body = await readJson(req);
    transaction(() => addOrUpdateShop(user, body, true));
    return sendJson(res, 201, bootstrap(user));
  }
  if (req.method === "POST" && url.pathname === "/api/bookings") {
    requireRole(user, ["customer"]);
    const body = await readJson(req);
    const id = transaction(() => createAppointment(user, body));
    return sendJson(res, 201, { id, ...bootstrap(user) });
  }
  const bookingMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (req.method === "PATCH" && bookingMatch) {
    requireRole(user, ["customer", "barber"]);
    const id = decodeURIComponent(bookingMatch[1]);
    const body = await readJson(req);
    const appointment = db
      .prepare("SELECT * FROM appointments WHERE id=?")
      .get(id);
    if (!appointment) throw new HttpError(404, "Appointment not found.");
    if (user.role === "customer") {
      if (
        appointment.customer_id !== user.id ||
        body.status !== "cancelled" ||
        ["cancelled", "completed"].includes(appointment.status)
      )
        throw new HttpError(403, "You cannot make that appointment change.");
      db.prepare("UPDATE appointments SET status='cancelled' WHERE id=?").run(
        id,
      );
    } else {
      if (appointment.barber_id !== user.id)
        throw new HttpError(403, "This appointment belongs to another barber.");
      const allowed =
        (appointment.status === "pending" &&
          ["confirmed", "cancelled"].includes(body.status)) ||
        (appointment.status === "confirmed" && body.status === "completed");
      if (body.status === "confirmed" && allowed)
        db.prepare("UPDATE appointments SET status='confirmed' WHERE id=?").run(
          id,
        );
      else if (body.status === "cancelled" && allowed)
        db.prepare("UPDATE appointments SET status='cancelled' WHERE id=?").run(
          id,
        );
      else if (body.status === "completed" && allowed)
        db.prepare("UPDATE appointments SET status='completed' WHERE id=?").run(
          id,
        );
      else if (
        body.paymentStatus === "paid" &&
        appointment.status === "completed" &&
        appointment.payment_status === "unpaid"
      )
        db.prepare(
          "UPDATE appointments SET payment_status='recorded' WHERE id=?",
        ).run(id);
      else throw new HttpError(403, "That appointment change is not allowed.");
    }
    return sendJson(res, 200, bootstrap(user));
  }
  if (req.method === "POST" && url.pathname === "/api/memberships") {
    requireRole(user, ["customer"]);
    const body = await readJson(req);
    const shop = db
      .prepare("SELECT id FROM shops WHERE id=?")
      .get(String(body.shopId || ""));
    if (!shop)
      throw new HttpError(404, "Choose a Fade Masters-registered shop.");
    const existing = db
      .prepare(
        "SELECT id FROM memberships WHERE customer_id=? AND shop_id=? AND status IN ('pending','active')",
      )
      .get(user.id, shop.id);
    if (existing)
      throw new HttpError(
        409,
        "You already have a pending or active membership request at this shop.",
      );
    transaction(() =>
      db
        .prepare(
          "INSERT INTO memberships (id,customer_id,shop_id,status,plan_price,payment_status,requested_at) VALUES (?,?,?,'pending',499,'demo_unpaid',?)",
        )
        .run(randomId("member"), user.id, shop.id, nowIso()),
    );
    return sendJson(res, 201, bootstrap(user));
  }
  if (req.method === "PATCH" && url.pathname.startsWith("/api/memberships/")) {
    requireRole(user, ["owner"]);
    const id = decodeURIComponent(
      url.pathname.slice("/api/memberships/".length),
    );
    const body = await readJson(req);
    const status = String(body.status || "");
    if (!["active", "cancelled"].includes(status))
      throw new HttpError(400, "Choose approve or decline.");
    const result = db
      .prepare(
        `
      UPDATE memberships SET status=? WHERE id=? AND status='pending'
      AND shop_id IN (SELECT id FROM shops WHERE owner_id=?)
    `,
      )
      .run(status, id, user.id);
    if (!result.changes)
      throw new HttpError(404, "Membership request not found in your shops.");
    return sendJson(res, 200, bootstrap(user));
  }
  if (req.method === "PUT" && url.pathname === "/api/payroll") {
    requireRole(user, ["owner"]);
    const body = await readJson(req);
    const barberId = requireText(body.barberId, "Barber ID", 100);
    if (
      !db
        .prepare(
          "SELECT id FROM users WHERE id=? AND role='barber' AND owner_id=?",
        )
        .get(barberId, user.id)
    )
      throw new HttpError(404, "Barber not found in your team.");
    const month = new Date().toISOString().slice(0, 7);
    db.prepare(
      "INSERT INTO payroll (barber_id,month,paid) VALUES (?,?,?) ON CONFLICT(barber_id,month) DO UPDATE SET paid=excluded.paid",
    ).run(barberId, month, body.paid ? 1 : 0);
    return sendJson(res, 200, bootstrap(user));
  }

  throw new HttpError(404, "API route not found.");
}

function staticFile(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD")
    throw new HttpError(405, "Method not allowed.");
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!["/index.html"].includes(requested))
    throw new HttpError(404, "File not found.");
  const file = path.join(ROOT, "index.html");
  const content = fs.readFileSync(file);
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": content.length,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  res.end(req.method === "HEAD" ? undefined : content);
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (url.pathname.startsWith("/api/")) await apiRoute(req, res, url);
      else staticFile(req, res, url);
    } catch (error) {
      if (res.headersSent) return res.destroy();
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error(error);
      sendJson(res, status, {
        error:
          status === 500
            ? "The server could not complete this request."
            : error.message,
      });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, "127.0.0.1", () =>
    console.log(`Fade Masters listening at http://127.0.0.1:${port}`),
  );
}

module.exports = { createServer, db, DB_PATH };

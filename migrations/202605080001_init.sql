CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_user (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  process TEXT,
  material TEXT,
  lead_time_days INTEGER,
  price_hint TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_sku (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  attributes_json TEXT NOT NULL DEFAULT '{}',
  price_min INTEGER,
  price_max INTEGER,
  currency TEXT NOT NULL DEFAULT 'CNY',
  stock_qty INTEGER,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sku_code ON product_sku(sku_code);
CREATE INDEX IF NOT EXISTS idx_product_sku_product_id ON product_sku(product_id);

CREATE TABLE IF NOT EXISTS case_study (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_media (
  product_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, media_id),
  FOREIGN KEY (product_id) REFERENCES product(id),
  FOREIGN KEY (media_id) REFERENCES media(id)
);

CREATE TABLE IF NOT EXISTS case_media (
  case_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (case_id, media_id),
  FOREIGN KEY (case_id) REFERENCES case_study(id),
  FOREIGN KEY (media_id) REFERENCES media(id)
);

CREATE TABLE IF NOT EXISTS case_product (
  case_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  PRIMARY KEY (case_id, product_id),
  FOREIGN KEY (case_id) REFERENCES case_study(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS inquiry (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  product_id TEXT,
  sku_id TEXT,
  request_json TEXT NOT NULL,
  estimate_json TEXT,
  pricing_rule_version TEXT,
  internal_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiry_status ON inquiry(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_type ON inquiry(inquiry_type);

CREATE TABLE IF NOT EXISTS inquiry_attachment (
  inquiry_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  PRIMARY KEY (inquiry_id, media_id),
  FOREIGN KEY (inquiry_id) REFERENCES inquiry(id),
  FOREIGN KEY (media_id) REFERENCES media(id)
);

CREATE TABLE IF NOT EXISTS pricing_rule (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  rule_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_rule_version ON pricing_rule(version);

import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, serial, customType, index } from 'drizzle-orm/pg-core';

const bytea = customType({ dataType: () => 'bytea' });
const ts = (name) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('owner'), // owner | staff (staff: leads only)
  active: boolean('active').notNull().default(true),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: ts('created_at'),
});

export const adminSessions = pgTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: uuid('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: ts('created_at'),
});

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  data: bytea('data').notNull(),
  createdAt: ts('created_at'),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  industry: text('industry').notNull().default(''),
  service: text('service').notNull().default(''),
  status: text('status').notNull().default('new'), // new | contacted | qualified | client | lost
  notes: text('notes').notNull().default(''),
  source: text('source').notNull().default('direct'),
  utmSource: text('utm_source').notNull().default(''),
  utmMedium: text('utm_medium').notNull().default(''),
  utmCampaign: text('utm_campaign').notNull().default(''),
  utmContent: text('utm_content').notNull().default(''),
  referrer: text('referrer').notNull().default(''),
  createdAt: ts('created_at'),
  updatedAt: ts('updated_at'),
}, (t) => [index('leads_created_idx').on(t.createdAt)]);

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: ts('updated_at'),
});

// Plain SQL kept in sync with the tables above; applied automatically on first use.
export const SCHEMA_SQL = `
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(), email text not null unique, name text not null, password_hash text not null,
  role text not null default 'owner' check (role in ('owner','staff')), active boolean not null default true,
  failed_attempts integer not null default 0, locked_until timestamptz, last_login_at timestamptz, created_at timestamptz not null default now());
create table if not exists admin_sessions (
  token_hash text primary key, user_id uuid not null references admin_users(id) on delete cascade,
  expires_at timestamptz not null, created_at timestamptz not null default now());
create table if not exists media (
  id uuid primary key default gen_random_uuid(), filename text not null, mime text not null, size integer not null, data bytea not null,
  created_at timestamptz not null default now());
create table if not exists leads (
  id serial primary key, name text not null, phone text not null, industry text not null default '', service text not null default '',
  status text not null default 'new' check (status in ('new','contacted','qualified','client','lost')), notes text not null default '',
  source text not null default 'direct', utm_source text not null default '', utm_medium text not null default '',
  utm_campaign text not null default '', utm_content text not null default '', referrer text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists leads_created_idx on leads(created_at);
create table if not exists settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
`;

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

// ─── Clients (Businesses) ───────────────────────────────────────────────────
export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  email: text("email"),
  phone: text("phone"),
  country: text("country"),
  address: text("address"),
  logoUrl: text("logo_url"),
  website: text("website"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Roles ──────────────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Better Auth: Users ─────────────────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phone: text("phone"),
  country: text("country"),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Better Auth: Sessions ──────────────────────────────────────────────────
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// ─── Better Auth: Accounts (OAuth providers) ────────────────────────────────
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Better Auth: Verification (email verification, password reset) ─────────
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Subscription Plans ─────────────────────────────────────────────────────
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  priceMonthly: integer("price_monthly").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  features: jsonb("features").$type<string[]>().default([]),
  maxMembers: integer("max_members").notNull().default(1),
  maxApiKeys: integer("max_api_keys").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Client Subscriptions ───────────────────────────────────────────────────
export const clientSubscriptions = pgTable("client_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("active"), // active, cancelled, past_due, trialing
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Client API Keys (Encrypted) ────────────────────────────────────────────
export const clientApiKeys = pgTable("client_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Member Invites ─────────────────────────────────────────────────────────
export const memberInvites = pgTable("member_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, expired, revoked
  invitedBy: text("invited_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Review Profiles (Review Sources / Platforms) ───────────────────────────
export const reviewProfiles = pgTable("review_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Ibis Styles Hotel - TripAdvisor"
  platform: text("platform").notNull(), // tripadvisor, g2, capterra, trustpilot, google, appstore, playstore, etc.
  platformProfileId: text("platform_profile_id"), // external ID on the platform
  profileUrl: text("profile_url"), // URL to the profile on the platform
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  isCompetitor: boolean("is_competitor").notNull().default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status").default("pending"), // pending, syncing, synced, error
  syncError: text("sync_error"),
  credentials: jsonb("credentials"), // encrypted OAuth tokens / API keys
  metadata: jsonb("metadata"), // platform-specific metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => reviewProfiles.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  externalId: text("external_id"), // ID on the external platform
  rating: integer("rating"), // 1-5
  title: text("title"),
  body: text("body"),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  authorAvatar: text("author_avatar"),
  reviewUrl: text("review_url"),
  reviewedAt: timestamp("reviewed_at"),
  sentiment: text("sentiment"), // positive, neutral, negative
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }),
  topics: jsonb("topics").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  language: text("language").default("en"),
  translatedBody: text("translated_body"),
  isPublic: boolean("is_public").notNull().default(true),
  needsAction: boolean("needs_action").notNull().default(false),
  actionNote: text("action_note"),
  replyText: text("reply_text"),
  repliedAt: timestamp("replied_at"),
  repliedBy: text("replied_by").references(() => user.id, { onDelete: "set null" }),
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  isVerified: boolean("is_verified").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Contacts ────────────────────────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata"),
  source: text("source"), // manual, import, crm_sync
  externalId: text("external_id"), // CRM ID
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Campaigns (Review Generation) ──────────────────────────────────────────
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("email"), // email, sms, whatsapp, magic_link, qr_code
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  targetPlatforms: jsonb("target_platforms").$type<string[]>().default([]),
  subject: text("subject"),
  messageTemplate: text("message_template"),
  magicLinkUrl: text("magic_link_url"),
  triggerEvent: text("trigger_event"), // manual, post_onboarding, post_nps, post_support
  isIncentivized: boolean("is_incentivized").notNull().default(false),
  incentiveDetails: text("incentive_details"),
  reputationProtection: boolean("reputation_protection").notNull().default(false),
  reputationThreshold: integer("reputation_threshold").default(3), // route below this rating to private feedback
  totalSent: integer("total_sent").notNull().default(0),
  totalOpened: integer("total_opened").notNull().default(0),
  totalClicked: integer("total_clicked").notNull().default(0),
  totalReviewed: integer("total_reviewed").notNull().default(0),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Campaign Requests ───────────────────────────────────────────────────────
export const campaignRequests = pgTable("campaign_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  recipientName: text("recipient_name"),
  status: text("status").notNull().default("pending"), // pending, sent, opened, clicked, reviewed, bounced
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "set null" }),
  trackingToken: text("tracking_token").unique(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Automations ─────────────────────────────────────────────────────────────
export const automations = pgTable("automations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  triggerType: text("trigger_type").notNull(), // new_review, rating_below, rating_above, keyword_match, sentiment_negative
  triggerConditions: jsonb("trigger_conditions"), // { platforms: [], minRating: 1, maxRating: 5, keywords: [] }
  actionType: text("action_type").notNull(), // email_alert, slack_notification, teams_notification, webhook, tag_review, assign_review
  actionConfig: jsonb("action_config"), // { to: [], channel: '', webhookUrl: '', tag: '' }
  lastTriggeredAt: timestamp("last_triggered_at"),
  triggerCount: integer("trigger_count").notNull().default(0),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Automation Logs ─────────────────────────────────────────────────────────
export const automationLogs = pgTable("automation_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  automationId: uuid("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "set null" }),
  status: text("status").notNull(), // success, failed
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

// ─── Integrations ────────────────────────────────────────────────────────────
export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // slack, gmail, outlook, teams, live_agent, zapier, hubspot, salesforce
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config"), // { webhookUrl, channelId, botToken, etc. }
  credentials: jsonb("credentials"), // encrypted OAuth tokens
  lastUsedAt: timestamp("last_used_at"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Widgets ─────────────────────────────────────────────────────────────────
export const widgets = pgTable("widgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // carousel, wall_of_love, badge, single_review
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config"), // { minRating, platforms, tags, colors, font, layout }
  embedCode: text("embed_code"),
  viewCount: integer("view_count").notNull().default(0),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

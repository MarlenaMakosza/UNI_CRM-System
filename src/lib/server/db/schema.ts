import { pgTable, serial, integer, varchar, timestamp, decimal, text, date, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table (PH + Manager)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'PH' | 'MANAGER'
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  territory: varchar("territory", { length: 50 }), // 'Poznan' | 'Wroclaw' | 'Szczecin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leads table (companies/prospects)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(), // 'Poznan' | 'Wroclaw' | 'Szczecin'
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(), // osoba decyzyjna
  leadSource: varchar("lead_source", { length: 100 }).notNull(), // Internet/Prasa/etc
  status: varchar("status", { length: 20 }).notNull().default("NEW"), // NEW/QUALIFIED/ACTIVE/INACTIVE
  assignedTo: integer("assigned_to").references(() => users.id),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Constraint: phone OR email must be provided
  checkContact: check("check_contact", "phone IS NOT NULL OR email IS NOT NULL"),
}));

// Activities table (phone contacts)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityDate: date("activity_date").notNull(),
  contactPersonName: varchar("contact_person_name", { length: 255 }),
  outcome: varchar("outcome", { length: 50 }).notNull(), // NO_ANSWER/MEETING_SET/etc
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Visits table
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PLANNED"), // PLANNED/DONE/CANCELLED/NO_SHOW
  visitNotes: text("visit_notes"),
  competitorPrices: text("competitor_prices"), // TEXT field for prices
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contracts table (optional)
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  signedAt: date("signed_at").notNull(),
  products: text("products"),
  terms: text("terms"),
  contractValue: decimal("contract_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lucia sessions table
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  activities: many(activities),
  visits: many(visits),
  contracts: many(contracts),
  sessions: many(sessions),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  activities: many(activities),
  visits: many(visits),
  contracts: many(contracts),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  lead: one(leads, {
    fields: [visits.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [visits.userId],
    references: [users.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  lead: one(leads, {
    fields: [contracts.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

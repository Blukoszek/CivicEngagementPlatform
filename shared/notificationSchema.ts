import { pgTable, varchar, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'event_reminder', 'petition_milestone', 'forum_reply', etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url", { length: 500 }),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority", { length: 20 }).default("normal"), // 'low', 'normal', 'high', 'urgent'
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// User activity tracking
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'created_post', 'signed_petition', 'attended_event'
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'post', 'petition', 'event'
  entityId: integer("entity_id").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community engagement metrics
export const engagementMetrics = pgTable("engagement_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  activeUsers: integer("active_users").default(0),
  newPosts: integer("new_posts").default(0),
  newEvents: integer("new_events").default(0),
  newPetitions: integer("new_petitions").default(0),
  petitionSignatures: integer("petition_signatures").default(0),
  eventAttendances: integer("event_attendances").default(0),
  forumEngagement: integer("forum_engagement").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trending topics tracking
export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  topic: varchar("topic", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  mentions: integer("mentions").default(1),
  engagementScore: integer("engagement_score").default(0),
  timeWindow: varchar("time_window", { length: 20 }).default("24h"), // '1h', '24h', '7d', '30d'
  lastMentioned: timestamp("last_mentioned").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User follows/subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'forum', 'topic', 'user'
  entityId: integer("entity_id").notNull(),
  subscriptionType: varchar("subscription_type", { length: 50 }).default("follow"), // 'follow', 'notify', 'digest'
  createdAt: timestamp("created_at").defaultNow(),
});

// Types and schemas
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export const insertNotificationSchema = createInsertSchema(notifications);

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = typeof userActivity.$inferInsert;
export const insertUserActivitySchema = createInsertSchema(userActivity);

export type EngagementMetrics = typeof engagementMetrics.$inferSelect;
export type InsertEngagementMetrics = typeof engagementMetrics.$inferInsert;

export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type InsertTrendingTopic = typeof trendingTopics.$inferInsert;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
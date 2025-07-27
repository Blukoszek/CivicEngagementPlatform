import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  interests: text("interests").array(),
  notificationPreferences: jsonb("notification_preferences"),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'location' or 'topic'
  location: varchar("location", { length: 255 }),
  parentId: integer("parent_id"),
  tags: text("tags").array(),
  memberCount: integer("member_count").default(0),
  postCount: integer("post_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull(),
  forumId: integer("forum_id").notNull(),
  parentId: integer("parent_id"), // for replies
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  isSticky: boolean("is_sticky").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 500 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  organizerId: varchar("organizer_id").notNull(),
  category: varchar("category", { length: 100 }),
  attendeeCount: integer("attendee_count").default(0),
  isVirtual: boolean("is_virtual").default(false),
  meetingUrl: varchar("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const petitions = pgTable("petitions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  targetSignatures: integer("target_signatures").notNull(),
  currentSignatures: integer("current_signatures").default(0),
  creatorId: varchar("creator_id").notNull(),
  category: varchar("category", { length: 100 }),
  externalUrl: varchar("external_url"), // for Change.org integration
  status: varchar("status", { length: 50 }).default("active"), // active, closed, successful
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const representatives = pgTable("representatives", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(), // federal, state, local
  electorate: varchar("electorate", { length: 255 }),
  party: varchar("party", { length: 100 }),
  email: varchar("email"),
  phone: varchar("phone"),
  website: varchar("website"),
  profileImageUrl: varchar("profile_image_url"),
  biography: text("biography"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  author: varchar("author", { length: 255 }),
  source: varchar("source", { length: 255 }).notNull(),
  url: varchar("url").notNull(),
  imageUrl: varchar("image_url"),
  category: varchar("category", { length: 100 }),
  location: varchar("location", { length: 255 }),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status", { length: 50 }).default("attending"), // attending, maybe, not_attending
  createdAt: timestamp("created_at").defaultNow(),
});

export const petitionSignatures = pgTable("petition_signatures", {
  id: serial("id").primaryKey(),
  petitionId: integer("petition_id").notNull(),
  userId: varchar("user_id").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postVotes = pgTable("post_votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  voteType: varchar("vote_type", { length: 10 }).notNull(), // upvote, downvote
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const forumsRelations = relations(forums, ({ many, one }) => ({
  posts: many(posts),
  parent: one(forums, { fields: [forums.parentId], references: [forums.id] }),
  children: many(forums),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  forum: one(forums, { fields: [posts.forumId], references: [forums.id] }),
  parent: one(posts, { fields: [posts.parentId], references: [posts.id] }),
  replies: many(posts),
  votes: many(postVotes),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  attendees: many(eventAttendees),
}));

export const petitionsRelations = relations(petitions, ({ one, many }) => ({
  creator: one(users, { fields: [petitions.creatorId], references: [users.id] }),
  signatures: many(petitionSignatures),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, { fields: [eventAttendees.eventId], references: [events.id] }),
  user: one(users, { fields: [eventAttendees.userId], references: [users.id] }),
}));

export const petitionSignaturesRelations = relations(petitionSignatures, ({ one }) => ({
  petition: one(petitions, { fields: [petitionSignatures.petitionId], references: [petitions.id] }),
  user: one(users, { fields: [petitionSignatures.userId], references: [users.id] }),
}));

export const postVotesRelations = relations(postVotes, ({ one }) => ({
  post: one(posts, { fields: [postVotes.postId], references: [posts.id] }),
  user: one(users, { fields: [postVotes.userId], references: [users.id] }),
}));

// Insert schemas
export const insertForumSchema = createInsertSchema(forums).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  attendeeCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPetitionSchema = createInsertSchema(petitions).omit({
  id: true,
  currentSignatures: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
});

export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Forum = typeof forums.$inferSelect;
export type InsertForum = z.infer<typeof insertForumSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Petition = typeof petitions.$inferSelect;
export type InsertPetition = z.infer<typeof insertPetitionSchema>;
export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type PetitionSignature = typeof petitionSignatures.$inferSelect;
export type PostVote = typeof postVotes.$inferSelect;

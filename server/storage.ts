import {
  users,
  forums,
  posts,
  events,
  petitions,
  representatives,
  newsArticles,
  eventAttendees,
  petitionSignatures,
  postVotes,
  type User,
  type UpsertUser,
  type Forum,
  type InsertForum,
  type Post,
  type InsertPost,
  type Event,
  type InsertEvent,
  type Petition,
  type InsertPetition,
  type Representative,
  type InsertRepresentative,
  type NewsArticle,
  type InsertNewsArticle,
  type EventAttendee,
  type PetitionSignature,
  type PostVote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, ilike, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Forum operations
  getForums(): Promise<Forum[]>;
  getForumsByType(type: string): Promise<Forum[]>;
  getForumById(id: number): Promise<Forum | undefined>;
  createForum(forum: InsertForum): Promise<Forum>;
  
  // Post operations
  getPostsByForum(forumId: number, limit?: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostVotes(postId: number, upvotes: number, downvotes: number): Promise<void>;
  getPostReplies(parentId: number): Promise<Post[]>;
  searchPosts(query: string, limit?: number): Promise<Post[]>;
  
  // Event operations
  getEvents(limit?: number): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByCategory(category: string): Promise<Event[]>;
  
  // Petition operations
  getPetitions(limit?: number): Promise<Petition[]>;
  getActivePetitions(limit?: number): Promise<Petition[]>;
  getPetitionById(id: number): Promise<Petition | undefined>;
  createPetition(petition: InsertPetition): Promise<Petition>;
  signPetition(petitionId: number, userId: string, comment?: string): Promise<void>;
  
  // Representative operations
  getRepresentatives(): Promise<Representative[]>;
  getRepresentativesByLevel(level: string): Promise<Representative[]>;
  createRepresentative(representative: InsertRepresentative): Promise<Representative>;
  
  // News operations
  getNews(limit?: number): Promise<NewsArticle[]>;
  getNewsByCategory(category: string, limit?: number): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  // Vote operations
  voteOnPost(postId: number, userId: string, voteType: 'upvote' | 'downvote'): Promise<void>;
  getUserVoteOnPost(postId: number, userId: string): Promise<PostVote | undefined>;
  
  // Event attendance operations
  attendEvent(eventId: number, userId: string, status?: string): Promise<void>;
  getEventAttendees(eventId: number): Promise<EventAttendee[]>;
  getUserEventStatus(eventId: number, userId: string): Promise<EventAttendee | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Forum operations
  async getForums(): Promise<Forum[]> {
    return await db.select().from(forums).orderBy(asc(forums.name));
  }

  async getForumsByType(type: string): Promise<Forum[]> {
    return await db.select().from(forums).where(eq(forums.type, type)).orderBy(asc(forums.name));
  }

  async getForumById(id: number): Promise<Forum | undefined> {
    const [forum] = await db.select().from(forums).where(eq(forums.id, id));
    return forum;
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const [newForum] = await db.insert(forums).values(forum).returning();
    return newForum;
  }

  // Post operations
  async getPostsByForum(forumId: number, limit = 50): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(eq(posts.forumId, forumId), eq(posts.parentId, null)))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePostVotes(postId: number, upvotes: number, downvotes: number): Promise<void> {
    await db.update(posts).set({ upvotes, downvotes }).where(eq(posts.id, postId));
  }

  async getPostReplies(parentId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.parentId, parentId))
      .orderBy(asc(posts.createdAt));
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(ilike(posts.title, `%${query}%`))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  // Event operations
  async getEvents(limit = 50): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.startTime))
      .limit(limit);
  }

  async getUpcomingEvents(limit = 20): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(gte(events.startTime, new Date()))
      .orderBy(asc(events.startTime))
      .limit(limit);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.category, category))
      .orderBy(asc(events.startTime));
  }

  // Petition operations
  async getPetitions(limit = 50): Promise<Petition[]> {
    return await db
      .select()
      .from(petitions)
      .orderBy(desc(petitions.createdAt))
      .limit(limit);
  }

  async getActivePetitions(limit = 20): Promise<Petition[]> {
    return await db
      .select()
      .from(petitions)
      .where(eq(petitions.status, 'active'))
      .orderBy(desc(petitions.createdAt))
      .limit(limit);
  }

  async getPetitionById(id: number): Promise<Petition | undefined> {
    const [petition] = await db.select().from(petitions).where(eq(petitions.id, id));
    return petition;
  }

  async createPetition(petition: InsertPetition): Promise<Petition> {
    const [newPetition] = await db.insert(petitions).values(petition).returning();
    return newPetition;
  }

  async signPetition(petitionId: number, userId: string, comment?: string): Promise<void> {
    await db.insert(petitionSignatures).values({
      petitionId,
      userId,
      comment,
    });
    
    // Update signature count
    await db
      .update(petitions)
      .set({
        currentSignatures: sql`${petitions.currentSignatures} + 1`,
      })
      .where(eq(petitions.id, petitionId));
  }

  // Representative operations
  async getRepresentatives(): Promise<Representative[]> {
    return await db.select().from(representatives).orderBy(asc(representatives.name));
  }

  async getRepresentativesByLevel(level: string): Promise<Representative[]> {
    return await db
      .select()
      .from(representatives)
      .where(eq(representatives.level, level))
      .orderBy(asc(representatives.name));
  }

  async createRepresentative(representative: InsertRepresentative): Promise<Representative> {
    const [newRep] = await db.insert(representatives).values(representative).returning();
    return newRep;
  }

  // News operations
  async getNews(limit = 50): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getNewsByCategory(category: string, limit = 20): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.category, category))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  // Vote operations
  async voteOnPost(postId: number, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    // Check if user already voted
    const existingVote = await this.getUserVoteOnPost(postId, userId);
    
    if (existingVote) {
      // Update existing vote
      await db
        .update(postVotes)
        .set({ voteType })
        .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
    } else {
      // Create new vote
      await db.insert(postVotes).values({
        postId,
        userId,
        voteType,
      });
    }

    // Recalculate vote counts
    const upvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.voteType, 'upvote')));
    
    const downvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.voteType, 'downvote')));

    await this.updatePostVotes(postId, upvoteCount[0].count, downvoteCount[0].count);
  }

  async getUserVoteOnPost(postId: number, userId: string): Promise<PostVote | undefined> {
    const [vote] = await db
      .select()
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
    return vote;
  }

  // Event attendance operations
  async attendEvent(eventId: number, userId: string, status = 'attending'): Promise<void> {
    await db
      .insert(eventAttendees)
      .values({
        eventId,
        userId,
        status,
      })
      .onConflictDoUpdate({
        target: [eventAttendees.eventId, eventAttendees.userId],
        set: { status },
      });

    // Update attendee count
    const attendeeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.status, 'attending')));

    await db
      .update(events)
      .set({ attendeeCount: attendeeCount[0].count })
      .where(eq(events.id, eventId));
  }

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
  }

  async getUserEventStatus(eventId: number, userId: string): Promise<EventAttendee | undefined> {
    const [attendee] = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    return attendee;
  }
}

export const storage = new DatabaseStorage();

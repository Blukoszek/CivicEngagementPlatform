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

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private forums: Map<number, Forum> = new Map();
  private posts: Map<number, Post> = new Map();
  private events: Map<number, Event> = new Map();
  private petitions: Map<number, Petition> = new Map();
  private representatives: Map<number, Representative> = new Map();
  private newsArticles: Map<number, NewsArticle> = new Map();
  private eventAttendees: Map<string, EventAttendee> = new Map();
  private petitionSignatures: Map<string, PetitionSignature> = new Map();
  private postVotes: Map<string, PostVote> = new Map();
  private nextId = 1;

  private getNextId(): number {
    return this.nextId++;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Forum operations
  async getForums(): Promise<Forum[]> {
    return Array.from(this.forums.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getForumsByType(type: string): Promise<Forum[]> {
    return Array.from(this.forums.values())
      .filter(forum => forum.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getForumById(id: number): Promise<Forum | undefined> {
    return this.forums.get(id);
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const newForum: Forum = {
      id: this.getNextId(),
      ...forum,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forums.set(newForum.id, newForum);
    return newForum;
  }

  // Post operations
  async getPostsByForum(forumId: number, limit = 50): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.forumId === forumId && !post.parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: this.getNextId(),
      ...post,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async updatePostVotes(postId: number, upvotes: number, downvotes: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.upvotes = upvotes;
      post.downvotes = downvotes;
      post.updatedAt = new Date();
    }
  }

  async getPostReplies(parentId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.parentId === parentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Event operations
  async getEvents(limit = 50): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async getUpcomingEvents(limit = 50): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => event.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      id: this.getNextId(),
      ...event,
      attendeeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.category === category)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Petition operations
  async getPetitions(limit = 50): Promise<Petition[]> {
    return Array.from(this.petitions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getActivePetitions(limit = 50): Promise<Petition[]> {
    return Array.from(this.petitions.values())
      .filter(petition => petition.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getPetitionById(id: number): Promise<Petition | undefined> {
    return this.petitions.get(id);
  }

  async createPetition(petition: InsertPetition): Promise<Petition> {
    const newPetition: Petition = {
      id: this.getNextId(),
      ...petition,
      currentSignatures: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.petitions.set(newPetition.id, newPetition);
    return newPetition;
  }

  async signPetition(petitionId: number, userId: string, comment?: string): Promise<void> {
    const key = `${petitionId}-${userId}`;
    const signature: PetitionSignature = {
      petitionId,
      userId,
      comment: comment || null,
      createdAt: new Date(),
    };
    this.petitionSignatures.set(key, signature);

    // Update petition signature count
    const petition = this.petitions.get(petitionId);
    if (petition) {
      petition.currentSignatures++;
      petition.updatedAt = new Date();
    }
  }

  // Representative operations
  async getRepresentatives(): Promise<Representative[]> {
    return Array.from(this.representatives.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getRepresentativesByLevel(level: string): Promise<Representative[]> {
    return Array.from(this.representatives.values())
      .filter(rep => rep.level === level)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createRepresentative(representative: InsertRepresentative): Promise<Representative> {
    const newRep: Representative = {
      id: this.getNextId(),
      ...representative,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.representatives.set(newRep.id, newRep);
    return newRep;
  }

  // News operations
  async getNews(limit = 50): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async getNewsByCategory(category: string, limit = 50): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const newArticle: NewsArticle = {
      id: this.getNextId(),
      ...article,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.newsArticles.set(newArticle.id, newArticle);
    return newArticle;
  }

  // Vote operations
  async voteOnPost(postId: number, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    const key = `${postId}-${userId}`;
    const existingVote = this.postVotes.get(key);
    
    if (existingVote) {
      // Update existing vote
      existingVote.voteType = voteType;
      existingVote.updatedAt = new Date();
    } else {
      // Create new vote
      const vote: PostVote = {
        postId,
        userId,
        voteType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.postVotes.set(key, vote);
    }

    // Update post vote counts
    const post = this.posts.get(postId);
    if (post) {
      const votes = Array.from(this.postVotes.values()).filter(v => v.postId === postId);
      post.upvotes = votes.filter(v => v.voteType === 'upvote').length;
      post.downvotes = votes.filter(v => v.voteType === 'downvote').length;
      post.updatedAt = new Date();
    }
  }

  async getUserVoteOnPost(postId: number, userId: string): Promise<PostVote | undefined> {
    const key = `${postId}-${userId}`;
    return this.postVotes.get(key);
  }

  // Event attendance operations
  async attendEvent(eventId: number, userId: string, status = 'attending'): Promise<void> {
    const key = `${eventId}-${userId}`;
    const attendee: EventAttendee = {
      eventId,
      userId,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.eventAttendees.set(key, attendee);

    // Update event attendee count
    const event = this.events.get(eventId);
    if (event) {
      const attendees = Array.from(this.eventAttendees.values())
        .filter(a => a.eventId === eventId && a.status === 'attending');
      event.attendeeCount = attendees.length;
      event.updatedAt = new Date();
    }
  }

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return Array.from(this.eventAttendees.values())
      .filter(attendee => attendee.eventId === eventId);
  }

  async getUserEventStatus(eventId: number, userId: string): Promise<EventAttendee | undefined> {
    const key = `${eventId}-${userId}`;
    return this.eventAttendees.get(key);
  }
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

// Temporarily using MemStorage due to database connection issues
export const storage = new MemStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertForumSchema,
  insertPostSchema,
  insertEventSchema,
  insertPetitionSchema,
  insertRepresentativeSchema,
  insertNewsArticleSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Forum routes
  app.get('/api/forums', async (req, res) => {
    try {
      const type = req.query.type as string;
      const forums = type 
        ? await storage.getForumsByType(type)
        : await storage.getForums();
      res.json(forums);
    } catch (error) {
      console.error("Error fetching forums:", error);
      res.status(500).json({ message: "Failed to fetch forums" });
    }
  });

  app.get('/api/forums/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const forum = await storage.getForumById(id);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      res.json(forum);
    } catch (error) {
      console.error("Error fetching forum:", error);
      res.status(500).json({ message: "Failed to fetch forum" });
    }
  });

  app.post('/api/forums', isAuthenticated, async (req, res) => {
    try {
      const forumData = insertForumSchema.parse(req.body);
      const forum = await storage.createForum(forumData);
      res.status(201).json(forum);
    } catch (error) {
      console.error("Error creating forum:", error);
      res.status(500).json({ message: "Failed to create forum" });
    }
  });

  // Post routes
  app.get('/api/forums/:forumId/posts', async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getPostsByForum(forumId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get('/api/posts/:id/replies', async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const replies = await storage.getPostReplies(parentId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { voteType } = req.body;
      
      if (voteType !== 'upvote' && voteType !== 'downvote') {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      await storage.voteOnPost(postId, userId, voteType);
      res.json({ message: "Vote recorded" });
    } catch (error) {
      console.error("Error voting on post:", error);
      res.status(500).json({ message: "Failed to vote on post" });
    }
  });

  app.get('/api/search/posts', async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const posts = await storage.searchPosts(query, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const upcoming = req.query.upcoming === 'true';
      const category = req.query.category as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let events;
      if (upcoming) {
        events = await storage.getUpcomingEvents(limit);
      } else if (category) {
        events = await storage.getEventsByCategory(category);
      } else {
        events = await storage.getEvents(limit);
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/events/:id/attend', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      await storage.attendEvent(eventId, userId, status);
      res.json({ message: "Attendance updated" });
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Petition routes
  app.get('/api/petitions', async (req, res) => {
    try {
      const active = req.query.active === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const petitions = active
        ? await storage.getActivePetitions(limit)
        : await storage.getPetitions(limit);
      
      res.json(petitions);
    } catch (error) {
      console.error("Error fetching petitions:", error);
      res.status(500).json({ message: "Failed to fetch petitions" });
    }
  });

  app.get('/api/petitions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const petition = await storage.getPetitionById(id);
      if (!petition) {
        return res.status(404).json({ message: "Petition not found" });
      }
      res.json(petition);
    } catch (error) {
      console.error("Error fetching petition:", error);
      res.status(500).json({ message: "Failed to fetch petition" });
    }
  });

  app.post('/api/petitions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petitionData = insertPetitionSchema.parse({
        ...req.body,
        creatorId: userId,
      });
      const petition = await storage.createPetition(petitionData);
      res.status(201).json(petition);
    } catch (error) {
      console.error("Error creating petition:", error);
      res.status(500).json({ message: "Failed to create petition" });
    }
  });

  app.post('/api/petitions/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const petitionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { comment } = req.body;
      
      await storage.signPetition(petitionId, userId, comment);
      res.json({ message: "Petition signed" });
    } catch (error) {
      console.error("Error signing petition:", error);
      res.status(500).json({ message: "Failed to sign petition" });
    }
  });

  // Representative routes
  app.get('/api/representatives', async (req, res) => {
    try {
      const level = req.query.level as string;
      const representatives = level
        ? await storage.getRepresentativesByLevel(level)
        : await storage.getRepresentatives();
      res.json(representatives);
    } catch (error) {
      console.error("Error fetching representatives:", error);
      res.status(500).json({ message: "Failed to fetch representatives" });
    }
  });

  app.post('/api/representatives', isAuthenticated, async (req, res) => {
    try {
      const repData = insertRepresentativeSchema.parse(req.body);
      const representative = await storage.createRepresentative(repData);
      res.status(201).json(representative);
    } catch (error) {
      console.error("Error creating representative:", error);
      res.status(500).json({ message: "Failed to create representative" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const category = req.query.category as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const news = category
        ? await storage.getNewsByCategory(category, limit)
        : await storage.getNews(limit);
      
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/news', isAuthenticated, async (req, res) => {
    try {
      const newsData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.createNewsArticle(newsData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating news article:", error);
      res.status(500).json({ message: "Failed to create news article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

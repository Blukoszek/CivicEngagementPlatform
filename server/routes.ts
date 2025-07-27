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

  // Analytics routes
  app.get("/api/analytics/engagement", async (req, res) => {
    try {
      // Generate sample engagement metrics for the last 7 days
      const metrics = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        metrics.push({
          date: date.toISOString(),
          activeUsers: Math.floor(Math.random() * 50) + 20,
          newPosts: Math.floor(Math.random() * 15) + 5,
          newEvents: Math.floor(Math.random() * 5) + 1,
          newPetitions: Math.floor(Math.random() * 3),
          petitionSignatures: Math.floor(Math.random() * 25) + 10,
          eventAttendances: Math.floor(Math.random() * 30) + 15,
          forumEngagement: Math.floor(Math.random() * 40) + 20,
        });
      }
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching engagement analytics:", error);
      res.status(500).json({ message: "Failed to fetch engagement metrics" });
    }
  });

  app.get("/api/analytics/trending", async (req, res) => {
    try {
      const trendingTopics = [
        { topic: "Infrastructure Improvements", mentions: 45, engagementScore: 87, category: "transportation" },
        { topic: "Community Center Funding", mentions: 38, engagementScore: 82, category: "community" },
        { topic: "Local Business Support", mentions: 32, engagementScore: 75, category: "economy" },
        { topic: "Environmental Initiatives", mentions: 28, engagementScore: 69, category: "environment" },
        { topic: "School Board Elections", mentions: 25, engagementScore: 64, category: "education" },
        { topic: "Public Safety", mentions: 22, engagementScore: 58, category: "safety" },
        { topic: "Housing Development", mentions: 18, engagementScore: 52, category: "housing" },
        { topic: "Youth Programs", mentions: 15, engagementScore: 46, category: "community" },
      ];
      res.json(trendingTopics);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = {
        totalUsers: 245,
        totalPosts: 1842,
        totalEvents: 67,
        totalPetitions: 23,
        forumActivity: 45,
        eventActivity: 25,
        petitionActivity: 20,
        newsActivity: 10,
      };
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      // Sample notifications for demonstration
      const notifications = [
        {
          id: 1,
          type: "event_reminder",
          title: "Town Hall Meeting Tomorrow",
          message: "Don't forget about the infrastructure discussion at City Hall tomorrow at 7 PM.",
          actionUrl: "/events",
          isRead: false,
          priority: "high",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: 2,
          type: "petition_milestone",
          title: "Petition Reached 100 Signatures!",
          message: "The Central Park lighting petition you signed has reached 100 signatures.",
          actionUrl: "/petitions",
          isRead: false,
          priority: "normal",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          id: 3,
          type: "forum_reply",
          title: "New reply to your post",
          message: "Someone replied to your post about bike lane improvements.",
          actionUrl: "/forums",
          isRead: true,
          priority: "normal",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // In a real app, update the notification in the database
      res.json({ success: true, id });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch("/api/notifications/mark-all-read", isAuthenticated, async (req, res) => {
    try {
      // In a real app, update all unread notifications for the user
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // Live collaboration routes
  app.get("/api/live/activities/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      // Sample live activities
      const activities = [
        {
          id: "1",
          userId: "user1",
          userName: "Sarah Chen",
          userAvatar: null,
          action: "commented",
          entityType,
          entityId: parseInt(entityId),
          entityTitle: entityType === "post" ? "Infrastructure Discussion" : "Town Hall Meeting",
          description: `Added a comment to the ${entityType}`,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2", 
          userId: "user2",
          userName: "Mike Rodriguez",
          userAvatar: null,
          action: "voted",
          entityType,
          entityId: parseInt(entityId),
          entityTitle: entityType === "post" ? "Infrastructure Discussion" : "Town Hall Meeting",
          description: `Voted on the ${entityType}`,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        }
      ];
      res.json(activities);
    } catch (error) {
      console.error("Error fetching live activities:", error);
      res.status(500).json({ message: "Failed to fetch live activities" });
    }
  });

  app.get("/api/live/users", async (req, res) => {
    try {
      const activeUsers = [
        {
          id: "user1",
          name: "Sarah Chen",
          avatar: null,
          currentPage: "/forums",
          lastSeen: new Date().toISOString(),
          isOnline: true,
        },
        {
          id: "user2", 
          name: "Mike Rodriguez",
          avatar: null,
          currentPage: "/events",
          lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          isOnline: true,
        },
        {
          id: "user3",
          name: "Emily Johnson",
          avatar: null,
          currentPage: "/petitions",
          lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isOnline: false,
        }
      ];
      res.json(activeUsers);
    } catch (error) {
      console.error("Error fetching active users:", error);
      res.status(500).json({ message: "Failed to fetch active users" });
    }
  });

  app.get("/api/live/comments/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const liveComments = [
        {
          id: "c1",
          userId: "user1",
          userName: "Sarah Chen",
          userAvatar: null,
          content: "This is a great discussion point. I think we should consider the environmental impact as well.",
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          entityType,
          entityId: parseInt(entityId),
        },
        {
          id: "c2",
          userId: "user2",
          userName: "Mike Rodriguez", 
          userAvatar: null,
          content: "Agreed! We need to balance development with sustainability.",
          timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          entityType,
          entityId: parseInt(entityId),
        }
      ];
      res.json(liveComments);
    } catch (error) {
      console.error("Error fetching live comments:", error);
      res.status(500).json({ message: "Failed to fetch live comments" });
    }
  });

  app.post("/api/live/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, entityType, entityId } = req.body;
      
      // In a real app, save the comment to database
      const comment = {
        id: Date.now().toString(),
        userId,
        userName: "Current User",
        userAvatar: null,
        content,
        timestamp: new Date().toISOString(),
        entityType,
        entityId,
      };
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding live comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Budget participation routes
  app.get("/api/budget/submissions", async (req, res) => {
    try {
      // Sample budget submissions data
      const submissions = {
        totalSubmissions: 127,
        averageAllocations: {
          education: 16500000,
          infrastructure: 12800000,
          public_safety: 8200000,
          parks: 4800000,
          housing: 5200000,
          innovation: 2500000,
        }
      };
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching budget submissions:", error);
      res.status(500).json({ message: "Failed to fetch budget submissions" });
    }
  });

  app.get("/api/budget/stats", async (req, res) => {
    try {
      const stats = {
        totalSubmissions: 127,
        participationRate: 0.73,
        deadlineDate: "2025-03-15",
        averageBudget: 50000000,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching budget stats:", error);
      res.status(500).json({ message: "Failed to fetch budget stats" });
    }
  });

  app.post("/api/budget/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categories, feedback, totalBudget } = req.body;
      
      // In a real app, save the budget submission to database
      const submission = {
        id: Date.now().toString(),
        userId,
        categories,
        feedback,
        totalBudget,
        submittedAt: new Date().toISOString(),
      };
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting budget:", error);
      res.status(500).json({ message: "Failed to submit budget" });
    }
  });

  // Voting information routes
  app.get("/api/voting/elections", async (req, res) => {
    try {
      const elections = [
        {
          id: "local-2025",
          title: "Local Elections 2025",
          date: "2025-11-04",
          type: "local",
          status: "upcoming",
          description: "City Council, School Board, and Municipal positions",
          positions: ["City Council", "School Board", "Mayor"],
          turnoutExpected: 65,
          lastTurnout: 58,
        },
        {
          id: "state-primary-2025",
          title: "State Primary Election",
          date: "2025-06-17", 
          type: "primary",
          status: "upcoming",
          description: "Primary elections for state-level positions",
          positions: ["State Representative", "State Senator"],
          turnoutExpected: 42,
          lastTurnout: 38,
        }
      ];
      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  });

  app.get("/api/voting/candidates/:electionId", async (req, res) => {
    try {
      const { electionId } = req.params;
      const candidates = [
        {
          id: "candidate-1",
          name: "Maria Rodriguez",
          party: "Democratic",
          position: "City Council - District 3",
          photo: null,
          website: "https://mariaforcouncil.com",
          experience: "Former school board member with 8 years of public service experience",
          keyIssues: ["Education", "Infrastructure", "Housing"],
          endorsements: ["Teachers Union", "Environmental Coalition"],
          funding: 45000,
        },
        {
          id: "candidate-2", 
          name: "James Thompson",
          party: "Republican",
          position: "City Council - District 3",
          photo: null,
          website: "https://jamesforchange.org",
          experience: "Small business owner and community organizer for 12 years",
          keyIssues: ["Economy", "Public Safety", "Small Business"],
          endorsements: ["Chamber of Commerce", "Police Union"],
          funding: 38000,
        },
        {
          id: "candidate-3",
          name: "Dr. Sarah Kim",
          party: "Independent",
          position: "School Board",
          photo: null,
          website: null,
          experience: "Educator with 15 years in public schools, holds PhD in Education Policy",
          keyIssues: ["Education Quality", "Teacher Support", "Student Wellness"],
          endorsements: ["Parent-Teacher Association", "Education Foundation"],
          funding: 22000,
        }
      ];
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get("/api/voting/polling-locations/:zipCode", async (req, res) => {
    try {
      const { zipCode } = req.params;
      const locations = [
        {
          id: "location-1",
          name: "Central Community Center",
          address: "123 Main Street, Anytown, ST 12345",
          hours: "7:00 AM - 8:00 PM",
          accessibility: true,
          parking: true,
          distance: 0.8,
        },
        {
          id: "location-2",
          name: "Roosevelt Elementary School",
          address: "456 Oak Avenue, Anytown, ST 12345", 
          hours: "7:00 AM - 8:00 PM",
          accessibility: true,
          parking: false,
          distance: 1.2,
        },
        {
          id: "location-3",
          name: "Civic Center - West Wing",
          address: "789 Government Plaza, Anytown, ST 12345",
          hours: "6:00 AM - 9:00 PM",
          accessibility: true,
          parking: true,
          distance: 2.1,
        }
      ];
      res.json(locations);
    } catch (error) {
      console.error("Error fetching polling locations:", error);
      res.status(500).json({ message: "Failed to fetch polling locations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

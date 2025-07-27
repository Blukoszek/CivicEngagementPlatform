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

  // AI Recommendations routes
  app.get("/api/ai/recommendations/:userId?", async (req, res) => {
    try {
      const recommendations = [
        {
          id: "rec-1",
          type: "petition",
          title: "Save the Downtown Library",
          description: "Community petition to prevent library closure",
          reason: "Based on your interest in education and community services, this petition aligns with your civic priorities",
          relevanceScore: 0.92,
          entityId: 1,
          tags: ["Education", "Community Services", "Budget"],
          actionText: "Sign Petition"
        },
        {
          id: "rec-2", 
          type: "event",
          title: "Town Hall: Climate Action Plan",
          description: "Public meeting to discuss new environmental initiatives",
          reason: "You've previously engaged with environmental issues and attended similar civic meetings",
          relevanceScore: 0.88,
          entityId: 2,
          tags: ["Environment", "Climate", "Town Hall"],
          actionText: "RSVP to Event"
        }
      ];
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/ai/user-interests/:userId?", async (req, res) => {
    try {
      const interests = ["Education", "Environment", "Transportation", "Housing", "Community Development"];
      res.json(interests);
    } catch (error) {
      console.error("Error fetching user interests:", error);
      res.status(500).json({ message: "Failed to fetch user interests" });
    }
  });

  // User Profile routes
  app.get("/api/users/profile/:userId?", async (req, res) => {
    try {
      const profile = {
        id: "user-1",
        name: "Community Member",
        email: "user@example.com",
        joinDate: "2024-01-15",
        location: "Downtown District",
        civicScore: 2450,
        level: "Civic Champion",
        badges: [
          {
            id: "badge-1",
            name: "First Post",
            description: "Created your first community post",
            icon: "🎯",
            earnedDate: "2024-02-01",
            rarity: "common"
          },
          {
            id: "badge-2",
            name: "Event Organizer", 
            description: "Organized a successful community event",
            icon: "🎪",
            earnedDate: "2024-05-15",
            rarity: "rare"
          }
        ],
        stats: {
          postsCreated: 23,
          eventsAttended: 8,
          petitionsSigned: 12,
          commentsPosted: 67,
          votesReceived: 145,
          daysActive: 89
        },
        recentActivity: [
          {
            id: "activity-1",
            description: "Signed petition for community garden funding",
            timestamp: "2024-07-26",
            points: 50
          },
          {
            id: "activity-2", 
            description: "Attended City Council budget meeting",
            timestamp: "2024-07-25",
            points: 100
          }
        ],
        impact: {
          totalContributions: 156,
          petitionsHelped: 8,
          eventsOrganized: 3,
          communitiesHelped: 2,
          issuesAdvocated: ["Education", "Environment", "Transportation"]
        }
      };
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Policy Simulation routes
  app.post("/api/policy/simulate", async (req, res) => {
    try {
      const { variables } = req.body;
      
      // Mock simulation results based on variables
      const result = {
        id: "sim-1",
        scenario: "custom",
        outcomes: {
          economic: Math.floor(Math.random() * 40) + 60,
          social: Math.floor(Math.random() * 40) + 60,
          environmental: Math.floor(Math.random() * 40) + 60,
          approval: Math.floor(Math.random() * 40) + 60
        },
        impacts: [
          {
            category: "Economic Impact",
            description: "Projected changes in local business revenue and employment",
            magnitude: 75,
            timeframe: "medium-term",
            affected_groups: ["Small Businesses", "Working Families", "Seniors"]
          },
          {
            category: "Social Services",
            description: "Impact on education, healthcare, and community programs",
            magnitude: 68,
            timeframe: "long-term",
            affected_groups: ["Students", "Families", "Vulnerable Populations"]
          }
        ],
        timeline: [
          { year: 2025, budget: 45000000, jobs: 12500, population: 85000, satisfaction: 72 },
          { year: 2026, budget: 47000000, jobs: 13100, population: 87500, satisfaction: 75 },
          { year: 2027, budget: 49000000, jobs: 13800, population: 90000, satisfaction: 78 },
          { year: 2028, budget: 51000000, jobs: 14200, population: 92000, satisfaction: 80 },
          { year: 2029, budget: 53000000, jobs: 14800, population: 94500, satisfaction: 82 }
        ],
        risks: [
          {
            type: "Budget Shortfall",
            description: "Risk of revenue not meeting projected expenses",
            probability: 35,
            severity: 65,
            mitigation: "Implement gradual tax increases with economic growth monitoring"
          }
        ]
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error running policy simulation:", error);
      res.status(500).json({ message: "Failed to run simulation" });
    }
  });

  // Government Integration routes
  app.get("/api/government/connections", async (req, res) => {
    try {
      const connections = [
        {
          id: "conn-1",
          name: "City Budget API",
          type: "Municipal Finance",
          status: "connected",
          lastSync: "2024-07-27",
          dataPoints: 1250,
          description: "Real-time access to city budget and spending data"
        },
        {
          id: "conn-2",
          name: "Legislative Tracker",
          type: "Government Records",
          status: "connected", 
          lastSync: "2024-07-26",
          dataPoints: 340,
          description: "Track bills, voting records, and legislative activity"
        },
        {
          id: "conn-3",
          name: "Census Data Portal",
          type: "Demographics",
          status: "error",
          lastSync: "2024-07-20",
          dataPoints: 0,
          description: "Population and demographic statistics"
        }
      ];
      res.json(connections);
    } catch (error) {
      console.error("Error fetching government connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.get("/api/government/data", async (req, res) => {
    try {
      const data = [
        {
          id: "data-1",
          source: "City Council",
          type: "meeting",
          title: "Monthly Budget Review Meeting",
          description: "Review of Q3 budget performance and Q4 projections",
          lastUpdated: "2024-07-25",
          status: "scheduled",
          url: "https://city.gov/meetings/budget-review"
        },
        {
          id: "data-2",
          source: "Planning Department",
          type: "budget",
          title: "Infrastructure Investment Plan",
          description: "5-year infrastructure development and maintenance plan",
          lastUpdated: "2024-07-24",
          status: "active",
          url: "https://city.gov/planning/infrastructure"
        }
      ];
      res.json(data);
    } catch (error) {
      console.error("Error fetching government data:", error);
      res.status(500).json({ message: "Failed to fetch government data" });
    }
  });

  app.get("/api/government/legislation", async (req, res) => {
    try {
      const legislation = [
        {
          id: "bill-1",
          billNumber: "CB-2024-15",
          title: "Community Garden Expansion Act",
          status: "Committee Review",
          sponsor: "Councilwoman Rodriguez",
          committee: "Parks and Recreation",
          lastAction: "Referred to committee for review",
          lastActionDate: "2024-07-20",
          summary: "Legislation to allocate funding for new community gardens in underserved neighborhoods",
          votingRecord: [
            { representative: "Councilwoman Rodriguez", vote: "yes", party: "Democratic" },
            { representative: "Councilman Thompson", vote: "yes", party: "Republican" },
            { representative: "Councilwoman Kim", vote: "abstain", party: "Independent" }
          ]
        }
      ];
      res.json(legislation);
    } catch (error) {
      console.error("Error fetching legislation:", error);
      res.status(500).json({ message: "Failed to fetch legislation" });
    }
  });

  app.get("/api/government/budget", async (req, res) => {
    try {
      const budget = [
        {
          category: "Education",
          allocated: 25000000,
          spent: 18750000,
          remaining: 6250000,
          percentage: 75
        },
        {
          category: "Infrastructure",
          allocated: 15000000,
          spent: 12000000,
          remaining: 3000000,
          percentage: 80
        },
        {
          category: "Public Safety",
          allocated: 20000000,
          spent: 17500000,
          remaining: 2500000,
          percentage: 87.5
        },
        {
          category: "Parks & Recreation",
          allocated: 8000000,
          spent: 5600000,
          remaining: 2400000,
          percentage: 70
        }
      ];
      res.json(budget);
    } catch (error) {
      console.error("Error fetching budget data:", error);
      res.status(500).json({ message: "Failed to fetch budget data" });
    }
  });

  // Social Media Hub routes
  app.get("/api/social/connections", async (req, res) => {
    try {
      const connections = [
        {
          platform: "twitter",
          connected: true,
          username: "civicconnect_community",
          followers: 2450,
          lastSync: "2024-07-27"
        },
        {
          platform: "facebook", 
          connected: true,
          username: "CivicConnect Community",
          followers: 1890,
          lastSync: "2024-07-26"
        },
        {
          platform: "linkedin",
          connected: false
        },
        {
          platform: "email",
          connected: true,
          followers: 3200,
          lastSync: "2024-07-27"
        }
      ];
      res.json(connections);
    } catch (error) {
      console.error("Error fetching social connections:", error);
      res.status(500).json({ message: "Failed to fetch social connections" });
    }
  });

  app.get("/api/social/posts", async (req, res) => {
    try {
      const posts = [
        {
          id: "post-1",
          content: "Join us this Thursday for the Community Budget Meeting at City Hall. Your voice matters in shaping our city's future! #CivicEngagement #CommunityBudget",
          platforms: ["twitter", "facebook"],
          status: "published",
          publishedDate: "2024-07-25",
          metrics: {
            views: 1250,
            likes: 89,
            shares: 23,
            comments: 12
          },
          civicContent: {
            type: "event",
            entityId: "event-5",
            title: "Community Budget Meeting"
          }
        }
      ];
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social posts:", error);
      res.status(500).json({ message: "Failed to fetch social posts" });
    }
  });

  app.post("/api/social/publish", async (req, res) => {
    try {
      const { content, platforms, scheduledDate } = req.body;
      
      const post = {
        id: `post-${Date.now()}`,
        content,
        platforms,
        status: scheduledDate ? "scheduled" : "published",
        scheduledDate,
        publishedDate: scheduledDate ? undefined : new Date().toISOString()
      };
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error publishing post:", error);
      res.status(500).json({ message: "Failed to publish post" });
    }
  });

  // Community Organizing routes
  app.get("/api/organizing/campaigns", async (req, res) => {
    try {
      const campaigns = [
        {
          id: "campaign-1",
          title: "Save Our Local Library",
          description: "Community campaign to prevent the closure of the downtown branch library",
          goal: "Secure funding for library operations and prevent closure",
          status: "active",
          progress: 75,
          targetParticipants: 500,
          currentParticipants: 375,
          startDate: "2024-06-01",
          organizer: "Friends of the Library Coalition",
          tags: ["Education", "Community Services", "Advocacy"],
          activities: [
            {
              id: "activity-1",
              title: "Petition Drive at Farmers Market",
              type: "outreach",
              date: "2024-07-28",
              description: "Collect signatures and raise awareness",
              attendees: 25,
              status: "scheduled"
            }
          ],
          volunteers: []
        }
      ];
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/organizing/volunteers", async (req, res) => {
    try {
      const volunteers = [
        {
          id: "vol-1",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          skills: ["Event Planning", "Social Media", "Graphic Design"],
          availability: ["Weekends", "Evenings"],
          role: "Outreach Coordinator",
          joinDate: "2024-05-15",
          hoursContributed: 32
        },
        {
          id: "vol-2",
          name: "Mike Chen",
          email: "mike.chen@email.com", 
          skills: ["Photography", "Writing", "Public Speaking"],
          availability: ["Weekday Mornings", "Saturdays"],
          role: "Communications Lead",
          joinDate: "2024-06-02",
          hoursContributed: 28
        }
      ];
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.get("/api/organizing/coalitions", async (req, res) => {
    try {
      const coalitions = [
        {
          id: "coalition-1",
          name: "Environmental Action Alliance",
          description: "Coalition of local organizations working on environmental issues and climate action",
          members: 145,
          organizations: ["Green Future", "Clean Air Coalition", "Sustainable Transport Group", "Urban Gardens Network"],
          sharedGoals: ["Reduce carbon emissions by 30%", "Increase renewable energy adoption", "Expand public transportation"],
          leadOrganization: "Green Future",
          meetingSchedule: "First Thursday of each month",
          nextMeeting: "2024-08-01"
        }
      ];
      res.json(coalitions);
    } catch (error) {
      console.error("Error fetching coalitions:", error);
      res.status(500).json({ message: "Failed to fetch coalitions" });
    }
  });

  app.post("/api/organizing/campaigns", async (req, res) => {
    try {
      const { title, description, goal, targetParticipants } = req.body;
      
      const campaign = {
        id: `campaign-${Date.now()}`,
        title,
        description,
        goal,
        status: "planning",
        progress: 0,
        targetParticipants,
        currentParticipants: 1,
        startDate: new Date().toISOString(),
        organizer: "Current User",
        tags: [],
        activities: [],
        volunteers: []
      };
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

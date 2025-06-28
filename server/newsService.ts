import { storage } from "./storage";

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  author: string;
  source: { name: string };
  url: string;
  urlToImage: string;
  publishedAt: string;
}

interface NewsAPIResponse {
  articles: NewsAPIArticle[];
}

export class NewsService {
  private lastFetch: Date | null = null;
  private fetchInterval = 30 * 60 * 1000; // 30 minutes

  async fetchAndStoreNews() {
    try {
      // Check if we need to fetch news (only fetch every 30 minutes)
      if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.fetchInterval) {
        return;
      }

      console.log("Fetching news from NewsAPI...");
      
      // Fetch general news articles
      const generalUrl = `https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
      const politicsUrl = `https://newsapi.org/v2/top-headlines?country=us&category=politics&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
      
      const [generalResponse, politicsResponse] = await Promise.all([
        fetch(generalUrl),
        fetch(politicsUrl)
      ]);

      if (!generalResponse.ok || !politicsResponse.ok) {
        throw new Error(`News API error: ${generalResponse.status} ${politicsResponse.status}`);
      }

      const generalData: NewsAPIResponse = await generalResponse.json();
      const politicsData: NewsAPIResponse = await politicsResponse.json();

      const allArticles = [
        ...generalData.articles.map(article => ({ ...article, category: 'general' })),
        ...politicsData.articles.map(article => ({ ...article, category: 'politics' }))
      ];

      // Store articles in database
      for (const article of allArticles) {
        if (article.title && article.url && article.publishedAt) {
          try {
            await storage.createNewsArticle({
              title: article.title,
              summary: article.description || null,
              content: article.content || article.description || null,
              author: article.author || null,
              source: article.source.name,
              url: article.url,
              imageUrl: article.urlToImage || null,
              category: article.category || 'general',
              location: 'United States',
              publishedAt: new Date(article.publishedAt)
            });
          } catch (error) {
            // Skip duplicate articles
            if (!error.message?.includes('duplicate') && !error.message?.includes('unique constraint')) {
              console.error('Error storing article:', error);
            }
          }
        }
      }

      this.lastFetch = new Date();
      console.log(`Successfully fetched and stored ${allArticles.length} news articles`);
      
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // If we can't fetch real news, create some sample articles for demonstration
      if (!process.env.NEWS_API_KEY) {
        console.log('Creating sample news articles for demonstration...');
        await this.createSampleNews();
      }
    }
  }

  private async createSampleNews() {
    const sampleArticles = [
      {
        title: "City Council Approves New Community Center",
        summary: "The proposed community center will include recreational facilities, meeting spaces, and educational programs for all ages.",
        content: "After months of planning and community input, the city council has unanimously approved the construction of a new community center. The facility will serve as a hub for local activities and civic engagement.",
        author: "Local Reporter",
        source: "City News",
        url: "https://example.com/community-center",
        imageUrl: null,
        category: "local",
        location: "Local Community",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: "Public Hearing Scheduled for Infrastructure Updates",
        summary: "Residents invited to share feedback on proposed road improvements and public transportation enhancements.",
        content: "The city will hold a public hearing next week to discuss infrastructure improvements including road repairs, bike lanes, and enhanced public transportation routes.",
        author: "City Planning",
        source: "Municipal Updates",
        url: "https://example.com/infrastructure",
        imageUrl: null,
        category: "government",
        location: "Local Community",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        title: "Environmental Initiative Gains Community Support",
        summary: "Local environmental group's tree planting program receives overwhelming volunteer response from residents.",
        content: "The Green Community Initiative has exceeded expectations with over 200 volunteers signing up for the neighborhood tree planting program scheduled for next month.",
        author: "Environmental Reporter",
        source: "Green News",
        url: "https://example.com/environment",
        imageUrl: null,
        category: "environment",
        location: "Local Community",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];

    for (const article of sampleArticles) {
      try {
        await storage.createNewsArticle(article);
      } catch (error) {
        // Skip if already exists
      }
    }
  }

  async startPeriodicFetch() {
    // Fetch news immediately
    await this.fetchAndStoreNews();
    
    // Set up periodic fetching every 30 minutes
    setInterval(() => {
      this.fetchAndStoreNews();
    }, this.fetchInterval);
  }
}

export const newsService = new NewsService();
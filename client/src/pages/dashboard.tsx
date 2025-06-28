import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ForumPost from "@/components/ForumPost";
import EventCard from "@/components/EventCard";
import PetitionCard from "@/components/PetitionCard";
import NewsArticle from "@/components/NewsArticle";
import { MessageSquare, Calendar, FileText, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { data: forums } = useQuery({
    queryKey: ['/api/forums'],
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['/api/events?upcoming=true&limit=3'],
  });

  const { data: activePetitions } = useQuery({
    queryKey: ['/api/petitions?active=true&limit=2'],
  });

  const { data: recentNews } = useQuery({
    queryKey: ['/api/news?limit=3'],
  });

  const { data: hotTopics } = useQuery({
    queryKey: ['/api/forums/1/posts?limit=3'], // Assuming forum 1 exists for hot topics
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['/api/forums/1/posts?limit=3'],
  });

  return (
    <div className="min-h-screen bg-civic-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-civic-gray-100 overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=400')"
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to CivicConnect</h1>
                    <p className="text-xl opacity-90">Your voice matters in our community</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-civic-blue">247</div>
                    <div className="text-sm text-civic-gray-500">Active Discussions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-community-green">
                      {upcomingEvents?.length || 0}
                    </div>
                    <div className="text-sm text-civic-gray-500">Upcoming Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-action-red">
                      {activePetitions?.length || 0}
                    </div>
                    <div className="text-sm text-civic-gray-500">Active Petitions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hot Topics Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-action-red" />
                      <span>Hot Topics in Your Area</span>
                    </CardTitle>
                    <Button variant="link" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hotTopics && hotTopics.length > 0 ? (
                    hotTopics.map((post: any) => (
                      <ForumPost key={post.id} post={post} compact />
                    ))
                  ) : (
                    <div className="text-center py-8 text-civic-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No discussions yet. Start a conversation!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Events Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-civic-blue" />
                      <span>Upcoming Events</span>
                    </CardTitle>
                    <Button variant="link" size="sm">View Calendar</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event: any) => (
                      <EventCard key={event.id} event={event} compact />
                    ))
                  ) : (
                    <div className="text-center py-8 text-civic-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming events scheduled.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Local News and Active Petitions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Local News Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Local News</span>
                    </CardTitle>
                    <Button variant="link" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentNews && recentNews.length > 0 ? (
                    recentNews.map((article: any) => (
                      <NewsArticle key={article.id} article={article} compact />
                    ))
                  ) : (
                    <div className="text-center py-8 text-civic-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No news articles available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Petitions Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-community-green" />
                      <span>Active Petitions</span>
                    </CardTitle>
                    <Button variant="link" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activePetitions && activePetitions.length > 0 ? (
                    activePetitions.map((petition: any) => (
                      <PetitionCard key={petition.id} petition={petition} compact />
                    ))
                  ) : (
                    <div className="text-center py-8 text-civic-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active petitions available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Forum Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-civic-blue" />
                    <span>Recent Forum Activity</span>
                  </CardTitle>
                  <Button variant="link" size="sm">Browse All Forums</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post: any) => (
                    <ForumPost key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-8 text-civic-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent forum activity. Start a discussion!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

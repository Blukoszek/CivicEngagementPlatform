import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ForumPost from "@/components/ForumPost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, MapPin, Hash, Plus } from "lucide-react";

export default function Forums() {
  const [activeTab, setActiveTab] = useState("location");

  const { data: locationForums } = useQuery({
    queryKey: ['/api/forums?type=location'],
  });

  const { data: topicForums } = useQuery({
    queryKey: ['/api/forums?type=topic'],
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['/api/forums/1/posts?limit=10'],
  });

  return (
    <div className="min-h-screen bg-civic-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-civic-gray-900">Discussion Forums</h1>
                <p className="text-civic-gray-500 mt-1">
                  Join conversations about local and topical issues
                </p>
              </div>
              <Button className="bg-community-green hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location-Based</span>
                </TabsTrigger>
                <TabsTrigger value="topic" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Topic-Based</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="location" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationForums && locationForums.length > 0 ? (
                    locationForums.map((forum: any) => (
                      <Card key={forum.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center space-x-2 text-lg">
                            <MapPin className="h-5 w-5 text-civic-blue" />
                            <span>{forum.name}</span>
                          </CardTitle>
                          <p className="text-sm text-civic-gray-500">{forum.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 text-sm text-civic-gray-500">
                            <span>24 discussions</span>
                            <span>156 members</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                      <p className="text-civic-gray-500">No location-based forums available yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="topic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicForums && topicForums.length > 0 ? (
                    topicForums.map((forum: any) => (
                      <Card key={forum.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center space-x-2 text-lg">
                            <Hash className="h-5 w-5 text-community-green" />
                            <span>{forum.name}</span>
                          </CardTitle>
                          <p className="text-sm text-civic-gray-500">{forum.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 text-sm text-civic-gray-500">
                            <span>18 discussions</span>
                            <span>89 members</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Hash className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                      <p className="text-civic-gray-500">No topic-based forums available yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-civic-blue" />
                  <span>Recent Discussions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post: any) => (
                    <ForumPost key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                    <p className="text-civic-gray-500 mb-4">No discussions yet. Be the first to start one!</p>
                    <Button className="bg-community-green hover:bg-green-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Discussion
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

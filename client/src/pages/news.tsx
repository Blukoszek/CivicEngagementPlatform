import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewsArticle from "@/components/NewsArticle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Globe, MapPin, TrendingUp } from "lucide-react";

export default function News() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allNews } = useQuery({
    queryKey: ['/api/news'],
  });

  const { data: localNews } = useQuery({
    queryKey: ['/api/news?category=local'],
  });

  const { data: nationalNews } = useQuery({
    queryKey: ['/api/news?category=national'],
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
                <h1 className="text-2xl font-bold text-civic-gray-900">Local News</h1>
                <p className="text-civic-gray-500 mt-1">
                  Stay informed with curated civic and community news
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>All News</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Local</span>
                </TabsTrigger>
                <TabsTrigger value="national" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>National</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Latest News</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {allNews && allNews.length > 0 ? (
                      <div className="space-y-6">
                        {allNews.map((article: any) => (
                          <NewsArticle key={article.id} article={article} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No news articles available at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="local" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-civic-blue" />
                      <span>Local News</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {localNews && localNews.length > 0 ? (
                      <div className="space-y-6">
                        {localNews.map((article: any) => (
                          <NewsArticle key={article.id} article={article} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No local news articles available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="national" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-community-green" />
                      <span>National News</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nationalNews && nationalNews.length > 0 ? (
                      <div className="space-y-6">
                        {nationalNews.map((article: any) => (
                          <NewsArticle key={article.id} article={article} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No national news articles available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* News Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>News Sources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Gold Coast Bulletin</Badge>
                  <Badge variant="secondary">ABC Gold Coast</Badge>
                  <Badge variant="secondary">The Guardian Queensland</Badge>
                  <Badge variant="secondary">Courier Mail</Badge>
                  <Badge variant="secondary">Brisbane Times</Badge>
                  <Badge variant="secondary">7 News</Badge>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

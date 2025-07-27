import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  MessageSquare,
  ChevronRight,
  Star
} from "lucide-react";
import { Link } from "wouter";

interface Recommendation {
  id: string;
  type: 'event' | 'petition' | 'discussion' | 'representative';
  title: string;
  description: string;
  reason: string;
  relevanceScore: number;
  entityId: number;
  tags: string[];
  actionText: string;
}

export function AIRecommendations({ userId }: { userId?: string }) {
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/ai/recommendations', userId],
  });

  const { data: userInterests = [] } = useQuery({
    queryKey: ['/api/ai/user-interests', userId],
  });

  const recommendationsData = recommendations as Recommendation[];
  const interestsData = userInterests as string[];

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'petition': return FileText;  
      case 'discussion': return MessageSquare;
      case 'representative': return Users;
      default: return Sparkles;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'petition': return 'bg-green-50 text-green-700 border-green-200';
      case 'discussion': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'representative': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoute = (type: string, entityId: number) => {
    switch (type) {
      case 'event': return `/events`;
      case 'petition': return `/petitions`;
      case 'discussion': return `/forums`;
      case 'representative': return `/representatives`;
      default: return '/';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600">
            Personalized suggestions based on your civic interests and community activity
          </p>
        </CardHeader>
        <CardContent>
          {/* User Interests Summary */}
          {interestsData.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                Your Civic Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {interestsData.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendationsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Building your personalized recommendations...</p>
                <p className="text-sm mt-1">Engage with the community to get AI-powered suggestions!</p>
              </div>
            ) : (
              recommendationsData.map((rec) => {
                const Icon = getIcon(rec.type);
                const typeColor = getTypeColor(rec.type);
                const route = getRoute(rec.type, rec.entityId);
                
                return (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          {Math.round(rec.relevanceScore * 100)}% match
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Why this matters to you:</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link href={route}>
                        <Button size="sm" className="flex items-center gap-1">
                          {rec.actionText}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium mb-3">Quick Actions to Improve Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/forums">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discussions
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Attend Events
                </Button>
              </Link>
              <Link href="/petitions">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Sign Petitions
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
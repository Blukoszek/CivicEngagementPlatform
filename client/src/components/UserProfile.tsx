import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Award, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Star,
  Trophy,
  Target,
  Activity,
  Heart,
  CheckCircle,
  BarChart3
} from "lucide-react";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  location: string;
  bio?: string;
  civicScore: number;
  level: string;
  badges: Badge[];
  stats: UserStats;
  recentActivity: ActivityItem[];
  impact: ImpactMetrics;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface UserStats {
  postsCreated: number;
  eventsAttended: number;
  petitionsSigned: number;
  commentsPosted: number;
  votesReceived: number;
  daysActive: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  points: number;
}

interface ImpactMetrics {
  totalContributions: number;
  petitionsHelped: number;
  eventsOrganized: number;
  communitiesHelped: number;
  issuesAdvocated: string[];
}

export function UserProfile({ userId }: { userId?: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['/api/users/profile', userId],
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/users/achievements', userId],
  });

  const profileData = profile as UserProfileData;
  const achievementsData = achievements as any;

  if (!profileData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-purple-400 to-blue-500 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const levelProgress = (profileData.civicScore % 1000) / 10; // Progress to next level

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl">
                  {profileData.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-gray-600">{profileData.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(profileData.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-civic-blue-600">{profileData.civicScore}</div>
                  <div className="text-sm text-gray-600">Civic Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profileData.level}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profileData.badges?.length || 0}</div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profileData.stats?.daysActive || 0}</div>
                  <div className="text-sm text-gray-600">Active Days</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to next level</span>
                  <span>{levelProgress.toFixed(0)}%</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Civic Engagement Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.postsCreated || 0}</div>
                  <div className="text-sm text-gray-600">Posts Created</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.eventsAttended || 0}</div>
                  <div className="text-sm text-gray-600">Events Attended</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.petitionsSigned || 0}</div>
                  <div className="text-sm text-gray-600">Petitions Signed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.votesReceived || 0}</div>
                  <div className="text-sm text-gray-600">Votes Received</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.commentsPosted || 0}</div>
                  <div className="text-sm text-gray-600">Comments Posted</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">{profileData.stats?.daysActive || 0}</div>
                  <div className="text-sm text-gray-600">Active Days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {profileData.badges?.slice(0, 6).map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`p-3 rounded-lg text-center min-w-[120px] ${getBadgeColor(badge.rarity)}`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs opacity-80">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">
                    Start engaging with the community to earn badges!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                All Badges ({profileData.badges?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.badges?.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getBadgeColor(badge.rarity)}`}>
                        <span className="text-lg">{badge.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{badge.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <p className="text-xs text-gray-500">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No badges earned yet</p>
                    <p className="text-sm text-gray-400 mt-1">Participate in community activities to earn your first badge!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-civic-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{activity.points} pts
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Community Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {profileData.impact?.totalContributions || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Contributions</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold">{profileData.impact?.petitionsHelped || 0}</div>
                      <div className="text-xs text-gray-600">Petitions Helped</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold">{profileData.impact?.eventsOrganized || 0}</div>
                      <div className="text-xs text-gray-600">Events Organized</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Issues You've Advocated For</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.impact?.issuesAdvocated?.map((issue, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {issue}
                      </Badge>
                    )) || (
                      <p className="text-gray-500 text-sm">Start advocating for issues you care about!</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
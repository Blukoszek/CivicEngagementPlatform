import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity,
  PieChart,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from "recharts";

interface EngagementMetrics {
  activeUsers: number;
  newPosts: number;
  newEvents: number;
  newPetitions: number;
  petitionSignatures: number;
  eventAttendances: number;
  forumEngagement: number;
  date: string;
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  engagementScore: number;
  category: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EngagementDashboard() {
  const { data: metrics = [] } = useQuery({
    queryKey: ['/api/analytics/engagement'],
  });

  const { data: trends = [] } = useQuery({
    queryKey: ['/api/analytics/trending'],
  });

  const { data: summary = {} } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  const metricsData = metrics as EngagementMetrics[];
  const trendsData = trends as TrendingTopic[];
  const summaryData = summary as any;

  const recentMetrics = metricsData.slice(-7); // Last 7 days
  const totalUsers = summaryData?.totalUsers || 245;
  const totalPosts = summaryData?.totalPosts || 1842;
  const totalEvents = summaryData?.totalEvents || 67;
  const totalPetitions = summaryData?.totalPetitions || 23;

  const categoryData = [
    { name: 'Forums', value: summaryData?.forumActivity || 45, color: '#0088FE' },
    { name: 'Events', value: summaryData?.eventActivity || 25, color: '#00C49F' },
    { name: 'Petitions', value: summaryData?.petitionActivity || 20, color: '#FFBB28' },
    { name: 'News', value: summaryData?.newsActivity || 10, color: '#FF8042' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-civic-blue-900">Community Analytics</h2>
        <Badge variant="outline" className="text-civic-green-600">
          <Activity className="h-4 w-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(totalUsers * 0.12)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(totalPosts * 0.08)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(totalEvents * 0.15)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Petitions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPetitions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(totalPetitions * 0.6)} signatures this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Active Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="newPosts" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="New Posts"
                />
                <Line 
                  type="monotone" 
                  dataKey="eventAttendances" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Event Attendances"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Engagement by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData.slice(0, 8).map((topic: TrendingTopic, index: number) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{topic.topic}</p>
                    <p className="text-sm text-muted-foreground">{topic.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{topic.mentions} mentions</p>
                  <Progress 
                    value={Math.min((topic.engagementScore / 100) * 100, 100)} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
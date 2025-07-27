import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin,
  MessageSquare,
  Send,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Bell,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledDate?: string;
  publishedDate?: string;
  metrics?: {
    views: number;
    shares: number;
    comments: number;
    likes: number;
  };
  civicContent: {
    type: 'event' | 'petition' | 'news' | 'discussion';
    entityId: string;
    title: string;
  };
}

interface SocialConnection {
  platform: string;
  connected: boolean;
  username?: string;
  followers?: number;
  lastSync?: string;
}

interface EmailCampaign {
  id: string;
  subject: string;
  content: string;
  recipients: number;
  status: 'draft' | 'sending' | 'sent';
  openRate?: number;
  clickRate?: number;
  sentDate?: string;
}

export function SocialMediaHub() {
  const [activeTab, setActiveTab] = useState("compose");
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const { toast } = useToast();

  const { data: connections = [] } = useQuery({
    queryKey: ['/api/social/connections'],
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['/api/social/posts'],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/email/campaigns'],
  });

  const publishPostMutation = useMutation({
    mutationFn: async (data: { content: string; platforms: string[]; scheduledDate?: string }) => {
      const response = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post published successfully!",
      });
      setPostContent("");
      setSelectedPlatforms([]);
      setScheduledDate("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const connectPlatformMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetch(`/api/social/connect/${platform}`, {
        method: 'POST',
      });
      return response.json();
    },
  });

  const connectionsData = connections as SocialConnection[];
  const postsData = posts as SocialPost[];
  const campaignsData = campaigns as EmailCampaign[];

  const platformIcons = {
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    email: Mail,
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-blue-500';
      case 'facebook': return 'text-blue-600';
      case 'linkedin': return 'text-blue-700';
      case 'email': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': 
      case 'sent': return 'text-green-600 bg-green-50 border-green-200';
      case 'scheduled': 
      case 'sending': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePublish = () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    publishPostMutation.mutate({
      content: postContent,
      platforms: selectedPlatforms,
      scheduledDate: scheduledDate || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Social Media & Communications</h2>
          <p className="text-gray-600 mt-1">Share civic content and engage with your community across platforms</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Communication Hub
        </Badge>
      </div>

      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['twitter', 'facebook', 'linkedin', 'email'].map((platform) => {
              const connection = connectionsData.find(c => c.platform === platform);
              const Icon = platformIcons[platform as keyof typeof platformIcons];
              const isConnected = connection?.connected || false;
              
              return (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-6 w-6 ${getPlatformColor(platform)}`} />
                    <div>
                      <h4 className="font-medium capitalize">{platform}</h4>
                      {connection?.username && (
                        <p className="text-xs text-gray-600">@{connection.username}</p>
                      )}
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </div>
                      {connection?.followers && (
                        <p className="text-xs text-gray-500">
                          {connection.followers.toLocaleString()} followers
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Last sync: {connection?.lastSync ? new Date(connection.lastSync).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => connectPlatformMutation.mutate(platform)}
                      disabled={connectPlatformMutation.isPending}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="email">Email Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Create Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Post Content</label>
                <Textarea
                  placeholder="Share civic updates, event announcements, or community news..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {postContent.length}/280 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {connectionsData.filter(c => c.connected).map((connection) => {
                    const Icon = platformIcons[connection.platform as keyof typeof platformIcons];
                    const isSelected = selectedPlatforms.includes(connection.platform);
                    
                    return (
                      <Button
                        key={connection.platform}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformToggle(connection.platform)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {connection.platform}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline">
                  Save Draft
                </Button>
                <Button 
                  onClick={handlePublish}
                  disabled={publishPostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {scheduledDate ? 'Schedule Post' : 'Publish Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postsData.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Platforms:</span>
                          {post.platforms.map((platform, index) => {
                            const Icon = platformIcons[platform as keyof typeof platformIcons];
                            return (
                              <Icon key={index} className={`h-3 w-3 ${getPlatformColor(platform)}`} />
                            );
                          })}
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                        {post.status}
                      </Badge>
                    </div>

                    {post.metrics && (
                      <div className="grid grid-cols-4 gap-4 pt-3 border-t text-center">
                        <div>
                          <div className="font-medium text-sm">{post.metrics.views}</div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{post.metrics.likes}</div>
                          <div className="text-xs text-gray-500">Likes</div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{post.metrics.shares}</div>
                          <div className="text-xs text-gray-500">Shares</div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{post.metrics.comments}</div>
                          <div className="text-xs text-gray-500">Comments</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        {post.publishedDate ? (
                          `Published ${new Date(post.publishedDate).toLocaleDateString()}`
                        ) : post.scheduledDate ? (
                          `Scheduled for ${new Date(post.scheduledDate).toLocaleDateString()}`
                        ) : 'Draft'}
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>

                {campaignsData.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{campaign.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {campaign.recipients.toLocaleString()} recipients
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </div>

                    {campaign.status === 'sent' && campaign.openRate !== undefined && (
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                        <div className="text-center">
                          <div className="font-medium text-sm">{campaign.openRate}%</div>
                          <div className="text-xs text-gray-500">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">{campaign.clickRate}%</div>
                          <div className="text-xs text-gray-500">Click Rate</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        {campaign.sentDate && `Sent ${new Date(campaign.sentDate).toLocaleDateString()}`}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Reach</span>
                    <span className="font-bold">12,456</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Engagement Rate</span>
                    <span className="font-bold">4.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Click-through Rate</span>
                    <span className="font-bold">2.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shares</span>
                    <span className="font-bold">342</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Community Budget Meeting Announcement</p>
                    <p className="text-xs text-gray-600 mt-1">2,100 views • 89 shares</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">New Park Development Update</p>
                    <p className="text-xs text-gray-600 mt-1">1,876 views • 67 shares</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Road Closure Alert</p>
                    <p className="text-xs text-gray-600 mt-1">3,421 views • 156 shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
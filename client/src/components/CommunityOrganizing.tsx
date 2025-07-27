import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar,
  MapPin,
  Target,
  Megaphone,
  UserPlus,
  CheckCircle,
  Clock,
  Flag,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Settings,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  targetParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate?: string;
  organizer: string;
  tags: string[];
  activities: Activity[];
  volunteers: Volunteer[];
}

interface Activity {
  id: string;
  title: string;
  type: 'event' | 'outreach' | 'petition' | 'meeting' | 'rally';
  date: string;
  location?: string;
  description: string;
  attendees: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  availability: string[];
  role: string;
  joinDate: string;
  hoursContributed: number;
}

interface Coalition {
  id: string;
  name: string;
  description: string;
  members: number;
  organizations: string[];
  sharedGoals: string[];
  leadOrganization: string;
  meetingSchedule: string;
  nextMeeting?: string;
}

export function CommunityOrganizing() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal: "",
    targetParticipants: 100,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/organizing/campaigns'],
  });

  const { data: coalitions = [] } = useQuery({
    queryKey: ['/api/organizing/coalitions'],
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['/api/organizing/volunteers'],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      const response = await fetch('/api/organizing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });
      setShowCreateForm(false);
      setNewCampaign({ title: "", description: "", goal: "", targetParticipants: 100 });
      queryClient.invalidateQueries({ queryKey: ['/api/organizing/campaigns'] });
    },
  });

  const joinCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/organizing/campaigns/${campaignId}/join`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined the campaign!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizing/campaigns'] });
    },
  });

  const campaignsData = campaigns as Campaign[];
  const coalitionsData = coalitions as Coalition[];
  const volunteersData = volunteers as Volunteer[];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'completed': 
      case 'in-progress': return 'text-green-600 bg-green-50 border-green-200';
      case 'planning': 
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'paused': 
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'outreach': return Megaphone;
      case 'petition': return Flag;
      case 'meeting': return Users;
      case 'rally': return TrendingUp;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Community Organizing</h2>
          <p className="text-gray-600 mt-1">Coordinate campaigns, manage volunteers, and build coalitions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Title</label>
              <Input
                placeholder="Enter campaign title..."
                value={newCampaign.title}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe your campaign goals and activities..."
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <Input
                placeholder="What do you want to achieve?"
                value={newCampaign.goal}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Participants</label>
              <Input
                type="number"
                min="1"
                value={newCampaign.targetParticipants}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, targetParticipants: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createCampaignMutation.mutate(newCampaign)}
                disabled={createCampaignMutation.isPending || !newCampaign.title.trim()}
              >
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="coalitions">Coalitions</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaignsData.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium text-sm">Goal: {campaign.goal}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Participants</span>
                      <span>{campaign.currentParticipants}/{campaign.targetParticipants}</span>
                    </div>
                    <Progress value={(campaign.currentParticipants / campaign.targetParticipants) * 100} />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {campaign.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3" />
                      Organized by {campaign.organizer}
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Recent Activities */}
                  {campaign.activities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recent Activities</h4>
                      <div className="space-y-2">
                        {campaign.activities.slice(0, 3).map((activity) => {
                          const Icon = getActivityIcon(activity.type);
                          return (
                            <div key={activity.id} className="flex items-center gap-2 text-sm">
                              <Icon className="h-3 w-3 text-gray-500" />
                              <span className="flex-1">{activity.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.attendees} attending
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => joinCampaignMutation.mutate(campaign.id)}
                      disabled={joinCampaignMutation.isPending}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Discuss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Volunteer Management</h3>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Recruit Volunteers
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteersData.map((volunteer) => (
                <Card key={volunteer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>
                          {volunteer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{volunteer.name}</h4>
                        <p className="text-sm text-gray-600">{volunteer.role}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-1">Availability</h5>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.availability.map((day, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Hours contributed:</span>
                        <span className="font-medium">{volunteer.hoursContributed}</span>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coalitions">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Coalition Building</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Form Coalition
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {coalitionsData.map((coalition) => (
                <Card key={coalition.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{coalition.name}</CardTitle>
                    <p className="text-sm text-gray-600">{coalition.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-civic-blue-600">{coalition.members}</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{coalition.organizations.length}</div>
                        <div className="text-sm text-gray-600">Organizations</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Member Organizations</h4>
                      <div className="flex flex-wrap gap-1">
                        {coalition.organizations.slice(0, 4).map((org, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {org}
                          </Badge>
                        ))}
                        {coalition.organizations.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{coalition.organizations.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Shared Goals</h4>
                      <div className="space-y-1">
                        {coalition.sharedGoals.slice(0, 3).map((goal, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Led by {coalition.leadOrganization}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Meets {coalition.meetingSchedule}
                      </p>
                      {coalition.nextMeeting && (
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Next meeting: {new Date(coalition.nextMeeting).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Join Coalition
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Action Plan Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Pre-built templates for common civic initiatives and campaigns.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Petition Drive Template
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Town Hall Organization
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Voter Registration Drive
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Community Clean-up Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Coordination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced tools for organizing rallies, meetings, and civic events.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="h-3 w-3 mr-2" />
                    Venue Management
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-3 w-3 mr-2" />
                    RSVP Tracking
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Megaphone className="h-3 w-3 mr-2" />
                    Promotional Tools
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor and measure the effectiveness of your organizing efforts.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Campaign Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Engagement Metrics
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Success Stories
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Communication Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Coordinate messaging across multiple channels and platforms.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Bulk Messaging
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Social Media Sync
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Press Kit Generator
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Coalition Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tools to identify, connect, and coordinate with aligned organizations.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Organization Finder
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Partnership Manager
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Joint Action Planner
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Crisis Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Rapid response tools for urgent community issues and emergencies.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Emergency Alerts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Rapid Mobilization
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Media Response Kit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
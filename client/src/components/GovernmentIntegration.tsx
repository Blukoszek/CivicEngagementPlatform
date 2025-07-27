import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  FileText, 
  Calendar,
  TrendingUp,
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  MapPin
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

interface GovernmentData {
  id: string;
  source: string;
  type: 'budget' | 'legislation' | 'meeting' | 'census' | 'spending' | 'voting';
  title: string;
  description: string;
  data: any;
  lastUpdated: string;
  status: 'active' | 'scheduled' | 'completed' | 'archived';
  url?: string;
}

interface ApiConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  dataPoints: number;
  description: string;
}

interface LegislativeItem {
  id: string;
  billNumber: string;
  title: string;
  status: string;
  sponsor: string;
  committee: string;
  lastAction: string;
  lastActionDate: string;
  summary: string;
  votingRecord?: VotingRecord[];
}

interface VotingRecord {
  representative: string;
  vote: 'yes' | 'no' | 'abstain';
  party: string;
}

interface BudgetData {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export function GovernmentIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: apiConnections = [] } = useQuery({
    queryKey: ['/api/government/connections'],
  });

  const { data: governmentData = [] } = useQuery({
    queryKey: ['/api/government/data', searchQuery],
  });

  const { data: legislation = [] } = useQuery({
    queryKey: ['/api/government/legislation'],
  });

  const { data: budgetData = [] } = useQuery({
    queryKey: ['/api/government/budget'],
  });

  const syncDataMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/api/government/sync/${connectionId}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/government/data'] });
    },
  });

  const connectionsData = apiConnections as ApiConnection[];
  const govData = governmentData as GovernmentData[];
  const legislationData = legislation as LegislativeItem[];
  const budgetInfo = budgetData as BudgetData[];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': 
      case 'active': 
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': 
      case 'disconnected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return DollarSign;
      case 'legislation': return FileText;
      case 'meeting': return Calendar;
      case 'census': return Users;
      case 'spending': return TrendingUp;
      case 'voting': return CheckCircle;
      default: return Database;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Government Data Integration</h2>
          <p className="text-gray-600 mt-1">Real-time access to official government data and APIs</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* API Connections Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            API Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectionsData.map((connection) => (
              <div key={connection.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{connection.name}</h4>
                  <Badge className={`text-xs ${getStatusColor(connection.status)}`}>
                    {connection.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{connection.description}</p>
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>Last sync: {new Date(connection.lastSync).toLocaleDateString()}</span>
                  <span>{connection.dataPoints.toLocaleString()} records</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => syncDataMutation.mutate(connection.id)}
                  disabled={syncDataMutation.isPending}
                >
                  {syncDataMutation.isPending ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="legislation">Legislation</TabsTrigger>
          <TabsTrigger value="budget">Budget Data</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Government Data Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search government data, documents, meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <div className="space-y-3">
                {govData.slice(0, 10).map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-civic-blue-50 rounded-lg">
                            <Icon className="h-5 w-5 text-civic-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {item.source}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                          {item.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Active Bills</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$2.4M</div>
                  <div className="text-sm text-gray-600">Budget Available</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-gray-600">Upcoming Meetings</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">94%</div>
                  <div className="text-sm text-gray-600">Data Accuracy</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legislation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Legislative Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legislationData.map((bill) => (
                  <div key={bill.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{bill.billNumber}</h4>
                          <Badge variant="outline" className="text-xs">
                            {bill.status}
                          </Badge>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">{bill.title}</h5>
                        <p className="text-sm text-gray-600">{bill.summary}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Sponsor:</span>
                        <p className="text-gray-600">{bill.sponsor}</p>
                      </div>
                      <div>
                        <span className="font-medium">Committee:</span>
                        <p className="text-gray-600">{bill.committee}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Action:</span>
                        <p className="text-gray-600">{bill.lastAction}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">{new Date(bill.lastActionDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {bill.votingRecord && bill.votingRecord.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h6 className="font-medium mb-2">Voting Record</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="font-bold text-green-600">
                              {bill.votingRecord.filter(v => v.vote === 'yes').length}
                            </div>
                            <div className="text-xs text-gray-600">Yes</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded">
                            <div className="font-bold text-red-600">
                              {bill.votingRecord.filter(v => v.vote === 'no').length}
                            </div>
                            <div className="text-xs text-gray-600">No</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-bold text-gray-600">
                              {bill.votingRecord.filter(v => v.vote === 'abstain').length}
                            </div>
                            <div className="text-xs text-gray-600">Abstain</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Allocation & Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budgetInfo.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetInfo}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                      <Bar dataKey="spent" fill="#10B981" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No budget data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetInfo.map((item) => (
                <Card key={item.category}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Allocated:</span>
                        <span className="font-medium">${item.allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spent:</span>
                        <span className="font-medium">${item.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-medium text-green-600">${item.remaining.toLocaleString()}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Usage</span>
                          <span>{item.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.percentage > 90 ? 'bg-red-500' : 
                              item.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Government Meetings & Proceedings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {govData.filter(item => item.type === 'meeting').map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {meeting.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(meeting.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </Badge>
                        {meeting.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={meeting.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
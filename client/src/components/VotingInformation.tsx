import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Vote, 
  Calendar,
  MapPin,
  User,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Building
} from "lucide-react";

interface Election {
  id: string;
  title: string;
  date: string;
  type: 'federal' | 'state' | 'local';
  status: 'upcoming' | 'active' | 'completed';
  description: string;
  registrationDeadline: string;
  earlyVotingStart?: string;
  earlyVotingEnd?: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  office: string;
  bio: string;
  platform: string[];
  website?: string;
  email?: string;
  phone?: string;
  endorsements: string[];
  image?: string;
}

interface PollingLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  accessibility: boolean;
  parking: boolean;
  distance?: number;
}

interface VoterInfo {
  registered: boolean;
  registrationStatus: string;
  pollingLocation?: PollingLocation;
  district: string;
  lastVoted?: string;
}

export function VotingInformation() {
  const [activeTab, setActiveTab] = useState("elections");
  const [zipCode, setZipCode] = useState("");
  const [selectedElection, setSelectedElection] = useState<string | null>(null);

  const { data: elections = [] } = useQuery({
    queryKey: ['/api/voting/elections'],
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['/api/voting/candidates', selectedElection],
    enabled: !!selectedElection,
  });

  const { data: pollingLocations = [] } = useQuery({
    queryKey: ['/api/voting/polling-locations', zipCode],
    enabled: !!zipCode,
  });

  const { data: voterInfo } = useQuery({
    queryKey: ['/api/voting/voter-info'],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      // In reality, this would redirect to official voter registration
      window.open('https://www.vote.gov/', '_blank');
      return { success: true };
    },
  });

  const electionsData = elections as Election[];
  const candidatesData = candidates as Candidate[];
  const locationsData = pollingLocations as PollingLocation[];
  const voterData = voterInfo as VoterInfo;

  const getElectionTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'state': return 'bg-green-50 text-green-700 border-green-200';
      case 'local': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Voting Information Hub</h2>
          <p className="text-gray-600 mt-1">Everything you need to participate in elections</p>
        </div>
        <div className="flex gap-2">
          {!voterData?.registered && (
            <Button onClick={() => registerMutation.mutate()}>
              <Vote className="h-4 w-4 mr-2" />
              Register to Vote
            </Button>
          )}
        </div>
      </div>

      {/* Voter Status */}
      {voterData && (
        <Card className={voterData.registered ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {voterData.registered ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-orange-600" />
              )}
              <div>
                <h3 className="font-medium">
                  {voterData.registered ? "You're registered to vote!" : "Voter registration required"}
                </h3>
                <p className="text-sm text-gray-600">
                  {voterData.registered 
                    ? `District: ${voterData.district} • Last voted: ${voterData.lastVoted || 'Never'}`
                    : "Register to vote to participate in upcoming elections"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="polling">Polling Places</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {electionsData.map((election) => (
              <Card key={election.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => setSelectedElection(election.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{election.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`text-xs ${getElectionTypeColor(election.type)}`}>
                        {election.type}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(election.status)}`}>
                        {election.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Election Date: {new Date(election.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Registration Deadline: {new Date(election.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                    {election.earlyVotingStart && (
                      <div className="flex items-center gap-2">
                        <Vote className="h-4 w-4 text-gray-500" />
                        <span>
                          Early Voting: {new Date(election.earlyVotingStart).toLocaleDateString()} - {new Date(election.earlyVotingEnd!).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("candidates");
                      setSelectedElection(election.id);
                    }}
                  >
                    View Candidates
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <div className="space-y-6">
            {!selectedElection ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Select an election to view candidates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {candidatesData.map((candidate) => (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <p className="text-sm text-gray-600">{candidate.party}</p>
                          <p className="text-sm font-medium">{candidate.office}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700">{candidate.bio}</p>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Key Platform Points</h4>
                        <div className="space-y-1">
                          {candidate.platform.slice(0, 3).map((point, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {candidate.endorsements.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Endorsements</h4>
                          <div className="flex flex-wrap gap-1">
                            {candidate.endorsements.map((endorsement, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {endorsement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        {candidate.website && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={candidate.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                        {candidate.email && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`mailto:${candidate.email}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </a>
                          </Button>
                        )}
                        {candidate.phone && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${candidate.phone}`}>
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="polling">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Polling Place</CardTitle>
                <p className="text-sm text-gray-600">Enter your ZIP code to find nearby polling locations</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                  />
                  <Button disabled={zipCode.length !== 5}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {locationsData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {locationsData.map((location) => (
                  <Card key={location.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <p className="text-sm text-gray-600">{location.address}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{location.hours}</span>
                      </div>
                      
                      {location.distance && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{location.distance} miles away</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {location.accessibility && (
                          <Badge variant="secondary" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            Accessible
                          </Badge>
                        )}
                        {location.parking && (
                          <Badge variant="secondary" className="text-xs">
                            Parking Available
                          </Badge>
                        )}
                      </div>

                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Get Directions
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Voting Guides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Voter Guide 2024
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Ballot Measures Explained
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Candidate Comparison Tool
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Voting Rights Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Official Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.vote.gov/" target="_blank" rel="noopener noreferrer">
                    <Vote className="h-4 w-4 mr-2" />
                    Vote.gov - Register to Vote
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.eac.gov/" target="_blank" rel="noopener noreferrer">
                    Election Assistance Commission
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  State Election Office
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Local Election Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Voter Registration Deadline:</span>
                    <span className="font-medium">October 9, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Early Voting Begins:</span>
                    <span className="font-medium">October 17, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absentee Ballot Request Deadline:</span>
                    <span className="font-medium">October 25, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Election Day:</span>
                    <span className="font-medium">November 5, 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Election Hotline: 1-866-OUR-VOTE
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Local Election Office
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Report Voting Issues
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Voter Education Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
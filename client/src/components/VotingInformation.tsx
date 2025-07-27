import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Vote, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  photo?: string;
  website?: string;
  experience: string;
  keyIssues: string[];
  endorsements: string[];
  funding: number;
}

interface Election {
  id: string;
  title: string;
  date: string;
  type: string;
  status: 'upcoming' | 'active' | 'completed';
  description: string;
  positions: string[];
  turnoutExpected: number;
  lastTurnout: number;
}

interface PollingLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  accessibility: boolean;
  parking: boolean;
  distance: number;
}

export function VotingInformation() {
  const [zipCode, setZipCode] = useState("");
  const [selectedElection, setSelectedElection] = useState<string>("");

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

  const electionsData = elections as Election[];
  const candidatesData = candidates as Candidate[];
  const locationsData = pollingLocations as PollingLocation[];

  const upcomingElections = electionsData.filter(e => e.status === 'upcoming');
  const nextElection = upcomingElections[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Voting Information</h2>
          <p className="text-gray-600 mt-1">Stay informed about elections, candidates, and polling locations</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Vote className="h-4 w-4" />
          Election Center
        </Badge>
      </div>

      {/* Next Election Alert */}
      {nextElection && (
        <Card className="border-civic-blue-200 bg-civic-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-civic-blue-900">
              <AlertCircle className="h-5 w-5" />
              Upcoming Election
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{nextElection.title}</h3>
                <p className="text-gray-600">{nextElection.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(nextElection.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.ceil((new Date(nextElection.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
              </div>
              <Button onClick={() => setSelectedElection(nextElection.id)}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polling Location Finder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Your Polling Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter your ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {locationsData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Polling Locations Near You</h4>
              {locationsData.map((location) => (
                <div key={location.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{location.name}</h5>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      <p className="text-sm text-gray-600">Hours: {location.hours}</p>
                    </div>
                    <Badge variant="outline">{location.distance} mi</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {location.accessibility && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accessible
                      </Badge>
                    )}
                    {location.parking && (
                      <Badge variant="secondary" className="text-xs">
                        Parking Available
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Elections List */}
      <Card>
        <CardHeader>
          <CardTitle>Elections & Ballots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {electionsData.map((election) => (
              <div 
                key={election.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedElection === election.id ? 'border-civic-blue-500 bg-civic-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedElection(election.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{election.title}</h4>
                    <p className="text-sm text-gray-600">{election.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(election.date).toLocaleDateString()}
                      </span>
                      <span>Positions: {election.positions.join(', ')}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={election.status === 'upcoming' ? 'default' : election.status === 'active' ? 'destructive' : 'secondary'}
                  >
                    {election.status}
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Expected Turnout</span>
                    <span>{election.turnoutExpected}%</span>
                  </div>
                  <Progress value={election.turnoutExpected} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Last election turnout: {election.lastTurnout}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Candidate Information */}
      {selectedElection && candidatesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Candidates & Ballot Information</CardTitle>
            <p className="text-sm text-gray-600">
              Learn about the candidates running in this election
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidatesData.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {candidate.photo ? (
                        <img src={candidate.photo} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.position}</p>
                      <Badge variant="outline" className="mt-1">
                        {candidate.party}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Experience</h5>
                      <p className="text-sm text-gray-600">{candidate.experience}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Key Issues</h5>
                      <div className="flex flex-wrap gap-1">
                        {candidate.keyIssues.map((issue, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {candidate.endorsements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Endorsements</h5>
                        <p className="text-xs text-gray-600">
                          {candidate.endorsements.join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-gray-600">
                        Campaign funding: ${candidate.funding.toLocaleString()}
                      </div>
                      {candidate.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={candidate.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Website
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
      )}

      {/* Voting Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Voting Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Vote className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">Voter Registration</h4>
              <p className="text-sm text-gray-600 mb-3">
                Check your registration status or register to vote
              </p>
              <Button size="sm" variant="outline">
                Check Status
              </Button>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">Absentee Voting</h4>
              <p className="text-sm text-gray-600 mb-3">
                Request an absentee ballot if you can't vote in person
              </p>
              <Button size="sm" variant="outline">
                Request Ballot
              </Button>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ExternalLink className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">Voter Guide</h4>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive guide to elections and voting process
              </p>
              <Button size="sm" variant="outline">
                View Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
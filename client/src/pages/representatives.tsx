import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Mail, Phone, Globe, MapPin, Building } from "lucide-react";

export default function Representatives() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allRepresentatives } = useQuery({
    queryKey: ['/api/representatives'],
  });

  const { data: localReps } = useQuery({
    queryKey: ['/api/representatives?level=local'],
  });

  const { data: stateReps } = useQuery({
    queryKey: ['/api/representatives?level=state'],
  });

  const { data: federalReps } = useQuery({
    queryKey: ['/api/representatives?level=federal'],
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'local': return 'bg-civic-blue';
      case 'state': return 'bg-community-green';
      case 'federal': return 'bg-purple-600';
      default: return 'bg-civic-gray-500';
    }
  };

  const RepresentativeCard = ({ rep }: { rep: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={rep.profileImageUrl} alt={rep.name} />
            <AvatarFallback className="bg-civic-blue text-white text-lg">
              {getInitials(rep.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{rep.name}</CardTitle>
            <p className="text-civic-gray-600 mb-2">{rep.title}</p>
            <div className="flex items-center space-x-2">
              <Badge className={`${getLevelBadgeColor(rep.level)} text-white`}>
                {rep.level.toUpperCase()}
              </Badge>
              {rep.party && (
                <Badge variant="secondary">{rep.party}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rep.electorate && (
          <div className="flex items-center space-x-2 text-sm text-civic-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{rep.electorate}</span>
          </div>
        )}
        
        <div className="space-y-2">
          {rep.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-civic-gray-400" />
              <a 
                href={`mailto:${rep.email}`}
                className="text-sm text-civic-blue hover:underline"
              >
                {rep.email}
              </a>
            </div>
          )}
          
          {rep.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-civic-gray-400" />
              <a 
                href={`tel:${rep.phone}`}
                className="text-sm text-civic-blue hover:underline"
              >
                {rep.phone}
              </a>
            </div>
          )}
          
          {rep.website && (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-civic-gray-400" />
              <a 
                href={rep.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-civic-blue hover:underline"
              >
                Official Website
              </a>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-3">
          <Button size="sm" variant="outline" className="flex-1">
            Contact
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Follow
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
                <h1 className="text-2xl font-bold text-civic-gray-900">Your Representatives</h1>
                <p className="text-civic-gray-500 mt-1">
                  Connect with your elected officials at all levels of government
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Local</span>
                </TabsTrigger>
                <TabsTrigger value="state" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>State</span>
                </TabsTrigger>
                <TabsTrigger value="federal" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Federal</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {allRepresentatives && allRepresentatives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allRepresentatives.map((rep: any) => (
                      <RepresentativeCard key={rep.id} rep={rep} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                      <p className="text-civic-gray-500">No representatives found.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="local" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-civic-blue" />
                      <span>Local Government</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {localReps && localReps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {localReps.map((rep: any) => (
                          <RepresentativeCard key={rep.id} rep={rep} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No local representatives found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="state" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-community-green" />
                      <span>State Government</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stateReps && stateReps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stateReps.map((rep: any) => (
                          <RepresentativeCard key={rep.id} rep={rep} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No state representatives found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="federal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <span>Federal Government</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {federalReps && federalReps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {federalReps.map((rep: any) => (
                          <RepresentativeCard key={rep.id} rep={rep} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500">No federal representatives found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Contact Tips */}
            <Card className="border-civic-blue/20 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-civic-blue">
                  <Mail className="h-5 w-5" />
                  <span>Tips for Contacting Representatives</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-civic-gray-600">
                  <p className="mb-2">• <strong>Be clear and concise:</strong> State your issue and position clearly</p>
                  <p className="mb-2">• <strong>Include your address:</strong> Confirm you're a constituent</p>
                  <p className="mb-2">• <strong>Be respectful:</strong> Maintain a professional tone</p>
                  <p>• <strong>Follow up:</strong> Check back on important issues</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

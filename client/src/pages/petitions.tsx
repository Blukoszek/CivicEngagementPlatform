import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PetitionCard from "@/components/PetitionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, CheckCircle, Clock, Plus } from "lucide-react";

export default function Petitions() {
  const [activeTab, setActiveTab] = useState("active");

  const { data: activePetitions } = useQuery({
    queryKey: ['/api/petitions?active=true'],
  });

  const { data: allPetitions } = useQuery({
    queryKey: ['/api/petitions'],
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
                <h1 className="text-2xl font-bold text-civic-gray-900">Petitions</h1>
                <p className="text-civic-gray-500 mt-1">
                  Take action on issues that matter to your community
                </p>
              </div>
              <Button className="bg-action-red hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Start Petition
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Active</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <FileSignature className="h-4 w-4" />
                  <span>All Petitions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-action-red" />
                      <span>Active Petitions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activePetitions && activePetitions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activePetitions.map((petition: any) => (
                          <PetitionCard key={petition.id} petition={petition} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileSignature className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500 mb-4">No active petitions available.</p>
                        <Button className="bg-action-red hover:bg-red-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Start First Petition
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileSignature className="h-5 w-5 text-action-red" />
                      <span>All Petitions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {allPetitions && allPetitions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allPetitions.map((petition: any) => (
                          <PetitionCard key={petition.id} petition={petition} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileSignature className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500 mb-4">No petitions available.</p>
                        <Button className="bg-action-red hover:bg-red-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Start First Petition
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Petition Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-action-red mb-2">
                    {activePetitions?.length || 0}
                  </div>
                  <div className="text-sm text-civic-gray-500">Active Petitions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-community-green mb-2">73%</div>
                  <div className="text-sm text-civic-gray-500">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-civic-blue mb-2">12,847</div>
                  <div className="text-sm text-civic-gray-500">Total Signatures</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">156</div>
                  <div className="text-sm text-civic-gray-500">Issues Resolved</div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Success Story */}
            <Card className="border-community-green/20 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-community-green">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recent Success Story</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Preserve Springbrook National Park</h3>
                <p className="text-civic-gray-600 mb-4">
                  Thanks to 15,000+ signatures, the proposed commercial development 
                  in Springbrook National Park has been cancelled, protecting this 
                  precious ecosystem for future generations.
                </p>
                <div className="flex items-center space-x-4 text-sm text-civic-gray-500">
                  <span>✅ 15,847 signatures</span>
                  <span>⏱️ Completed in 30 days</span>
                  <span>🎉 Goal achieved</span>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

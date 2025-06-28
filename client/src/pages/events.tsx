import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import EventCard from "@/components/EventCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarPlus, Clock, MapPin } from "lucide-react";

export default function Events() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: upcomingEvents } = useQuery({
    queryKey: ['/api/events?upcoming=true'],
  });

  const { data: allEvents } = useQuery({
    queryKey: ['/api/events'],
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
                <h1 className="text-2xl font-bold text-civic-gray-900">Civic Events</h1>
                <p className="text-civic-gray-500 mt-1">
                  Stay informed about community meetings and civic activities
                </p>
              </div>
              <Button className="bg-civic-blue hover:bg-blue-600 text-white">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>All Events</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-civic-blue" />
                      <span>Upcoming Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event: any) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500 mb-4">No upcoming events scheduled.</p>
                        <Button className="bg-civic-blue hover:bg-blue-600 text-white">
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Create First Event
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
                      <Calendar className="h-5 w-5 text-civic-blue" />
                      <span>All Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {allEvents && allEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allEvents.map((event: any) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-civic-gray-300" />
                        <p className="text-civic-gray-500 mb-4">No events available.</p>
                        <Button className="bg-civic-blue hover:bg-blue-600 text-white">
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Create First Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-civic-blue mb-2">
                    {upcomingEvents?.length || 0}
                  </div>
                  <div className="text-sm text-civic-gray-500">Upcoming Events</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-community-green mb-2">156</div>
                  <div className="text-sm text-civic-gray-500">Total Attendees</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">8</div>
                  <div className="text-sm text-civic-gray-500">This Month</div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

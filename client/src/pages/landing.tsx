import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, FileText, Vote, UserCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-civic-blue/10 to-community-green/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-civic-blue rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-civic-gray-900">CivicConnect</h1>
            </div>
            <p className="text-xl text-civic-gray-500 mb-8 max-w-3xl mx-auto">
              Your voice matters in our community. Connect with local discussions, attend civic events, 
              and make a difference in democratic participation.
            </p>
            <Button 
              size="lg" 
              className="bg-civic-blue hover:bg-blue-600 text-white px-8 py-3 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started - Join the Community
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-civic-gray-900 mb-4">
            Engage with Your Community
          </h2>
          <p className="text-lg text-civic-gray-500 max-w-2xl mx-auto">
            A comprehensive platform designed to strengthen democratic participation and community engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-civic-blue/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-civic-blue" />
              </div>
              <CardTitle className="text-xl">Community Forums</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Join location-based and topic-specific discussions. Share concerns, ask questions, 
                and engage in constructive civic discourse with your neighbors.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-community-green/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-community-green" />
              </div>
              <CardTitle className="text-xl">Civic Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Stay informed about town halls, council meetings, community gatherings, 
                and volunteer opportunities. Never miss an important civic event.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Local News</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Access curated local news and government updates relevant to your area. 
                Stay informed about policies and decisions that affect your community.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-action-red/10 rounded-lg flex items-center justify-center mb-4">
                <Vote className="h-6 w-6 text-action-red" />
              </div>
              <CardTitle className="text-xl">Petitions & Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Discover and support petitions for causes you care about. 
                Take direct action on local and national issues that matter to your community.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Representatives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Connect with your elected officials at local, state, and federal levels. 
                Contact representatives and stay updated on their activities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-civic-gray-500">
                Get help understanding complex policies, summarizing documents, 
                and finding information about civic processes with our AI assistant.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-civic-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of engaged citizens working together to strengthen our democracy.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-civic-blue hover:bg-gray-100 px-8 py-3 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Engaging Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  FileText, 
  FileSignature, 
  UserCheck,
  Plus,
  CalendarPlus,
  Bot,
  Sparkles,
  User,
  Calculator,
  Building2,
  Share2,
  Users,
  Vote,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const coreNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Forums", href: "/forums", icon: MessageSquare },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Local News", href: "/news", icon: FileText },
    { name: "Petitions", href: "/petitions", icon: FileSignature },
    { name: "Representatives", href: "/representatives", icon: UserCheck },
  ];

  const advancedNavigation = [
    { name: "AI Recommendations", href: "/ai-recommendations", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Budget", href: "/budget", icon: DollarSign },
    { name: "Voting Info", href: "/voting", icon: Vote },
    { name: "Policy Simulation", href: "/policy-simulation", icon: Calculator },
    { name: "Government Data", href: "/government-data", icon: Building2 },
    { name: "Social Media", href: "/social-media", icon: Share2 },
    { name: "Organizing", href: "/organizing", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside className="lg:w-64 space-y-6">
      {/* Core Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">CORE FEATURES</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <nav className="space-y-1">
            {coreNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      isActive(item.href) 
                        ? "bg-civic-blue text-white hover:bg-blue-600" 
                        : "text-civic-gray-700 hover:bg-civic-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Advanced Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">ADVANCED TOOLS</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <nav className="space-y-1">
            {advancedNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      isActive(item.href) 
                        ? "bg-civic-blue text-white hover:bg-blue-600" 
                        : "text-civic-gray-700 hover:bg-civic-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full bg-community-green hover:bg-green-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Start Discussion
          </Button>
          <Button className="w-full bg-civic-blue hover:bg-blue-600 text-white">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button className="w-full bg-action-red hover:bg-red-700 text-white">
            <FileSignature className="h-4 w-4 mr-2" />
            Start Petition
          </Button>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3 text-white" />
            </div>
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-civic-gray-600 mb-3">
            Ask questions about local issues, policies, or get summaries of complex documents.
          </p>
          <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with AI
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

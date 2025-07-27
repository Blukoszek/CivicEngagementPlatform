import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  Newspaper,
  Menu,
  X,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationCenter } from "./NotificationCenter";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/", exact: true },
  { icon: MessageSquare, label: "Forums", href: "/forums" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: FileText, label: "Petitions", href: "/petitions" },
  { icon: Newspaper, label: "News", href: "/news" },
  { icon: Users, label: "Representatives", href: "/representatives" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

export function MobileNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="py-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-civic-blue-600 rounded-lg flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-civic-blue-900">CivicConnect</h2>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={active ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${
                            active 
                              ? "bg-civic-blue-600 text-white" 
                              : "text-gray-600 hover:text-civic-blue-900 hover:bg-civic-blue-50"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                          {item.label === "Events" && (
                            <Badge variant="secondary" className="ml-auto">
                              3
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-medium">Community Stats</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Active Users</span>
                        <span className="font-medium">245</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Week's Posts</span>
                        <span className="font-medium">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upcoming Events</span>
                        <span className="font-medium">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-bold text-civic-blue-900">CivicConnect</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button variant="outline" size="sm">
            Login
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-12 px-2 ${
                    active 
                      ? "text-civic-blue-600 bg-civic-blue-50" 
                      : "text-gray-600"
                  }`}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{item.label}</span>
                  {item.label === "Events" && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      3
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
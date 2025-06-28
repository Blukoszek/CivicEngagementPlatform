import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MapPin, Search, Bell, ChevronDown, Menu, X } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-civic-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-civic-blue rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-civic-gray-900">CivicConnect</span>
            </div>
            
            {/* Location Indicator */}
            <div className="hidden sm:flex items-center space-x-1 text-sm text-civic-gray-500 bg-civic-gray-100 px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              <span>{user?.location || "Gold Coast, QLD"}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-civic-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search discussions, events, or ask AI..." 
                className="pl-10 border-civic-gray-200 focus:ring-2 focus:ring-civic-blue focus:border-transparent" 
              />
            </div>
          </div>

          {/* Navigation and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-civic-gray-500" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-action-red text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Profile */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-civic-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-civic-blue text-white text-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-civic-gray-900">
                      {user.firstName || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-civic-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Notification Preferences</DropdownMenuItem>
                  <DropdownMenuItem>Location Settings</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-action-red focus:text-action-red"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-civic-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-civic-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 border-civic-gray-200" 
              />
            </div>
            
            {/* Mobile Location */}
            <div className="flex items-center space-x-2 text-sm text-civic-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{user?.location || "Gold Coast, QLD"}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, TrendingUp, BarChart3, Mail, Phone } from "lucide-react";

export default function RightSidebar() {
  const { data: representatives } = useQuery({
    queryKey: ['/api/representatives?limit=3'],
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const trendingTags = [
    "#GoldCoastTransport",
    "#CommunityGarden", 
    "#AffordableHousing",
    "#ClimateAction",
    "#LocalBusiness",
    "#DigitalInclusion"
  ];

  const getTagColor = (index: number) => {
    const colors = [
      "bg-civic-blue hover:bg-blue-600",
      "bg-community-green hover:bg-green-600", 
      "bg-purple-500 hover:bg-purple-600",
      "bg-orange-500 hover:bg-orange-600",
      "bg-pink-500 hover:bg-pink-600",
      "bg-indigo-500 hover:bg-indigo-600"
    ];
    return colors[index % colors.length];
  };

  return (
    <aside className="lg:w-80 space-y-6">
      {/* Representatives Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-civic-blue" />
            <span>Your Representatives</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {representatives && representatives.length > 0 ? (
            representatives.map((rep: any) => (
              <div key={rep.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-civic-gray-50 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={rep.profileImageUrl} alt={rep.name} />
                  <AvatarFallback className="bg-civic-blue text-white">
                    {getInitials(rep.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-civic-gray-900 truncate">{rep.name}</h4>
                  <p className="text-sm text-civic-gray-600 truncate">{rep.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-civic-blue">
                      Contact
                    </Button>
                    <span className="text-civic-gray-300">•</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-civic-blue">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-civic-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No representatives found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>Trending Hashtags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, index) => (
              <Badge
                key={tag}
                className={`${getTagColor(index)} text-white cursor-pointer transition-colors`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="bg-gradient-to-br from-civic-blue to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Community Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Active Members</span>
            <span className="font-bold">8,472</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Issues Resolved</span>
            <span className="font-bold">156</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Petitions Success</span>
            <span className="font-bold">73%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Events This Month</span>
            <span className="font-bold">24</span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

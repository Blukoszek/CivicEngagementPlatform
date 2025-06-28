import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
    organizerId: string;
    category?: string;
    attendeeCount: number;
    isVirtual: boolean;
    meetingUrl?: string;
  };
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attendanceStatus, setAttendanceStatus] = useState<string>('not_attending');

  const attendMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest('POST', `/api/events/${event.id}/attend`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Attendance updated",
        description: "Your attendance status has been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAttendance = (status: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for events.",
        variant: "destructive",
      });
      return;
    }

    setAttendanceStatus(status);
    attendMutation.mutate(status);
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'town hall':
        return 'bg-civic-blue';
      case 'community':
        return 'bg-community-green';
      case 'workshop':
        return 'bg-purple-500';
      case 'volunteer':
        return 'bg-orange-500';
      default:
        return 'bg-civic-gray-500';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: format(date, 'd'),
      month: format(date, 'MMM'),
      time: format(date, 'h:mm a'),
      fullDate: format(date, 'EEEE, MMMM d, yyyy')
    };
  };

  const eventDate = formatEventDate(event.startTime);

  if (compact) {
    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-civic-gray-50 transition-colors">
        <div className={`flex-shrink-0 w-12 h-12 ${getCategoryColor(event.category)} rounded-lg flex flex-col items-center justify-center text-white text-sm`}>
          <div className="font-bold">{eventDate.day}</div>
          <div className="text-xs">{eventDate.month}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-civic-gray-900 truncate">{event.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-civic-gray-600">
            {event.isVirtual ? (
              <Video className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            <span className="truncate">
              {event.isVirtual ? 'Virtual Event' : event.location || 'Location TBD'}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1 text-xs text-civic-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {eventDate.time}
            </span>
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {event.attendeeCount} attending
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-12 h-12 ${getCategoryColor(event.category)} rounded-lg flex flex-col items-center justify-center text-white text-sm`}>
              <div className="font-bold">{eventDate.day}</div>
              <div className="text-xs">{eventDate.month}</div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <p className="text-sm text-civic-gray-600 mt-1">{eventDate.fullDate}</p>
            </div>
          </div>
          {event.category && (
            <Badge className={`${getCategoryColor(event.category)} text-white`}>
              {event.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-civic-gray-600">{event.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-civic-gray-600">
            <Clock className="h-4 w-4" />
            <span>{eventDate.time}</span>
            {event.endTime && (
              <span>- {format(new Date(event.endTime), 'h:mm a')}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-civic-gray-600">
            {event.isVirtual ? (
              <>
                <Video className="h-4 w-4" />
                <span>Virtual Event</span>
                {event.meetingUrl && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-sm text-civic-blue"
                    onClick={() => window.open(event.meetingUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Join Meeting
                  </Button>
                )}
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>{event.location || 'Location TBD'}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-civic-gray-600">
            <Users className="h-4 w-4" />
            <span>{event.attendeeCount} people attending</span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            onClick={() => handleAttendance('attending')}
            disabled={attendMutation.isPending}
            className={`flex-1 ${
              attendanceStatus === 'attending' 
                ? 'bg-community-green hover:bg-green-600 text-white' 
                : 'bg-civic-gray-100 hover:bg-civic-gray-200 text-civic-gray-700'
            }`}
          >
            {attendanceStatus === 'attending' ? 'Attending' : 'Attend'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAttendance('maybe')}
            disabled={attendMutation.isPending}
            className={`flex-1 ${
              attendanceStatus === 'maybe' 
                ? 'bg-orange-100 border-orange-300 text-orange-700' 
                : ''
            }`}
          >
            Maybe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

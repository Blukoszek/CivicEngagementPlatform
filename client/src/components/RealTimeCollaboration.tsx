import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageCircle, 
  Send, 
  Eye, 
  Clock,
  Zap,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: string;
  entityId: number;
  entityTitle: string;
  description: string;
  timestamp: string;
}

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  currentPage: string;
  lastSeen: string;
  isOnline: boolean;
}

interface LiveComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  entityType: string;
  entityId: number;
}

export function RealTimeCollaboration({ entityType, entityId }: { entityType: string; entityId: number }) {
  const [newComment, setNewComment] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // Fetch live activities
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/live/activities', entityType, entityId],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch active users
  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/live/users'],
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Fetch live comments
  const { data: liveComments = [] } = useQuery({
    queryKey: ['/api/live/comments', entityType, entityId],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/live/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          entityType,
          entityId,
        }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live/comments', entityType, entityId] });
      setNewComment("");
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const activitiesData = activities as LiveActivity[];
  const usersData = activeUsers as ActiveUser[];
  const commentsData = liveComments as LiveComment[];

  return (
    <div className="space-y-6">
      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users ({usersData.filter(u => u.isOnline).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {usersData.filter(u => u.isOnline).map((user) => (
              <div key={user.id} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
            {usersData.filter(u => u.isOnline).length === 0 && (
              <p className="text-gray-500 text-sm">No other users online</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity
            <Badge variant="secondary" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activitiesData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No recent activity
                </p>
              ) : (
                activitiesData.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {activity.userName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {activity.entityTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          on "{activity.entityTitle}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Live Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Live Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 mb-4">
            <div className="space-y-3">
              {commentsData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Start the conversation!
                </p>
              ) : (
                commentsData.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {comment.userName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the discussion..."
              className="flex-1"
              disabled={addCommentMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || addCommentMutation.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Presence Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Who's Here
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {usersData.filter(u => u.isOnline).length + 1}
              </div>
              <div className="text-sm text-gray-600">Online Now</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activitiesData.length}
              </div>
              <div className="text-sm text-gray-600">Recent Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
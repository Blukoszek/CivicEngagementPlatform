import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ForumPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    authorId: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    isSticky?: boolean;
  };
  compact?: boolean;
}

export default function ForumPost({ post, compact = false }: ForumPostProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'upvote' | 'downvote') => {
      await apiRequest('POST', `/api/posts/${post.id}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forums'] });
      toast({
        title: "Vote recorded",
        description: "Your vote has been saved.",
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
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
        variant: "destructive",
      });
      return;
    }

    if (userVote === voteType) {
      // User is clicking the same vote type, so we don't change anything
      return;
    }

    setUserVote(voteType);
    voteMutation.mutate(voteType);
  };

  const getInitials = (authorId: string) => {
    return authorId.slice(0, 2).toUpperCase();
  };

  const getUrgencyColor = () => {
    if (post.upvotes > 100) return "border-l-4 border-action-red bg-red-50";
    if (post.upvotes > 50) return "border-l-4 border-civic-blue bg-blue-50";
    return "border-l-4 border-community-green bg-green-50";
  };

  const getUrgencyBadge = () => {
    if (post.upvotes > 100) return { label: "URGENT", color: "bg-action-red" };
    if (post.upvotes > 50) return { label: "HOT", color: "bg-orange-500" };
    return null;
  };

  const urgencyBadge = getUrgencyBadge();

  if (compact) {
    return (
      <div className={`${getUrgencyColor()} p-4 rounded-r-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-civic-gray-900 mb-1">{post.title}</h3>
            <p className="text-sm text-civic-gray-600 mb-2 line-clamp-2">
              {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
            </p>
            <div className="flex items-center space-x-4 text-xs text-civic-gray-500">
              <span className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                replies
              </span>
              <span className="flex items-center">
                <ChevronUp className="h-3 w-3 mr-1" />
                {post.upvotes} upvotes
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          {urgencyBadge && (
            <Badge className={`${urgencyBadge.color} text-white text-xs`}>
              {urgencyBadge.label}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Vote Controls */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${userVote === 'upvote' ? 'text-community-green' : 'text-civic-gray-400'}`}
              onClick={() => handleVote('upvote')}
              disabled={voteMutation.isPending}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-civic-gray-900">
              {post.upvotes - post.downvotes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${userVote === 'downvote' ? 'text-action-red' : 'text-civic-gray-400'}`}
              onClick={() => handleVote('downvote')}
              disabled={voteMutation.isPending}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-civic-blue to-purple-500 text-white">
                    {getInitials(post.authorId)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-civic-gray-900">User {post.authorId.slice(-4)}</h3>
                    <Badge variant="secondary" className="bg-civic-blue text-white text-xs">
                      Verified Resident
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-civic-gray-500">
                    <span>in</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm text-civic-blue">
                      General Discussion
                    </Button>
                  </div>
                </div>
              </div>
              {post.isSticky && (
                <Badge className="bg-yellow-500 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>

            <h4 className="font-medium text-civic-gray-900 mb-2">{post.title}</h4>
            <p className="text-sm text-civic-gray-600 mb-3">{post.content}</p>

            <div className="flex items-center space-x-4 text-xs text-civic-gray-500">
              <span className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                replies
              </span>
              <span className="flex items-center">
                <ChevronUp className="h-3 w-3 mr-1" />
                {post.upvotes} upvotes
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-civic-blue">
                Reply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  FileSignature, 
  ExternalLink, 
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PetitionCardProps {
  petition: {
    id: number;
    title: string;
    description: string;
    targetSignatures: number;
    currentSignatures: number;
    creatorId: string;
    category?: string;
    externalUrl?: string;
    status: string;
    deadline?: string;
    createdAt: string;
  };
  compact?: boolean;
}

export default function PetitionCard({ petition, compact = false }: PetitionCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSigned, setIsSigned] = useState(false);

  const signMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/petitions/${petition.id}/sign`, {});
    },
    onSuccess: () => {
      setIsSigned(true);
      queryClient.invalidateQueries({ queryKey: ['/api/petitions'] });
      toast({
        title: "Petition signed",
        description: "Thank you for your support!",
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
        description: "Failed to sign petition. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSign = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to sign petitions.",
        variant: "destructive",
      });
      return;
    }

    if (petition.externalUrl) {
      window.open(petition.externalUrl, '_blank');
      return;
    }

    signMutation.mutate();
  };

  const getProgressPercentage = () => {
    return Math.min((petition.currentSignatures / petition.targetSignatures) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return 'bg-community-green';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-civic-blue';
  };

  const getStatusBadge = () => {
    switch (petition.status) {
      case 'successful':
        return { label: 'SUCCESS', color: 'bg-community-green' };
      case 'closed':
        return { label: 'CLOSED', color: 'bg-civic-gray-500' };
      case 'active':
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();
  const daysLeft = petition.deadline 
    ? Math.max(0, Math.ceil((new Date(petition.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (compact) {
    return (
      <div className="border border-civic-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-civic-gray-900 text-sm line-clamp-2">{petition.title}</h3>
          {statusBadge && (
            <Badge className={`${statusBadge.color} text-white text-xs ml-2`}>
              {statusBadge.label}
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-civic-gray-600 mb-3 line-clamp-2">{petition.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-community-green">
                {petition.currentSignatures.toLocaleString()}
              </span>
              <span className="text-civic-gray-500">
                of {petition.targetSignatures.toLocaleString()} signatures
              </span>
            </div>
            {daysLeft !== null && (
              <span className="text-civic-gray-500">
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
              </span>
            )}
          </div>
          
          <Progress 
            value={getProgressPercentage()} 
            className="h-1"
          />
          
          <Button
            onClick={handleSign}
            disabled={signMutation.isPending || isSigned || petition.status !== 'active'}
            className="w-full bg-community-green hover:bg-green-600 text-white text-xs py-1 h-8"
          >
            {petition.externalUrl && (
              <ExternalLink className="h-3 w-3 mr-1" />
            )}
            {isSigned ? 'Signed' : petition.status === 'active' ? 'Sign This Petition' : 'Petition Closed'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-civic-gray-900 text-lg">{petition.title}</h3>
          {statusBadge && (
            <Badge className={`${statusBadge.color} text-white`}>
              {statusBadge.label}
            </Badge>
          )}
        </div>

        <p className="text-sm text-civic-gray-600 mb-4">{petition.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-community-green text-lg">
                {petition.currentSignatures.toLocaleString()}
              </span>
              <span className="text-civic-gray-500">
                of {petition.targetSignatures.toLocaleString()} signatures
              </span>
            </div>
            {daysLeft !== null && (
              <span className="text-civic-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
              </span>
            )}
          </div>

          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
          />

          <div className="flex items-center justify-between text-xs text-civic-gray-500">
            <span className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {getProgressPercentage().toFixed(0)}% complete
            </span>
            <span>
              Created {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
            </span>
          </div>

          {petition.category && (
            <Badge variant="secondary" className="text-xs">
              {petition.category}
            </Badge>
          )}

          <Button
            onClick={handleSign}
            disabled={signMutation.isPending || isSigned || petition.status !== 'active'}
            className={`w-full ${
              petition.status === 'successful' 
                ? 'bg-community-green hover:bg-green-600' 
                : petition.status === 'active'
                ? 'bg-community-green hover:bg-green-600'
                : 'bg-civic-gray-400'
            } text-white`}
          >
            {petition.externalUrl && petition.status === 'active' && (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            {petition.status === 'successful' && (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {isSigned 
              ? 'Thank you for signing!' 
              : petition.status === 'successful'
              ? 'Goal Achieved!'
              : petition.status === 'active' 
              ? 'Sign This Petition' 
              : 'Petition Closed'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

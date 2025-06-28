import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Clock, 
  Eye, 
  Share2,
  MapPin,
  Building
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticleProps {
  article: {
    id: number;
    title: string;
    summary?: string;
    content?: string;
    author?: string;
    source: string;
    url: string;
    imageUrl?: string;
    category?: string;
    location?: string;
    publishedAt: string;
  };
  compact?: boolean;
}

export default function NewsArticle({ article, compact = false }: NewsArticleProps) {
  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'local':
        return 'bg-civic-blue';
      case 'national':
        return 'bg-community-green';
      case 'politics':
        return 'bg-purple-500';
      case 'environment':
        return 'bg-green-600';
      case 'infrastructure':
        return 'bg-orange-500';
      case 'community':
        return 'bg-pink-500';
      default:
        return 'bg-civic-gray-500';
    }
  };

  const handleReadMore = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(article.url);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(article.url);
    }
  };

  if (compact) {
    return (
      <div className="flex space-x-3 py-3 border-b border-civic-gray-100 last:border-0">
        {article.imageUrl && (
          <img 
            src={article.imageUrl}
            alt={article.title}
            className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-civic-gray-900 text-sm mb-1 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-civic-gray-600 mb-2 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-civic-gray-500">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleReadMore}
              className="h-auto p-0 text-xs text-civic-blue"
            >
              Read
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {article.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img 
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 mb-2">
              {article.category && (
                <Badge className={`${getCategoryColor(article.category)} text-white text-xs`}>
                  {article.category.toUpperCase()}
                </Badge>
              )}
              {article.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {article.location}
                </Badge>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-civic-gray-900 text-lg mb-3 leading-tight">
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-sm text-civic-gray-600 mb-4 line-clamp-3">
              {article.summary}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-civic-gray-500">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{article.source}</span>
              </div>
              {article.author && (
                <div className="flex items-center space-x-1">
                  <span>by {article.author}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="h-8"
              >
                <Share2 className="h-3 w-3" />
              </Button>
              <Button 
                onClick={handleReadMore}
                size="sm"
                className="bg-civic-blue hover:bg-blue-600 text-white h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Read More
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

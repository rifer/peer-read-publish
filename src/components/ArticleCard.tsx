import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye } from "lucide-react";

interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  subject: string;
  publishedDate: string;
  status: 'under-review' | 'published' | 'submitted';
  reviewCount: number;
  views: number;
}

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

const ArticleCard = ({ article, onClick }: ArticleCardProps) => {
  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-accent text-accent-foreground';
      case 'under-review': return 'bg-yellow-500 text-white';
      case 'submitted': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'Published';
      case 'under-review': return 'Under Review';
      case 'submitted': return 'Submitted';
      default: return 'Unknown';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-academic transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge className={getStatusColor(article.status)}>
            {getStatusText(article.status)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {article.subject}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold leading-tight text-foreground hover:text-primary transition-colors">
          {article.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{article.authors.join(", ")}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {article.abstract}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{article.publishedDate}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article.views}</span>
            </div>
            {article.status === 'published' && (
              <span>{article.reviewCount} reviews</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
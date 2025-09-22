import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Calendar } from "lucide-react";
import { CitationsList } from "@/components/CitationsList";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  recommendation: 'accept' | 'reject' | 'minor-revisions' | 'major-revisions';
  content: string;
  date: string;
  helpful: number;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [citations, setCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitations = async () => {
      if (!review.id) return;
      
      try {
        const { data, error } = await supabase
          .from('review_citations')
          .select('*')
          .eq('review_id', review.id)
          .order('start_offset', { ascending: true });

        if (!error && data) {
          setCitations(data);
        }
      } catch (error) {
        console.error('Error fetching citations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitations();
  }, [review.id]);
  const getRecommendationColor = (recommendation: Review['recommendation']) => {
    switch (recommendation) {
      case 'accept': return 'bg-accent text-accent-foreground';
      case 'reject': return 'bg-destructive text-destructive-foreground';
      case 'minor-revisions': return 'bg-yellow-500 text-white';
      case 'major-revisions': return 'bg-orange-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRecommendationText = (recommendation: Review['recommendation']) => {
    switch (recommendation) {
      case 'accept': return 'Accept';
      case 'reject': return 'Reject';
      case 'minor-revisions': return 'Minor Revisions';
      case 'major-revisions': return 'Major Revisions';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-foreground">{review.reviewer}</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
          <Badge className={getRecommendationColor(review.recommendation)}>
            {getRecommendationText(review.recommendation)}
          </Badge>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{review.date}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-foreground mb-4 leading-relaxed">
          {review.content}
        </p>
        
        {!loading && citations.length > 0 && (
          <div className="mb-4">
            <CitationsList
              citations={citations}
              canEdit={false}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{review.helpful} found this helpful</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
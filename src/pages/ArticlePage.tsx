import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Calendar, User, MessageSquare } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data removal - now using real data from database

const ArticlePage = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const canReview = user && hasRole('reviewer');

  // Fetch article and reviews
  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;
      
      try {
        // Fetch article
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (articleError) {
          console.error('Error fetching article:', articleError);
          toast({
            title: "Error",
            description: "Failed to load article",
            variant: "destructive",
          });
          return;
        }

        setArticle(articleData);

        // Fetch reviews with reviewer profile data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(full_name)
          `)
          .eq('article_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          setReviews(reviewsData || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id, toast]);

  const handleSubmitReview = async () => {
    if (!user || !article || !newReview.trim() || rating === 0) {
      toast({
        title: "Error",
        description: "Please provide both a rating and review content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          article_id: article.id,
          reviewer_id: user.id,
          rating,
          content: newReview.trim(),
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to submit review",
          variant: "destructive",
        });
        return;
      }

      // Reset form
      setNewReview("");
      setRating(0);
      
      // Refresh reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('article_id', id)
        .order('created_at', { ascending: false });
      
      setReviews(reviewsData || []);

      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">Article not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-accent text-accent-foreground">
              {article.status.charAt(0).toUpperCase() + article.status.slice(1).replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{article.subject}</Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{Array.isArray(article.authors) ? article.authors.join(", ") : "Unknown Authors"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{article.published_date}</span>
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Abstract</h3>
            <p className="text-foreground leading-relaxed">{article.abstract}</p>
          </div>
        </div>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              {article.content.split('\n').map((paragraph, index) => {
                if (paragraph.trim().startsWith('##')) {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                      {paragraph.replace('##', '').trim()}
                    </h2>
                  );
                }
                if (paragraph.trim().startsWith('-')) {
                  return (
                    <li key={index} className="text-foreground ml-4">
                      {paragraph.replace('-', '').trim()}
                    </li>
                  );
                }
                return paragraph.trim() ? (
                  <p key={index} className="text-foreground mb-4 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Peer Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Peer Reviews ({reviews.length})</h2>
          </div>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No reviews yet. Be the first to review this article!
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={{
                  ...review,
                  reviewer: review.reviewer?.full_name || 'Anonymous Reviewer',
                  date: new Date(review.created_at).toLocaleDateString(),
                  helpful: 0 // This would need to be implemented separately
                }} 
              />
            ))
          )}
        </div>

        {/* Submit Review Section - Only for reviewers */}
        {canReview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Submit Your Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Review Content
                  </label>
                  <Textarea
                    placeholder="Share your thoughts on this article's methodology, results, and contribution to the field..."
                    className="min-h-[120px]"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !newReview.trim() || rating === 0}
                  className="bg-gradient-primary hover:bg-primary-hover"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
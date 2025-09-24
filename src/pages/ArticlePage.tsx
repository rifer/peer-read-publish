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
import { useTextSelection } from "@/hooks/useTextSelection";
import { TextSelectionTooltip } from "@/components/TextSelectionTooltip";
import { CitationsList } from "@/components/CitationsList";
import { HighlightedText } from "@/components/HighlightedText";

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
  const [citations, setCitations] = useState<any[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [highlightedCitationId, setHighlightedCitationId] = useState<string>();
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  
  const canReview = user && hasRole('reviewer');

  const { containerRef, currentSelection, clearSelection } = useTextSelection({
    enableSelection: canReview,
    onSelectionMade: (selection) => {
      if (canReview) {
        setShowTooltip(true);
      }
    },
  });

  const handleAddCitation = async (note: string) => {
    if (!currentSelection || !user) return;

    const newCitation = {
      selected_text: currentSelection.text,
      start_offset: currentSelection.startOffset,
      end_offset: currentSelection.endOffset,
      context_before: currentSelection.contextBefore,
      context_after: currentSelection.contextAfter,
      note,
    };

    console.log('Adding citation locally:', newCitation);
    setCitations(prev => [...prev, { ...newCitation, id: Date.now().toString() }]);
    setShowTooltip(false);
    clearSelection();

    toast({
      title: "Citation added",
      description: "Your citation has been added to your review.",
    });
  };

  const handleDeleteCitation = (citationId: string) => {
    setCitations(prev => prev.filter(c => c.id !== citationId));
    toast({
      title: "Citation removed",
      description: "Citation has been removed from your review.",
    });
  };

  const handleHighlightCitation = (citation: any) => {
    setHighlightedCitationId(citation.id);
    setTimeout(() => setHighlightedCitationId(undefined), 3000);
  };
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

        // Fetch reviews first
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('article_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          console.log('Fetched reviews:', reviewsData);
          
          // Fetch reviewer profiles
          const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
          if (reviewerIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', reviewerIds);
              
            // Combine reviews with profile data
            const reviewsWithProfiles = reviewsData?.map(review => ({
              ...review,
              profiles: profilesData?.find(p => p.id === review.reviewer_id)
            })) || [];
            
            setReviews(reviewsWithProfiles);
          } else {
            setReviews(reviewsData || []);
          }
        }

        // Check if current user has already reviewed this article
        if (user) {
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('*')
            .eq('article_id', id)
            .eq('reviewer_id', user.id)
            .maybeSingle();
          
          if (existingReview) {
            console.log('Found existing review:', existingReview);
            setExistingReviewId(existingReview.id);
            setNewReview(existingReview.content);
            setRating(existingReview.rating);
            
            // Fetch existing citations for this review
            const { data: existingCitations } = await supabase
              .from('review_citations')
              .select('*')
              .eq('review_id', existingReview.id);
            
            if (existingCitations) {
              console.log('Found existing citations:', existingCitations);
              setCitations(existingCitations);
            }
          }
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
  }, [id, toast, user]);

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
      let reviewData;
      
      if (existingReviewId) {
        // Update existing review
        const { data, error: reviewError } = await supabase
          .from('reviews')
          .update({
            rating,
            content: newReview.trim(),
          })
          .eq('id', existingReviewId)
          .select()
          .single();

        if (reviewError) {
          console.error('Error updating review:', reviewError);
          toast({
            title: "Error",
            description: reviewError.message || "Failed to update review",
            variant: "destructive",
          });
          return;
        }
        reviewData = data;
        
        // Delete existing citations for this review
        const { error: deleteError } = await supabase
          .from('review_citations')
          .delete()
          .eq('review_id', existingReviewId);
          
        if (deleteError) {
          console.error('Error deleting existing citations:', deleteError);
        }
      } else {
        // Insert new review
        const { data, error: reviewError } = await supabase
          .from('reviews')
          .insert({
            article_id: article.id,
            reviewer_id: user.id,
            rating,
            content: newReview.trim(),
          })
          .select()
          .single();

        if (reviewError) {
          console.error('Error submitting review:', reviewError);
          toast({
            title: "Error",
            description: reviewError.message || "Failed to submit review",
            variant: "destructive",
          });
          return;
        }
        reviewData = data;
        setExistingReviewId(reviewData.id);
      }

      // Insert citations if any
      if (citations.length > 0) {
        console.log('Inserting citations:', citations.length, 'for review:', reviewData.id);
        console.log('Current user ID:', user.id);
        console.log('Citations to insert:', citations);
        
        const citationsToInsert = citations.map(citation => ({
          review_id: reviewData.id,
          selected_text: citation.selected_text,
          start_offset: citation.start_offset,
          end_offset: citation.end_offset,
          context_before: citation.context_before,
          context_after: citation.context_after,
          note: citation.note,
        }));

        console.log('Final citations payload:', citationsToInsert);
        const { data: citationData, error: citationsError } = await supabase
          .from('review_citations')
          .insert(citationsToInsert)
          .select();

        if (citationsError) {
          console.error('Error submitting citations:', citationsError);
          console.error('Full error details:', JSON.stringify(citationsError, null, 2));
          toast({
            title: "Review submitted",
            description: `Review submitted successfully, but there was an issue with citations: ${citationsError.message}`,
            variant: "destructive",
          });
        } else {
          console.log('Citations inserted successfully:', citationData);
          // Clear local citations after successful insert
          setCitations([]);
        }
      } else {
        console.log('No citations to insert');
      }
      
      // Refresh reviews to show the updated data
      const { data: refreshedReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('article_id', id)
        .order('created_at', { ascending: false });
        
      if (refreshedReviews && refreshedReviews.length > 0) {
        // Fetch reviewer profiles
        const reviewerIds = refreshedReviews.map(r => r.reviewer_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', reviewerIds);
          
        // Combine reviews with profile data
        const reviewsWithProfiles = refreshedReviews.map(review => ({
          ...review,
          profiles: profilesData?.find(p => p.id === review.reviewer_id)
        }));
        
        console.log('Refreshed reviews after submission:', reviewsWithProfiles);
        setReviews(reviewsWithProfiles);
      } else {
        setReviews(refreshedReviews || []);
      }

      toast({
        title: "Success",
        description: existingReviewId ? "Review updated successfully!" : "Review submitted successfully!",
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
            <div ref={containerRef}>
              <HighlightedText
                content={article.content}
                citations={[]} // Will show all citations from all reviews
                highlightedCitationId={highlightedCitationId}
                onCitationClick={handleHighlightCitation}
              />
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
                {canReview 
                  ? "No reviews yet. Be the first to review this article!"
                  : "No reviews available for this article yet."
                }
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                 review={{
                   ...review,
                   reviewer: review.profiles?.full_name || 'Anonymous Reviewer',
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

                {citations.length > 0 && (
                  <div>
                    <CitationsList
                      citations={citations}
                      onDeleteCitation={handleDeleteCitation}
                      onHighlightCitation={handleHighlightCitation}
                      canEdit={true}
                    />
                  </div>
                )}
                
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

                {canReview && (
                  <div className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                    💡 Tip: Select text in the article above to add specific citations to your review.
                    {existingReviewId && (
                      <>
                        <br />
                        ✏️ You are editing your existing review.
                      </>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !newReview.trim() || rating === 0}
                  className="bg-gradient-primary hover:bg-primary-hover"
                >
                  {isSubmitting 
                    ? (existingReviewId ? 'Updating...' : 'Submitting...') 
                    : (existingReviewId ? 'Update Review' : 'Submit Review')
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Selection Tooltip */}
        {showTooltip && currentSelection && (
          <TextSelectionTooltip
            selection={currentSelection}
            onAddCitation={handleAddCitation}
            onCancel={() => {
              setShowTooltip(false);
              clearSelection();
            }}
            isVisible={showTooltip}
          />
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
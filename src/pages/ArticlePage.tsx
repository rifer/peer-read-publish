import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Calendar, User, MessageSquare } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// Mock data - in real app this would come from API
const mockArticle = {
  id: "1",
  title: "Novel Approaches to Quantum Computing Error Correction",
  authors: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Alex Rodriguez"],
  abstract: "This paper presents innovative methods for quantum error correction using topological quantum codes. Our approach demonstrates a 40% improvement in error correction efficiency compared to traditional surface codes.",
  subject: "Quantum Physics",
  publishedDate: "2024-01-15",
  status: 'published' as const,
  reviewCount: 3,
  views: 1250,
  content: `
    ## Introduction
    
    Quantum computing represents one of the most promising frontiers in computational science. However, quantum systems are inherently fragile and susceptible to various forms of noise and decoherence. This paper addresses the critical challenge of quantum error correction through novel topological approaches.
    
    ## Methodology
    
    Our research employs a combination of theoretical analysis and experimental validation using superconducting quantum processors. We developed a new class of topological quantum codes that leverage the geometric properties of quantum states to provide enhanced error correction capabilities.
    
    ## Results
    
    The experimental results demonstrate significant improvements in error correction efficiency:
    - 40% reduction in logical error rates
    - 25% improvement in coherence times
    - Scalable architecture supporting up to 100 qubits
    
    ## Conclusion
    
    Our findings suggest that topological quantum error correction could be a key enabler for practical quantum computing applications. Future work will focus on scaling these methods to larger quantum systems.
  `
};

const mockReviews = [
  {
    id: "1",
    reviewer: "Dr. Emily Watson",
    rating: 5,
    recommendation: 'accept' as const,
    content: "This is an excellent contribution to the field of quantum error correction. The theoretical framework is sound, and the experimental validation is comprehensive. The 40% improvement in error correction efficiency is particularly impressive and could have significant implications for practical quantum computing.",
    date: "2024-01-10",
    helpful: 12
  },
  {
    id: "2",
    reviewer: "Prof. David Kim",
    rating: 4,
    recommendation: 'minor-revisions' as const,
    content: "The paper presents solid work with good experimental results. However, I suggest the authors provide more detailed analysis of the scalability limitations and compare their approach with recent developments in surface code implementations. The methodology section could benefit from additional clarity regarding the experimental setup.",
    date: "2024-01-08",
    helpful: 8
  },
  {
    id: "3",
    reviewer: "Dr. Maria Gonzalez",
    rating: 5,
    recommendation: 'accept' as const,
    content: "Outstanding research that advances our understanding of topological quantum error correction. The paper is well-written, the experiments are convincing, and the results are significant. This work will likely become a reference in the field.",
    date: "2024-01-12",
    helpful: 15
  }
];

const ArticlePage = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  
  const canReview = user && hasRole('reviewer');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-accent text-accent-foreground">Published</Badge>
            <Badge variant="outline">{mockArticle.subject}</Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            {mockArticle.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{mockArticle.authors.join(", ")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{mockArticle.publishedDate}</span>
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Abstract</h3>
            <p className="text-foreground leading-relaxed">{mockArticle.abstract}</p>
          </div>
        </div>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              {mockArticle.content.split('\n').map((paragraph, index) => {
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
            <h2 className="text-2xl font-bold text-foreground">Peer Reviews ({mockReviews.length})</h2>
          </div>
          
          {mockReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
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
                
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                  Submit Review
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
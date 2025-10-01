import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface HomeArticle {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  subject: string;
  publishedDate: string;
  status: 'under-review' | 'published' | 'submitted' | 'draft';
  reviewCount: number;
  views: number;
}

interface Stats {
  publishedArticles: number;
  totalReviews: number;
  totalUsers: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [selectedTab, setSelectedTab] = useState("all");
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [stats, setStats] = useState<Stats>({ publishedArticles: 0, totalReviews: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [articlesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArticles = articles.filter(article => {
    if (selectedTab === "all") return true;
    return article.status === selectedTab;
  });

  const paginatedArticles = filteredArticles.slice(0, currentPage * articlesPerPage);
  const hasMoreArticles = filteredArticles.length > paginatedArticles.length;

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const loadMoreArticles = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleSubmitClick = () => {
    if (!user) {
      navigate('/auth');
      toast.info("Please sign in to submit research");
    } else if (hasRole('writer') || hasRole('admin')) {
      navigate('/submit');
    } else if (hasRole('reviewer')) {
      toast.info("You need writer access to submit articles. Please contact an admin.");
    } else {
      toast.error("You don't have permission to submit articles");
    }
  };

  const handleReviewerClick = () => {
    navigate('/apply-reviewer');
  };

  useEffect(() => {
    const fetchArticlesAndStats = async () => {
      try {
        // Fetch articles with review counts
        const { data: articlesData } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            authors,
            abstract,
            subject,
            published_date,
            status,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (articlesData) {
          // Get review counts for each article
          const articlesWithCounts = await Promise.all(
            articlesData.map(async (article) => {
              const { count: reviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('article_id', article.id);

              return {
                id: article.id,
                title: article.title,
                authors: article.authors as string[],
                abstract: article.abstract,
                subject: article.subject,
                publishedDate: article.published_date ? new Date(article.published_date).toLocaleDateString() : new Date(article.created_at).toLocaleDateString(),
                status: article.status as HomeArticle['status'],
                reviewCount: reviewCount || 0,
                views: Math.floor(Math.random() * 2000) + 100 // Mock views for now
              };
            })
          );

          setArticles(articlesWithCounts);
        }

        // Fetch statistics using direct queries
        const [articlesCount, reviewsCount, usersCount] = await Promise.all([
          supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('reviews').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          publishedArticles: articlesCount.count || 0,
          totalReviews: reviewsCount.count || 0,
          totalUsers: usersCount.count || 0
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticlesAndStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Scientific Excellence Through Peer Review
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Discover groundbreaking research, contribute to scientific discourse, and advance knowledge through collaborative peer review
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={handleSubmitClick}>
              Submit Your Research
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-academic" onClick={handleReviewerClick}>
              Become a Reviewer
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Latest Research</h2>
          <p className="text-muted-foreground">Explore cutting-edge scientific publications and their peer reviews</p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="under-review">Under Review</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    status: article.status as 'under-review' | 'published' | 'submitted'
                  }}
                  onClick={() => handleArticleClick(article.id)}
                />
              ))}
            </div>
            
            {hasMoreArticles && (
              <div className="text-center mt-8">
                <Button onClick={loadMoreArticles} variant="outline" size="lg">
                  Load More Articles
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
          </div>
        )}

        {/* Stats Section */}
        <section className="mt-16 py-12 bg-secondary rounded-lg">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-primary mb-2">{stats.publishedArticles}+</h3>
                )}
                <p className="text-muted-foreground">Published Articles</p>
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-primary mb-2">{stats.totalReviews}+</h3>
                )}
                <p className="text-muted-foreground">Peer Reviews</p>
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-primary mb-2">{stats.totalUsers}+</h3>
                )}
                <p className="text-muted-foreground">Active Researchers</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

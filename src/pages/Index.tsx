import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for articles
const mockArticles = [
  {
    id: "1",
    title: "Novel Approaches to Quantum Computing Error Correction",
    authors: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Alex Rodriguez"],
    abstract: "This paper presents innovative methods for quantum error correction using topological quantum codes. Our approach demonstrates a 40% improvement in error correction efficiency compared to traditional surface codes.",
    subject: "Quantum Physics",
    publishedDate: "2024-01-15",
    status: 'published' as const,
    reviewCount: 3,
    views: 1250
  },
  {
    id: "2",
    title: "Machine Learning Applications in Drug Discovery: A Comprehensive Review",
    authors: ["Dr. Lisa Park", "Prof. James Wilson"],
    abstract: "We present a systematic review of machine learning techniques applied to drug discovery, analyzing over 200 recent studies and identifying key trends and future opportunities in computational pharmaceutical research.",
    subject: "Bioinformatics",
    publishedDate: "2024-01-12",
    status: 'under-review' as const,
    reviewCount: 2,
    views: 890
  },
  {
    id: "3",
    title: "Climate Change Impact on Arctic Ice Dynamics: A 20-Year Analysis",
    authors: ["Dr. Emma Thompson", "Prof. Robert Arctic", "Dr. Yuki Tanaka"],
    abstract: "Our comprehensive analysis of Arctic ice data over two decades reveals accelerating ice loss patterns and their implications for global sea level rise. We present new predictive models based on satellite imagery and ground observations.",
    subject: "Climate Science",
    publishedDate: "2024-01-10",
    status: 'published' as const,
    reviewCount: 5,
    views: 2100
  },
  {
    id: "4",
    title: "CRISPR-Cas9 Optimization for Therapeutic Gene Editing",
    authors: ["Dr. Maria Santos", "Prof. David Chang"],
    abstract: "We describe novel modifications to the CRISPR-Cas9 system that improve targeting accuracy by 85% while reducing off-target effects. These improvements have significant implications for therapeutic gene editing applications.",
    subject: "Genetics",
    publishedDate: "2024-01-08",
    status: 'submitted' as const,
    reviewCount: 0,
    views: 450
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredArticles = mockArticles.filter(article => {
    if (selectedTab === "all") return true;
    return article.status === selectedTab;
  });

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

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
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Submit Your Research
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-academic">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => handleArticleClick(article.id)}
            />
          ))}
        </div>

        {/* Stats Section */}
        <section className="mt-16 py-12 bg-secondary rounded-lg">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">1,250+</h3>
                <p className="text-muted-foreground">Published Articles</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">5,000+</h3>
                <p className="text-muted-foreground">Peer Reviews</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">800+</h3>
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

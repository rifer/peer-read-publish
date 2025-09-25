import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  abstract: z.string().min(50, "Abstract must be at least 50 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  published_date: z.string().optional()
});

type ArticleForm = z.infer<typeof articleSchema>;

interface Reviewer {
  id: string;
  email: string;
  full_name: string;
}

const SubmitArticle = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [authors, setAuthors] = useState<string[]>([""]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      subject: "",
      abstract: "",
      content: "",
      published_date: ""
    }
  });

  // Redirect if not authorized
  useEffect(() => {
    if (user && !hasRole('writer') && !hasRole('admin')) {
      navigate('/');
      toast.error("You don't have permission to submit articles");
    }
  }, [user, hasRole, navigate]);

  // Fetch reviewers
  useEffect(() => {
    const fetchReviewers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', 
          (await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'reviewer')
          ).data?.map(r => r.user_id) || []
        );
      
      if (!error && data) {
        setReviewers(data);
      }
    };
    
    fetchReviewers();
  }, []);

  const addAuthor = () => {
    setAuthors([...authors, ""]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = value;
    setAuthors(newAuthors);
  };

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev =>
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const onSubmit = async (data: ArticleForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const filteredAuthors = authors.filter(author => author.trim());
      
      const { data: article, error } = await supabase
        .from('articles')
        .insert({
          title: data.title,
          subject: data.subject,
          abstract: data.abstract,
          content: data.content,
          authors: filteredAuthors,
          submitter_id: user.id,
          published_date: data.published_date || null,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Article submitted successfully!");
      navigate('/');
      
    } catch (error) {
      console.error('Error submitting article:', error);
      toast.error("Failed to submit article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (!hasRole('writer') && !hasRole('admin'))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit New Article</CardTitle>
            <CardDescription>
              Submit your research article for peer review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Article Title*</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter article title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Area*</Label>
                <Input
                  id="subject"
                  {...form.register("subject")}
                  placeholder="e.g., Computer Science, Biology, Physics"
                />
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                )}
              </div>

              {/* Authors */}
              <div className="space-y-2">
                <Label>Authors*</Label>
                {authors.map((author, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={author}
                      onChange={(e) => updateAuthor(index, e.target.value)}
                      placeholder={`Author ${index + 1} name`}
                    />
                    {authors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAuthor(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addAuthor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </div>

              {/* Published Date */}
              <div className="space-y-2">
                <Label htmlFor="published_date">Published Date (optional)</Label>
                <Input
                  id="published_date"
                  type="date"
                  {...form.register("published_date")}
                />
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract*</Label>
                <Textarea
                  id="abstract"
                  {...form.register("abstract")}
                  placeholder="Enter article abstract (minimum 50 characters)"
                  className="min-h-[120px]"
                />
                {form.formState.errors.abstract && (
                  <p className="text-sm text-destructive">{form.formState.errors.abstract.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Article Content*</Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder="Enter full article content (minimum 100 characters)"
                  className="min-h-[300px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                )}
              </div>

              {/* Assign Reviewers */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assign Reviewers (optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={reviewer.id}
                        checked={selectedReviewers.includes(reviewer.id)}
                        onCheckedChange={() => handleReviewerToggle(reviewer.id)}
                      />
                      <Label htmlFor={reviewer.id} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">{reviewer.full_name}</p>
                          <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedReviewers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedReviewers.map(id => {
                      const reviewer = reviewers.find(r => r.id === id);
                      return reviewer ? (
                        <Badge key={id} variant="secondary">
                          {reviewer.full_name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitArticle;
import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Mail, User } from "lucide-react";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  institution: z.string().min(2, "Institution name is required"),
  position: z.string().min(2, "Position/Title is required"),
  fieldOfExpertise: z.string().min(5, "Field of expertise is required"),
  qualifications: z.string().min(50, "Please provide detailed qualifications (minimum 50 characters)"),
  publications: z.string().min(20, "Please list your publications or provide relevant links"),
  motivation: z.string().min(100, "Please explain your motivation (minimum 100 characters)")
});

type ApplicationForm = z.infer<typeof applicationSchema>;

const ReviewerApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: user?.email || "",
      institution: "",
      position: "",
      fieldOfExpertise: "",
      qualifications: "",
      publications: "",
      motivation: ""
    }
  });

  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the application to your backend
      // For now, we'll just show a success message
      console.log("Reviewer application submitted:", data);
      
      toast.success("Application submitted successfully! We'll review your credentials and get back to you soon.");
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Become a Reviewer</CardTitle>
            </div>
            <CardDescription>
              {user 
                ? "Join our community of peer reviewers and contribute to scientific excellence"
                : "Please sign in to apply as a reviewer"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  You need to be signed in to apply as a reviewer.
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name*</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Dr. Jane Smith"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="jane.smith@university.edu"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution*</Label>
                    <Input
                      id="institution"
                      {...form.register("institution")}
                      placeholder="University of Example"
                    />
                    {form.formState.errors.institution && (
                      <p className="text-sm text-destructive">{form.formState.errors.institution.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Title*</Label>
                    <Input
                      id="position"
                      {...form.register("position")}
                      placeholder="Associate Professor, Research Scientist, etc."
                    />
                    {form.formState.errors.position && (
                      <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldOfExpertise">Field of Expertise*</Label>
                    <Input
                      id="fieldOfExpertise"
                      {...form.register("fieldOfExpertise")}
                      placeholder="e.g., Quantum Physics, Molecular Biology, Computer Science"
                    />
                    {form.formState.errors.fieldOfExpertise && (
                      <p className="text-sm text-destructive">{form.formState.errors.fieldOfExpertise.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Academic Qualifications*</Label>
                    <Textarea
                      id="qualifications"
                      {...form.register("qualifications")}
                      placeholder="Please list your degrees, certifications, and relevant qualifications (minimum 50 characters)"
                      className="min-h-[100px]"
                    />
                    {form.formState.errors.qualifications && (
                      <p className="text-sm text-destructive">{form.formState.errors.qualifications.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publications">Publications & Research*</Label>
                    <Textarea
                      id="publications"
                      {...form.register("publications")}
                      placeholder="Please list key publications, Google Scholar profile, ORCID, or other relevant research links"
                      className="min-h-[100px]"
                    />
                    {form.formState.errors.publications && (
                      <p className="text-sm text-destructive">{form.formState.errors.publications.message}</p>
                    )}
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to become a reviewer?*</Label>
                  <Textarea
                    id="motivation"
                    {...form.register("motivation")}
                    placeholder="Explain your motivation for joining our peer review community (minimum 100 characters)"
                    className="min-h-[120px]"
                  />
                  {form.formState.errors.motivation && (
                    <p className="text-sm text-destructive">{form.formState.errors.motivation.message}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewerApplication;

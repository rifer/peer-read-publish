import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const AuthPage = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to home
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center text-primary-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
            <h1 className="text-3xl font-bold text-primary-foreground">SciReview</h1>
          </div>
          <p className="text-primary-foreground/90 text-lg">
            Welcome to the future of scientific peer review
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-academic">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join our community of researchers, reviewers, and academics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={signInWithGoogle}
              className="w-full h-12 bg-white text-foreground border border-input hover:bg-secondary"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="space-y-4 text-center text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">What you can do:</h4>
                <ul className="space-y-1">
                  <li>• Submit your research for peer review</li>
                  <li>• Review papers in your field of expertise</li>
                  <li>• Access published scientific articles</li>
                  <li>• Collaborate with researchers worldwide</li>
                </ul>
              </div>
              
              <p className="text-xs">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                New users are automatically assigned the "Writer" role and can request additional roles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
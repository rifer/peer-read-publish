import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, User, LogOut, Settings, Shield, PenTool, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, profile, roles, signOut, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('');
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'reviewer':
        return <PenTool className="h-3 w-3" />;
      case 'writer':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-gradient-primary shadow-academic sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <BookOpen className="h-8 w-8 text-primary-foreground" />
              <h1 className="text-2xl font-bold text-primary-foreground">SciReview</h1>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 bg-white/10 border-white/20 text-primary-foreground placeholder:text-white/70"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {(hasRole('writer') || hasRole('admin')) && (
                  <Button variant="ghost" className="text-primary-foreground hover:bg-white/10">
                    Submit Article
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="bg-white text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <div className="flex items-center justify-start gap-2 p-4">
                      <div className="flex flex-col space-y-2 leading-none">
                        <p className="font-medium text-sm">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.email}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs flex items-center gap-1">
                              {getRoleIcon(role.role)}
                              {role.role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="ghost" 
                className="text-primary-foreground hover:bg-white/10"
                onClick={() => navigate('/auth')}
                disabled={loading}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
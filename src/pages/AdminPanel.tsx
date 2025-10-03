import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Users, Eye, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  authors: any;
  subject: string;
  status: 'draft' | 'under_review' | 'published' | 'rejected';
  created_at: string;
  submitter_id: string;
  submitter_name?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: string[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Redirect if not authorized
  useEffect(() => {
    if (user && !hasRole('admin')) {
      navigate('/');
      toast.error("You don't have admin permissions");
    }
  }, [user, hasRole, navigate]);

  // Fetch articles and users
  useEffect(() => {
    if (hasRole('admin')) {
      fetchArticles();
      fetchUsers();
    }
  }, [hasRole]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        authors,
        subject,
        status,
        created_at,
        submitter_id,
        profiles:submitter_id (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const articlesWithSubmitter = data.map(article => ({
        id: article.id,
        title: article.title,
        authors: article.authors,
        subject: article.subject,
        status: article.status as 'draft' | 'under_review' | 'published' | 'rejected',
        created_at: article.created_at,
        submitter_id: article.submitter_id,
        submitter_name: (article.profiles as any)?.full_name || 'Unknown'
      }));
      setArticles(articlesWithSubmitter);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profilesError && profilesData) {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (!rolesError && rolesData) {
        const usersWithRoles = profilesData.map(profile => ({
          ...profile,
          roles: rolesData.filter(role => role.user_id === profile.id).map(role => role.role)
        }));
        setUsers(usersWithRoles);
      }
    }
  };

  const updateArticleStatus = async (articleId: string, newStatus: 'draft' | 'under_review' | 'published' | 'rejected') => {
    setUpdatingStatus(articleId);
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus })
        .eq('id', articleId);

      if (error) throw error;

      setArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, status: newStatus }
            : article
        )
      );

      toast.success("Article status updated successfully");
    } catch (error) {
      console.error('Error updating article status:', error);
      toast.error("Failed to update article status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const addRoleToUser = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as 'admin' | 'reviewer' | 'writer' });

      if (error) throw error;

      await fetchUsers();
      toast.success(`Role ${role} added successfully`);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
    }
  };

  const removeRoleFromUser = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as 'admin' | 'reviewer' | 'writer');

      if (error) throw error;

      await fetchUsers();
      toast.success(`Role ${role} removed successfully`);
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  if (!user || !hasRole('admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manage Articles
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Article Management</CardTitle>
                <CardDescription>
                  Review and update article statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading articles...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author(s)</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <div className="truncate" title={article.title}>
                              {article.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(article.authors) 
                              ? article.authors.join(", ") 
                              : "No authors"}
                          </TableCell>
                          <TableCell>{article.subject}</TableCell>
                          <TableCell>{article.submitter_name}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(article.status)}>
                              {article.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(article.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Select
                              value={article.status}
                              onValueChange={(value) => updateArticleStatus(article.id, value as 'draft' | 'under_review' | 'published' | 'rejected')}
                              disabled={updatingStatus === article.id}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/article/${article.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'No name'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs flex items-center gap-1">
                                  {role}
                                  <button
                                    onClick={() => removeRoleFromUser(user.id, role)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">No roles</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => addRoleToUser(user.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Add role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="writer">Writer</SelectItem>
                              <SelectItem value="reviewer">Reviewer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
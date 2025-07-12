import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAllModules, 
  createModule, 
  updateModule, 
  deleteModule, 
  getAllUsers, 
  updateUserAccess 
} from '@/lib/api';
import { CourseModule, User } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, BookOpen, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const { toast } = useToast();

  // Form state for new/edit module
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    order: 1,
    isPublished: false
  });

  useEffect(() => {
    fetchModules();
    fetchUsers();
  }, []);

  const fetchModules = async () => {
    try {
      const modulesList = await getAllModules();
      const formattedModules = modulesList.map(module => ({
        id: module.id.toString(),
        title: module.title,
        description: module.description,
        videoUrl: module.video_url,
        pdfUrl: module.pdf_url,
        order: module.order_num,
        isPublished: module.is_published
      }));
      setModules(formattedModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersList = await getAllUsers();
      const formattedUsers = usersList.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        hasAccess: user.has_access,
        createdAt: user.created_at
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingModule) {
        // Update existing module
        await updateModule(editingModule.id, moduleForm);
        toast({
          title: "Success",
          description: "Module updated successfully!",
        });
      } else {
        // Create new module
        await createModule(moduleForm);
        toast({
          title: "Success",
          description: "Module created successfully!",
        });
      }

      // Reset form
      setModuleForm({
        title: '',
        description: '',
        videoUrl: '',
        pdfUrl: '',
        order: modules.length + 1,
        isPublished: false
      });
      setEditingModule(null);
      fetchModules();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save module. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      videoUrl: module.videoUrl || '',
      pdfUrl: module.pdfUrl || '',
      order: module.order,
      isPublished: module.isPublished
    });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      await deleteModule(moduleId);
      toast({
        title: "Success",
        description: "Module deleted successfully!",
      });
      fetchModules();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete module.",
      });
    }
  };

  const toggleUserAccess = async (userId: string, currentAccess: boolean) => {
    try {
      await updateUserAccess(userId, !currentAccess);
      toast({
        title: "Success",
        description: `User access ${!currentAccess ? 'granted' : 'revoked'} successfully!`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user access.",
      });
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.hasAccess).length,
    totalModules: modules.length,
    publishedModules: modules.filter(module => module.isPublished).length,
    revenue: users.filter(user => user.hasAccess).length * 99
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-lg">Manage your AI course platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-[#00FFD1]" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-gray-400 text-sm">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-gray-400 text-sm">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.publishedModules}</p>
                  <p className="text-gray-400 text-sm">Published Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">₹{stats.revenue}</p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="modules">Course Modules</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            {/* Add/Edit Module Form */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </CardTitle>
                <CardDescription>
                  {editingModule ? 'Update module details' : 'Create a new course module'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitModule} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Module Title</Label>
                      <Input
                        id="title"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm({...moduleForm, order: parseInt(e.target.value)})}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL (YouTube Embed)</Label>
                      <Input
                        id="videoUrl"
                        value={moduleForm.videoUrl}
                        onChange={(e) => setModuleForm({...moduleForm, videoUrl: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pdfUrl">PDF URL</Label>
                      <Input
                        id="pdfUrl"
                        value={moduleForm.pdfUrl}
                        onChange={(e) => setModuleForm({...moduleForm, pdfUrl: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="https://example.com/notes.pdf"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={moduleForm.isPublished}
                      onCheckedChange={(checked) => setModuleForm({...moduleForm, isPublished: checked})}
                    />
                    <Label htmlFor="isPublished">Publish module</Label>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black"
                    >
                      {loading ? 'Saving...' : (editingModule ? 'Update Module' : 'Create Module')}
                    </Button>
                    
                    {editingModule && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingModule(null);
                          setModuleForm({
                            title: '',
                            description: '',
                            videoUrl: '',
                            pdfUrl: '',
                            order: modules.length + 1,
                            isPublished: false
                          });
                        }}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Modules List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Existing Modules</h3>
              {modules.map((module) => (
                <Card key={module.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold">{module.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            module.isPublished 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {module.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-gray-400">{module.description}</p>
                        <div className="text-sm text-gray-500">
                          Order: {module.order}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditModule(module)}
                          className="border-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage student access and enrollments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{user.email}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Role: {user.role}</span>
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.hasAccess 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.hasAccess ? 'Active' : 'No Access'}
                        </span>
                        
                        {user.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserAccess(user.id, user.hasAccess)}
                            className={`border-gray-600 ${
                              user.hasAccess 
                                ? 'text-red-400 hover:bg-red-600' 
                                : 'text-green-400 hover:bg-green-600'
                            }`}
                          >
                            {user.hasAccess ? 'Revoke Access' : 'Grant Access'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, userRole, hasAccess, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      // Navigation will be handled by useEffect
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after successful login
  useEffect(() => {
    if (currentUser && userRole !== null && !loading) {
      console.log('[LOGIN] User logged in, checking navigation...', {
        userRole,
        hasAccess,
        currentUser: currentUser.uid
      });
      
      if (userRole === 'admin') {
        console.log('[LOGIN] Navigating to admin dashboard');
        navigate('/admin');
      } else if (hasAccess) {
        console.log('[LOGIN] Navigating to student dashboard');
        navigate('/dashboard');
      } else {
        console.log('[LOGIN] Navigating to payment page');
        navigate('/payment');
      }
    }
  }, [currentUser, userRole, hasAccess, loading, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Brain className="h-10 w-10 text-[#00FFD1]" />
            <span className="text-3xl font-bold text-white">AI 99</span>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to access your AI course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#00FFD1] focus:ring-[#00FFD1]"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#00FFD1] focus:ring-[#00FFD1]"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-semibold py-3 rounded-lg transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-[#00FFD1] hover:text-[#00FFD1]/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
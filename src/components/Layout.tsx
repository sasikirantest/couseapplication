import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showHeader && (
        <header className="border-b border-gray-800 bg-gray-900/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Brain className="h-8 w-8 text-[#00FFD1]" />
              <span className="text-2xl font-bold">AI 99</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm text-gray-300">{currentUser.email}</span>
                    {userRole === 'admin' && (
                      <span className="bg-[#00FFD1] text-black px-2 py-1 rounded text-xs font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getPublishedModules, updateUserProgress, getUserById } from '@/lib/api';
import { CourseModule } from '@/types/course';
import { PlayCircle, FileText, CheckCircle, Download, Clock } from 'lucide-react';

export function StudentDashboard() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchModules();
    fetchProgress();
  }, []);

  const fetchModules = async () => {
    try {
      const modulesList = await getPublishedModules();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await getUserById(currentUser.uid);
      if (userData) {
        setProgress(userData.progress || {});
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markAsCompleted = async (moduleId: string) => {
    if (!currentUser) return;
    
    const newProgress = { ...progress, [moduleId]: true };
    setProgress(newProgress);
    
    try {
      await updateUserProgress(currentUser.uid, newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercentage = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">Loading course content...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to AI 99 Course</h1>
          <p className="text-gray-400 text-lg">Continue your AI learning journey</p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Your Progress</span>
              <span className="text-[#00FFD1]">({completedCount}/{modules.length})</span>
            </CardTitle>
            <CardDescription>
              {progressPercentage === 100 ? 
                "Congratulations! You've completed all modules!" : 
                "Keep learning to complete the course"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{Math.round(progressPercentage)}% Complete</span>
              <span>{modules.length - completedCount} modules remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Course Modules</h2>
          
          <div className="grid gap-6">
            {modules.map((module, index) => {
              const isCompleted = progress[module.id];
              
              return (
                <Card 
                  key={module.id} 
                  className={`bg-gray-900 border-gray-800 transition-all duration-300 ${
                    isCompleted ? 'border-[#00FFD1]/50' : 'hover:border-gray-700'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isCompleted ? 'bg-[#00FFD1]/20' : 'bg-gray-800'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-[#00FFD1]" />
                          ) : (
                            <span className="text-gray-400 font-bold">Module {index + 1}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className={`text-xl ${
                            isCompleted ? 'text-[#00FFD1]' : 'text-white'
                          }`}>
                            {module.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Video Section */}
                      {module.videoUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <PlayCircle className="h-4 w-4" />
                            <span>Video Lesson</span>
                          </div>
                          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                            <iframe
                              src={module.videoUrl}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                              title={module.title}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Notes Section */}
                      {module.pdfUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <FileText className="h-4 w-4" />
                            <span>Course Notes</span>
                          </div>
                          <Card className="bg-gray-800 border-gray-700 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">Module {index + 1} Notes</p>
                                <p className="text-sm text-gray-400">PDF Document</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black"
                                onClick={() => window.open(module.pdfUrl, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Estimated time: 2-3 hours</span>
                      </div>
                      
                      {!isCompleted && (
                        <Button
                          onClick={() => markAsCompleted(module.id)}
                          className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black"
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Completion Certificate */}
        {progressPercentage === 100 && (
          <Card className="bg-gradient-to-r from-[#00FFD1]/10 to-[#00FFD1]/5 border-[#00FFD1]/30">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold text-[#00FFD1] mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-gray-300 mb-4">
                You've completed the AI 99 Course. Download your certificate below.
              </p>
              <Button className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black">
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
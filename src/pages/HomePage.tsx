import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { Brain, PlayCircle, FileText, Star, Users, Trophy } from 'lucide-react';

const courseModules = [
  {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    description: "Understand the fundamentals of AI, its history, and real-world applications.",
    duration: "2 hours"
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    description: "Learn the core concepts of ML algorithms and supervised learning.",
    duration: "3 hours"
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Dive into neural networks, backpropagation, and deep learning frameworks.",
    duration: "4 hours"
  },
  {
    id: 4,
    title: "Natural Language Processing",
    description: "Explore text processing, sentiment analysis, and language models.",
    duration: "3 hours"
  },
  {
    id: 5,
    title: "Computer Vision",
    description: "Learn image processing, object detection, and facial recognition.",
    duration: "3 hours"
  },
  {
    id: 6,
    title: "AI Ethics & Future",
    description: "Understand responsible AI development and future career opportunities.",
    duration: "2 hours"
  }
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "CS Student",
    content: "This course made AI concepts so easy to understand. Best ₹99 I've ever spent!",
    rating: 5
  },
  {
    name: "Rahul Kumar",
    role: "Working Professional",
    content: "Perfect for beginners. The practical examples really helped me grasp complex topics.",
    rating: 5
  },
  {
    name: "Anita Patel",
    role: "Engineering Graduate",
    content: "Comprehensive content at an unbeatable price. Highly recommended!",
    rating: 5
  }
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Master AI for just
            </h1>
            <div className="text-6xl md:text-8xl font-bold text-[#00FFD1] flex items-center justify-center space-x-2">
              <span>₹</span>
              <span>99</span>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Learn Artificial Intelligence from scratch with our comprehensive course designed for students and beginners. 
            Get lifetime access to 17+ hours of premium content.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-[#00FFD1]/20 transition-all duration-300"
              onClick={() => navigate('/payment')}
            >
              Enroll Now - ₹99
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>500+ Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-4 w-4" />
              <span>17+ Hours</span>
            </div>
          </div>
        </section>

        {/* Course Modules */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Course Modules</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive curriculum designed to take you from beginner to AI-ready professional
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseModules.map((module, index) => (
              <Card key={module.id} className="bg-gray-900 border-gray-800 hover:border-[#00FFD1]/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-[#00FFD1]/10 p-2 rounded-lg">
                      <span className="text-[#00FFD1] font-bold">Module {index + 1}</span>
                    </div>
                    <span className="text-xs text-gray-500">{module.duration}</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-[#00FFD1] transition-colors">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {module.description}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <PlayCircle className="h-4 w-4" />
                      <span>Video</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>Notes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">What Students Say</h2>
            <p className="text-gray-400">Join hundreds of satisfied learners</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#00FFD1] text-[#00FFD1]" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="text-3xl font-bold">Ready to Start Your AI Journey?</h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Join our community of AI learners and get instant access to all course materials.
          </p>
          <Button 
            size="lg"
            className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-semibold text-lg px-12 py-6 rounded-lg shadow-lg hover:shadow-[#00FFD1]/20 transition-all duration-300"
            onClick={() => navigate('/payment')}
          >
            Start Learning Now - ₹99
          </Button>
        </section>
      </div>
    </Layout>
  );
}
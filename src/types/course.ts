export interface CourseModule {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  isPublished: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  hasAccess: boolean;
  createdAt: string;
  progress?: { [moduleId: string]: boolean };
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  razorpayPaymentId?: string;
  createdAt: string;
}
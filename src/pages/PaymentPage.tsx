import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserAccess, createPayment, updatePaymentStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Shield, Zap } from 'lucide-react';

export function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const { currentUser, hasAccess, refreshUserData, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user already has access, redirect to dashboard
  React.useEffect(() => {
    if (hasAccess && currentUser) {
      console.log('[PAYMENT] User has access, redirecting to dashboard');
      navigate('/dashboard');
    } else if (currentUser && userRole === 'student') {
      // For demo purposes, automatically grant access
      console.log('[PAYMENT] Demo mode: auto-granting access');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [hasAccess, currentUser, userRole, navigate]);

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting payment process for user:', currentUser.uid);
      
      // Create payment record
      const payment = await createPayment(currentUser.uid, 99, 'pending');
      console.log('Payment record created:', payment);
      
      // In a real implementation, you would integrate with Razorpay here
      // For demo purposes, we'll simulate a successful payment
      
      // Simulate payment processing
      toast({
        title: "Processing Payment",
        description: "Please wait while we process your payment...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      await updatePaymentStatus(payment.id, 'completed', 'demo_payment_id');
      console.log('Payment status updated to completed');
      
      // Update user access in backend
      await updateUserAccess(currentUser.uid, true);
      console.log('User access updated');
      
      // Refresh user data in context
      await refreshUserData();
      console.log('User data refreshed');
      
      toast({
        title: "Payment Successful!",
        description: "Welcome to AI 99 Course! You now have full access.",
      });
      
      // Small delay to ensure state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "17+ hours of premium video content",
    "Downloadable PDF notes for each module",
    "Lifetime access to course materials",
    "Certificate of completion",
    "Direct instructor support",
    "Mobile and desktop access"
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Complete Your Enrollment</h1>
          <p className="text-gray-400 text-lg">
            Get instant access to the complete AI course for just ₹99
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Features */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl">What You'll Get</CardTitle>
              <CardDescription className="text-gray-400">
                Complete AI course with lifetime access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#00FFD1] flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-[#00FFD1]/10 rounded-lg border border-[#00FFD1]/20">
                <div className="flex items-center space-x-2 text-[#00FFD1] mb-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">Limited Time Offer</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Regular price ₹999 - Get 90% off today only!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl">Payment Details</CardTitle>
              <CardDescription className="text-gray-400">
                Secure payment powered by Razorpay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-[#00FFD1]">₹99</div>
                <div className="text-gray-400 line-through">₹999</div>
                <div className="text-sm text-gray-500">One-time payment • Lifetime access</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment with 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Supports all major credit/debit cards and UPI</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-semibold py-6 text-lg rounded-lg transition-all duration-300"
              >
                {loading ? 'Processing Payment...' : 'Pay ₹99 & Start Learning'}
              </Button>

              <div className="text-center text-xs text-gray-500">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-4">
          <p className="text-gray-400">Trusted by 500+ students</p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <span>💳 Secure Payment</span>
            <span>🔄 30-day Money Back</span>
            <span>📱 Mobile Access</span>
            <span>🎓 Certificate Included</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
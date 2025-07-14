import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  CreditCard, 
  CheckCircle, 
  Lock, 
  Shield, 
  Calendar, 
  Clock,
  BookOpen,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { processPayment, getSubscriptionDetails } from '../services/paymentService';
import { useUser } from '../contexts/UserContext'; // or wherever you're storing the profile

//const { profile } = useUser(); // assume profile.role is available

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get the return path from location state or default to dashboard

 const { profile } = useUser(); // assume profile.role is available
  
  //const returnPath = location.state?.returnPath || '/learner/dashboard';

  const returnPath =
  location.state?.returnPath ||
  (profile?.role === 'teacher'
    ? '/teacher/dashboard'
    : profile?.role === 'learner'
    ? '/learner/dashboard'
    : '/');

  useEffect(() => {
    const loadSubscriptionDetails = async () => {
      try {
        setLoading(true);
        const details = await getSubscriptionDetails();
        setSubscriptionDetails(details);
      } catch (error) {
        console.error('Error loading subscription details:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    // Format expiry date with /
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    
    if (paymentDetails.expiryDate.length !== 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (paymentDetails.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await processPayment({
        ...paymentDetails,
        plan: selectedPlan
      });
      
      if (success) {
        toast.success('Payment processed successfully!');
        navigate(returnPath);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = {
    monthly: {
      price: 19.99,
      savings: 0,
      period: 'month'
    },
    annual: {
      price: 14.99,
      savings: 60,
      period: 'month',
      billed: 'annually'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl flex items-center">
          <Loader className="animate-spin h-6 w-6 mr-2" />
          Loading subscription details...
        </div>
      </div>
    );
  }

  // If user already has an active subscription, show subscription details
  if (subscriptionDetails?.status === 'active') {
    return (
      <div className="relative min-h-screen">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>

        {/* Navigation */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-2 text-white">
                <Users className="h-8 w-8" />
                <span className="text-xl font-bold">What-If Community</span>
              </Link>
              
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-2xl font-bold text-white">Your Subscription</h1>
              </div>
              
              <button 
                onClick={() => navigate(returnPath)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-emerald-600/30 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              You have an active {subscriptionDetails.plan} subscription
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Subscription Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan:</span>
                    <span className="text-white font-medium capitalize">{subscriptionDetails.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-emerald-400 font-medium capitalize">{subscriptionDetails.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Start Date:</span>
                    <span className="text-white">{subscriptionDetails.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Renewal Date:</span>
                    <span className="text-white">{subscriptionDetails.endDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Included Features</h3>
                <ul className="space-y-2">
                  {subscriptionDetails.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-white">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => navigate(returnPath)}
                className="bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Plan Selection */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
            
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-emerald-600/80 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedPlan === 'annual'
                    ? 'bg-emerald-600/80 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Annual
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Premium Plan</h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${plans[selectedPlan].price}<span className="text-sm text-gray-300">/{plans[selectedPlan].period}</span></p>
                  {plans[selectedPlan].billed && (
                    <p className="text-sm text-gray-300">Billed {plans[selectedPlan].billed}</p>
                  )}
                </div>
              </div>
              
              {plans[selectedPlan].savings > 0 && (
                <div className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-lg mb-4 text-center">
                  Save ${plans[selectedPlan].savings} per year with annual billing
                </div>
              )}
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <span>Unlimited access to all subjects</span>
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <span>Unlimited assessments and reviews</span>
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <span>Full community support access</span>
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <span>Unlimited class requests</span>
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <span>Priority teacher support</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-gray-300 text-sm">
              <Lock className="h-4 w-4" />
              <span>Secure payment processing</span>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentDetails.cardName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    CVV
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full bg-emerald-600/80 text-white px-6 py-3 rounded-lg hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2 ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Subscribe Now</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-gray-300 text-sm">
                <Shield className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </form>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-600/30 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">All Subjects</h3>
            </div>
            <p className="text-gray-300">
              Get unlimited access to all subjects and learning materials across all grades and streams.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-600/30 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Community Support</h3>
            </div>
            <p className="text-gray-300">
              Connect with peers and teachers for help with challenging topics and collaborative learning.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-600/30 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Class Requests</h3>
            </div>
            <p className="text-gray-300">
              Schedule one-on-one or group sessions with teachers for personalized learning experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
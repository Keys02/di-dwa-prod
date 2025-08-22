import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Calendar, Package, Truck, CheckCircle, Phone, MessageCircle, ArrowLeft, Star } from 'lucide-react';
import logo from '../assets/Di-dwa.jpg';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [deliveryFee] = useState(15.00);
  const [orderId] = useState(() => 'DD' + Math.random().toString(36).substr(2, 8).toUpperCase());

  // Load order data from navigation state or localStorage
  useEffect(() => {
    const loadOrderData = () => {
      try {
        // First check if order data was passed via navigation state (from payment page)
        if (location.state?.orderData) {
          const { cartItems, deliveryAddress, paymentMethod, total } = location.state.orderData;
          setOrderItems(cartItems || []);
          setDeliveryAddress(deliveryAddress || 'No address provided');
          setPaymentMethod(paymentMethod || 'Unknown');
          setOrderTotal(total || 0);
          
          // Save to localStorage for persistence
          localStorage.setItem('currentOrder', JSON.stringify(location.state.orderData));
          return;
        }

        // Otherwise try to load from localStorage
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);
          setOrderItems(orderData.cartItems || []);
          setDeliveryAddress(orderData.deliveryAddress || 'No address provided');
          setPaymentMethod(orderData.paymentMethod || 'Unknown');
          setOrderTotal(orderData.total || 0);
          return;
        }

        // Fallback: try to get cart items from localStorage
        const savedCartItems = localStorage.getItem('cartItems');
        if (savedCartItems) {
          const cartItems = JSON.parse(savedCartItems);
          setOrderItems(cartItems);
          
          // Calculate total
          const subtotal = cartItems.reduce((sum, item) => {
            if (item.selectedOption === 'Amount') {
              return sum + (parseFloat(item.amount) || 0);
            }
            return sum + (item.pricePerUnit * item.quantity);
          }, 0);
          setOrderTotal(subtotal + deliveryFee);
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        // Default empty state
        setOrderItems([]);
        setDeliveryAddress('No address provided');
        setPaymentMethod('Unknown');
        setOrderTotal(0);
      }
    };

    loadOrderData();
  }, [location.state, deliveryFee]);

  // Calculate delivery time based on current date
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    time: '',
    date: ''
  });

  useEffect(() => {
    const calculateDelivery = () => {
      const now = new Date();
      const currentHour = now.getHours();
      let deliveryDate = new Date();
      
      // If it's after 6 PM, delivery is next day
      if (currentHour >= 18) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
      }
      
      // Skip Sundays for delivery
      if (deliveryDate.getDay() === 0) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
      }
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const deliveryDay = days[deliveryDate.getDay()];
      const deliveryTime = deliveryDate.getDate() === now.getDate() && currentHour < 18 
        ? `${Math.min(currentHour + 2, 17)}:00 - ${Math.min(currentHour + 4, 19)}:00`
        : '10:00 AM - 2:00 PM';
      
      const formattedDate = `${deliveryDate.getDate()}${getOrdinalSuffix(deliveryDate.getDate())} ${months[deliveryDate.getMonth()]}, ${deliveryDate.getFullYear()}`;
      
      setDeliveryInfo({
        address: deliveryAddress || 'Delivery address not provided',
        time: deliveryTime,
        date: formattedDate
      });
    };
    
    calculateDelivery();
  }, [deliveryAddress]);

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  // Auto-progress simulation
  useEffect(() => {
    setAnimateProgress(true);
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Calculate item total
  const getItemTotal = (item) => {
    if (item.selectedOption === 'Amount') {
      return parseFloat(item.amount) || 0;
    } else {
      return (item.pricePerUnit || item.price || 5.00) * (item.quantity || 1);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const handleBackNavigation = () => {
    navigate('/myorder');
  };

  const handleCallDelivery = () => {
    // Simulate calling delivery
    alert('Calling delivery agent: +233 50 123 4567');
  };

  const handleChatSupport = () => {
    // Simulate opening chat
    alert('Opening chat support...');
  };

  const getPaymentMethodDisplay = (method) => {
    switch(method) {
      case 'mobile': return 'Mobile Money';
      case 'bank': return 'Bank Transfer';
      case 'delivery': return 'Pay on Delivery';
      default: return method || 'Unknown Payment Method';
    }
  };

  const trackingSteps = [
    { 
      id: 1, 
      label: 'Order Placed', 
      icon: <Package className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      id: 2, 
      label: 'Sending order', 
      icon: <Truck className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      id: 3, 
      label: 'Delivered', 
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const trackingIllustrations = [
    {
      step: 1,
      title: 'Order Processing',
      icon: '📱',
      description: 'Your order is being prepared'
    },
    {
      step: 2,
      title: 'Out for Delivery',
      icon: '🏍️',
      description: 'Your order is on the way'
    },
    {
      step: 3,
      title: 'Order Delivered',
      icon: '👥',
      description: 'Your order has been delivered'
    },
    {
      step: 4,
      title: 'Customer Happy',
      icon: '🎉',
      description: 'Enjoy your fresh groceries!'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackNavigation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
            </div>
          </div>
          <img 
            src={logo} 
            alt="Di-Dwa Logo" 
            className="w-12 h-12 object-contain animate-pulse"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              <p className="text-gray-600">Payment: {getPaymentMethodDisplay(paymentMethod)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                GH₵{(calculateSubtotal() + deliveryFee).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Subtotal: GH₵{calculateSubtotal().toFixed(2)} + Delivery: GH₵{deliveryFee.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          {orderItems.length > 0 ? (
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:scale-102 animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.selectedOption === 'Amount' 
                        ? `Amount: GH₵${parseFloat(item.amount || 0).toFixed(2)}`
                        : `Quantity: ${item.quantity || 1} @ GH₵${(item.pricePerUnit || item.price || 5.00).toFixed(2)} each`
                      }
                    </p>
                    {item.discount > 0 && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        -{item.discount}% off
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">GH₵{getItemTotal(item).toFixed(2)}</p>
                    {item.rating && (
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No items found in this order</p>
              <button 
                onClick={() => navigate('/myorder')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to My Orders
              </button>
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in-delay">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Delivery address</p>
                <p className="font-semibold text-gray-800">{deliveryInfo.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-300">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Delivery time</p>
                <p className="font-semibold text-gray-800">{deliveryInfo.time}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300">
              <Calendar className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Delivery date</p>
                <p className="font-semibold text-gray-800">{deliveryInfo.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracking Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-slide-up-delay">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Order Status</h2>
          
          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="flex justify-between items-center">
              {trackingSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      currentStep >= step.id 
                        ? `${step.bgColor} ${step.color} scale-110 animate-bounce` 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-sm font-medium mt-2 transition-colors duration-300 ${
                    currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className={`h-full bg-gradient-to-r from-green-400 to-purple-400 transition-all duration-1000 ease-out ${
                  animateProgress ? 'animate-pulse' : ''
                }`}
                style={{ width: `${((currentStep - 1) / (trackingSteps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Track Your Order Illustration */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in-delay-2">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-8">TRACK YOUR ORDER</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trackingIllustrations.map((item, index) => (
              <div 
                key={item.step}
                className={`text-center p-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                  currentStep >= item.step ? 'bg-green-50 animate-bounce-slow' : 'bg-gray-50'
                } ${currentStep === item.step ? 'ring-2 ring-green-400' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-3 animate-float">{item.icon}</div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
                
                {currentStep === item.step && (
                  <div className="mt-2 animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Connecting Lines */}
          <div className="hidden md:block relative mt-4">
            <div className="absolute top-0 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={handleCallDelivery}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>Call Delivery</span>
          </button>
          
          <button 
            onClick={handleChatSupport}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat Support</span>
          </button>
        </div>

        {/* Order Status Message */}
        <div className="mt-8 text-center">
          <div className={`inline-block px-6 py-3 rounded-full ${
            currentStep === 1 ? 'bg-yellow-100 text-yellow-800' :
            currentStep === 2 ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {currentStep === 1 && '🔄 Your order is being prepared...'}
            {currentStep === 2 && '🚚 Your order is on the way...'}
            {currentStep === 3 && '✅ Your order has been delivered!'}
          </div>
        </div>

        {/* Back to Orders Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleBackNavigation}
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
          >
            Back to My Orders
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out both;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.3s both;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default TrackOrderPage;
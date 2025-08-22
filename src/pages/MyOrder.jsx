import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

import logo from '../assets/Di-dwa.jpg';

const MyOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load items from localStorage on component mount
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCartItems = () => {
      try {
        // First check if items were passed via navigation state
        if (location.state?.cartItems) {
          const transformedItems = location.state.cartItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            pricePerUnit: parseFloat(item.priceRange.split(' - ')[0].replace('₵', '')) || 5.00,
            quantity: item.quantity || 1,
            amount: '',
            chooseBy: 'Quantity',
            selectedOption: 'Quantity',
            fromPrice: parseFloat(item.priceRange.split(' - ')[0].replace('₵', '')) || 5.00,
            discount: item.discount || 0,
            rating: item.rating || 4.0,
            priceRange: item.priceRange
          }));
          setCartItems(transformedItems);
          return;
        }

        // Otherwise load from localStorage
        const savedItems = localStorage.getItem('cartItems');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          // Transform items to match MyOrder format
          const transformedItems = parsedItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            pricePerUnit: parseFloat(item.priceRange?.split(' - ')[0]?.replace('₵', '')) || item.pricePerUnit || 5.00,
            quantity: item.quantity || 1,
            amount: item.amount || '',
            chooseBy: item.chooseBy || 'Quantity',
            selectedOption: item.selectedOption || 'Quantity',
            fromPrice: parseFloat(item.priceRange?.split(' - ')[0]?.replace('₵', '')) || item.fromPrice || 5.00,
            discount: item.discount || 0,
            rating: item.rating || 4.0,
            priceRange: item.priceRange || `₵${item.pricePerUnit || 5.00} - ₵100`
          }));
          setCartItems(transformedItems);
        } else {
          // Default items if no cart items exist
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        setCartItems([]);
      }
    };

    loadCartItems();
  }, [location.state]);

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const updateItemQuantity = (id, newQuantity) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          return { ...item, quantity: newQuantity === '' ? '' : Math.max(1, parseInt(newQuantity) || 1) };
        }
        return item;
      })
    );
  };

  const updateItemAmount = (id, newAmount) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          return { ...item, amount: newAmount };
        }
        return item;
      })
    );
  };

  const toggleChooseBy = (id, option) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, selectedOption: option };
          // Initialize values when switching modes
          if (option === 'Amount') {
            updatedItem.amount = updatedItem.amount || updatedItem.fromPrice;
          } else {
            updatedItem.quantity = updatedItem.quantity || 1;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    // Update localStorage immediately
    if (updatedItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    } else {
      localStorage.removeItem('cartItems');
    }
  };

  const clearAllItems = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const getItemTotal = (item) => {
    if (item.selectedOption === 'Quantity') {
      const qty = parseInt(item.quantity) || 0;
      return qty * item.pricePerUnit;
    } else {
      const amt = parseFloat(item.amount) || 0;
      return amt;
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => {
      return sum + getItemTotal(item);
    }, 0);
  };

  // Handle navigation back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Handle navigation to payment/checkout
  const handleContinuePayment = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Navigate to payment page with cart items
    navigate('/payment', { state: { cartItems, totalAmount: getTotalAmount() } });
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <button 
              onClick={handleBackToHome}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-xs text-gray-500">Logo</span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                My Order
                <ShoppingCart className="w-5 h-5 ml-2 text-green-600" />
              </h1>
            </div>
            
            <div className="w-9"></div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <button 
              onClick={handleBackToHome}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={handleBackToHome}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-xs text-gray-500">Logo</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              My Order
              <ShoppingCart className="w-5 h-5 ml-2 text-green-600" />
            </h1>
          </div>
          
          <div className="w-9"></div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
                {/* Fallback placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-2xl">📦</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                    {item.discount > 0 && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        -{item.discount}% off
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Choose By Options */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Choose by: <span className="font-medium text-gray-800">{item.chooseBy}</span></p>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`choose-${item.id}`}
                        checked={item.selectedOption === 'Amount'}
                        onChange={() => toggleChooseBy(item.id, 'Amount')}
                        className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Amount</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`choose-${item.id}`}
                        checked={item.selectedOption === 'Quantity'}
                        onChange={() => toggleChooseBy(item.id, 'Quantity')}
                        className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Quantity</span>
                    </label>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="flex justify-between items-center">
                  <div className="flex-1 max-w-32">
                    {item.selectedOption === 'Quantity' ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        min="1"
                        step="1"
                      />
                    ) : (
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateItemAmount(item.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="GH₵0.00"
                        step="0.01"
                        min="0"
                      />
                    )}
                  </div>

                  <div className="text-right">
                    {item.selectedOption === 'Quantity' ? (
                      <p className="text-sm text-gray-600">
                        1 Qnty = <span className="font-medium">Gh {item.pricePerUnit.toFixed(2)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        From <span className="font-medium">Gh{item.fromPrice.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Total: <span className="font-bold text-gray-800">Gh{getItemTotal(item).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-gray-800">
              TOTAL: <span className="text-green-600">GH₵{getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleBackToHome}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back Home
            </button>
            <button 
              onClick={clearAllItems}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Delete Items
            </button>
            <button 
              onClick={handleContinuePayment}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
            >
              Continue Payment
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacing for fixed footer */}
      <div className="h-32"></div>
    </div>
  );
};

export default MyOrder;
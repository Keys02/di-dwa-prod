import React from 'react';
import { ShoppingCart, Package, ArrowRight } from 'lucide-react';

const CartModal = ({ isOpen, onClose, onContinueShopping, onGoToOrder, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Item Added to Cart!</h2>
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">{productName}</span> has been added to your cart.
            </p>
          </div>

          {/* Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              What would you like to do next?
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onGoToOrder}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>View My Order & Add Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onContinueShopping}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Don't worry! Your items will be saved in your cart.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
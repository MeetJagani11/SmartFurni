import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { stores } from '../data/mockData';
import { toast } from '../hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const BookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    phone: '',
    store: '',
    product: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map 'product' to 'product_interest' as expected by backend model
      const payload = {
        phone: formData.phone,
        store: formData.store,
        product_interest: formData.product,
        notes: "Requested via Header Modal"
      };

      await axios.post(`${API_BASE_URL}/bookings/`, payload);

      toast({
        title: "Booking Request Sent!",
        description: "We'll contact you shortly to confirm your visit.",
      });
      onClose();
      setFormData({ phone: '', store: '', product: '' });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.response?.data?.detail || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 md:right-4 md:top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Book Your <span className="text-orange-600">Experience Today!</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 mt-4 md:mt-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                  <option>+91</option>
                </select>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Nearest Store
              </label>
              <select
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              >
                <option value="">Select</option>
                {stores.map((store, index) => (
                  <option key={index} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Product Interested
              </label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
              >
                <option value="">Select</option>
                <option value="beds">Beds</option>
                <option value="sofa">Sofa</option>
                <option value="dining">Dining</option>
                <option value="marble-dining">Marble Dining</option>
                <option value="recliner">Recliner</option>
                <option value="leather-sofa">Leather Sofa</option>
                <option value="chest-of-drawers">Chest Of Drawers</option>
                <option value="others">Others</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm md:text-base disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending Request...
                </>
              ) : (
                "Book A Visit!"
              )}
            </button>
          </form>

          <div className="mt-4 md:mt-6 space-y-2 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-base md:text-lg">🏪</span>
              <span className="font-medium">Largest Furniture Collection</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-base md:text-lg">↩️</span>
              <span className="font-medium">7 Days No Questions Asked Return</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-base md:text-lg">💰</span>
              <span className="font-medium">Wholesale Price</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
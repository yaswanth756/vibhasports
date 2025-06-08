'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function BookingPage() {
  const [name, setName] = useState('');
  const [court, setCourt] = useState('A');
  const [date, setDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const PRICE_PER_HOUR = 500;

  // Generate time slots from 6 AM to 10 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const displayStart = hour % 12 === 0 ? 12 : hour % 12;
      const displayEnd = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
      const period = hour < 12 ? 'AM' : 'PM';
      slots.push(`${displayStart}:00–${displayEnd}:00 ${period}`);
    }
    return slots;
  };

  // Get current and next day
  const getAvailableDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];
    return [formatDate(today), formatDate(tomorrow)];
  };

  // Initialize with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Fetch booked slots from API
  const fetchBookedSlots = async () => {
    if (!date || !court) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/bookings?date=${date}&court=${court}`);
      if (!response.ok) throw new Error('Failed to fetch booked slots');
      const booked = await response.json();

      const allSlots = generateTimeSlots();
      const available = allSlots.filter((slot) => !booked.includes(slot));
      setAvailableSlots(available);
      setBookedSlots(booked);
      setSelectedSlots([]);
    } catch (err) {
      setError('Failed to load slots');
      // Fallback to show all slots as available if API fails
      const allSlots = generateTimeSlots();
      setAvailableSlots(allSlots);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots when date or court changes
  useEffect(() => {
    fetchBookedSlots();
  }, [date, court]);

  // Handle slot selection
  const handleSlotChange = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Calculate total amount
  const totalAmount = selectedSlots.length * PRICE_PER_HOUR;

  // Handle form submission
  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!court) {
      setError('Please select a court');
      setLoading(false);
      return;
    }
    if (!date) {
      setError('Please select a date');
      setLoading(false);
      return;
    }
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot');
      setLoading(false);
      return;
    }

    const bookingData = { name, court, date, slots: selectedSlots };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Failed to create booking');
      setSuccess('Booking confirmed!');
      setName('');
      setSelectedSlots([]);
      // Refresh slots after booking
      await fetchBookedSlots();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  // Available dates
  const availableDates = getAvailableDates();
  const allSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toast Notification */}
      {(success || error) && (
        <div className={`fixed top-4 left-4 right-4 p-3 rounded-lg shadow-lg text-white z-50 ${
          success ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            {success && <CheckCircle className="w-4 h-4" />}
            <span>{success || error}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 mb-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-1">Vibha Sports Court</h1>
            <p className="text-blue-100 text-xs">₹{PRICE_PER_HOUR}/hour</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
          {/* Name Input Row */}
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0 text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Court and Date Row */}
          <div className="flex gap-3">
            <select
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0 text-sm"
            >
              <option value="A">Court A</option>
              <option value="B">Court B</option>
            </select>
            
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0 text-sm"
            >
              <option value="">Select a date</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slots Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Time Slots</h3>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Booked
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  Selected
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {allSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlots.includes(slot);
                  const isAvailable = availableSlots.includes(slot);
                  
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => isAvailable && handleSlotChange(slot)}
                      disabled={isBooked}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isBooked
                          ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                          : isSelected
                          ? 'bg-blue-500 text-white shadow-md'
                          : isAvailable
                          ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total and Book Button */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Amount</div>
                <div className="text-xs text-gray-500">
                  {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
                </div>
              </div>
              <div className="text-xl font-bold text-green-600">
                ₹{totalAmount.toLocaleString()}
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || selectedSlots.length === 0 || !name.trim() || !court || !date}
              className={`w-full p-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                loading || selectedSlots.length === 0 || !name.trim() || !court || !date
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Booking...
                </div>
              ) : (
                `Book Now ${totalAmount > 0 ? `- ₹${totalAmount.toLocaleString()}` : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
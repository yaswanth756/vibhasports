'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Clock, MapPin, User, IndianRupee, Shield, Trash2, CalendarDays } from 'lucide-react';

export default function VerificationPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, pending, today

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/verify');
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle verify or cancel
  const handleAction = async (id, action) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} booking`);
      setSuccess(`Booking ${action === 'verify' ? 'verified' : 'cancelled'} successfully!`);
      setBookings((prev) =>
        action === 'verify'
          ? prev.map((b) => (b.id === id ? { ...b, verified: true } : b))
          : prev.filter((b) => b.id !== id)
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to ${action} booking`);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Helper function to check if a booking is for today
  const isToday = (dateString) => {
    const today = new Date();
    const bookingDate = new Date(dateString);
    return (
      today.getFullYear() === bookingDate.getFullYear() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getDate() === bookingDate.getDate()
    );
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'verified') return booking.verified;
    if (filter === 'pending') return !booking.verified;
    if (filter === 'today') return isToday(booking.date);
    return true;
  });

  // Get today's bookings
  const todaysBookings = bookings.filter((booking) => isToday(booking.date));

  // Stats with fixed revenue calculation
  const stats = {
    total: bookings.length,
    verified: bookings.filter((b) => b.verified).length,
    pending: bookings.filter((b) => !b.verified).length,
    today: todaysBookings.length,
    todayRevenue: todaysBookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0),
    totalRevenue: bookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 overflow-x-hidden">
      {/* Toast Notification */}
      {(success || error) && (
        <div
          className={`fixed top-4 left-2 right-2 sm:left-4 sm:right-4 max-w-md mx-auto p-3 rounded-lg shadow-lg text-white z-50 ${
            success ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {success && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
            {error && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span>{success || error}</span>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-3 sm:p-4 mb-4">
          <div className="text-center">
            <h1 className="text-base sm:text-xl font-bold mb-1">Admin Panel</h1>
            <p className="text-blue-100 text-xs" style={{ lineHeight: 1.2 }}>Vibha Sports Court Verification</p>
          </div>
        </div>

        {/* Today's Bookings Highlight */}
      

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm flex-1 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm flex-1 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verified</p>
                <p className="text-base sm:text-lg font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm flex-1 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-base sm:text-lg font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm flex-1 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-xs sm:text-sm font-bold text-purple-600">{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'today' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today ({stats.today})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'verified' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Verified ({stats.verified})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-2 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse">
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-1.5 mt-2 sm:mt-0 sm:flex-col sm:gap-2">
                      <div className="h-7 w-14 sm:h-8 sm:w-16 bg-gray-200 rounded-lg"></div>
                      <div className="h-7 w-14 sm:h-8 sm:w-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error && bookings.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">
                {filter === 'today' ? 'No bookings for today' : 'No bookings found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBookings.map((booking) => {
                const isTodayBooking = isToday(booking.date);
                return (
                  <div
                    key={booking.id}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${
                      booking.verified 
                        ? 'border-green-200 bg-green-50' 
                        : isTodayBooking
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="font-semibold text-gray-800 text-xs sm:text-base">{booking.name}</span>
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.verified 
                                ? 'bg-green-100 text-green-700' 
                                : isTodayBooking
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {booking.verified ? 'Verified' : isTodayBooking ? 'Today' : 'Pending'}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-1.5 min-w-[120px]">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">Court {booking.court}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-[120px]">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-[120px]">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">{booking.slot_timings}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-[120px]">
                            <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-800">₹{booking.cost}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row gap-1.5 sm:flex-col sm:gap-2 mt-2 sm:mt-0 sm:ml-3">
                        {!booking.verified && (
                          <button
                            onClick={() => handleAction(booking.id, 'verify')}
                            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs font-medium"
                          >
                            <Shield className="w-3 h-3" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(booking.id, 'cancel')}
                          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
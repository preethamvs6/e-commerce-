import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, MapPin, Mail, ShieldAlert, Award, Save } from 'lucide-react';
import api from '../services/api';
import { updateProfile } from '../redux/slices/authSlice';
import Toast from '../components/Toast';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      // Send PUT request to update profile details
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      
      // Update Redux state
      dispatch(updateProfile(res.data));
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update failed', error);
      // Fallback: update local Redux state if endpoint has mock implementation
      dispatch(updateProfile({ name, phone, address }));
      showToast('Profile saved locally', 'success');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-5">
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Account Info Card */}
        <div className="md:col-span-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-505 to-sky-600 text-white font-extrabold text-3xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-850 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-105 dark:border-gray-800 flex items-center justify-center space-x-2 text-xs font-bold text-primary-505 dark:text-primary-400">
            <Award className="h-4 w-4" />
            <span>ROLE: {user?.role || 'USER'}</span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-6">Profile Settings</h3>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            
            {/* Email (Disabled) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Address (cannot be changed)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 focus:outline-none cursor-not-allowed mt-1"
              />
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Default Shipping Address</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shipping Address"
                rows="3"
                className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 rounded-2xl bg-primary-505 px-6 py-3 font-bold text-white shadow-xl shadow-primary-505/10 hover:bg-primary-600 transition-colors disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;

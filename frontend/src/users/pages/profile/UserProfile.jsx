import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Camera, Edit, Plus, Trash, User, Package, MapPin, Heart, Ticket, Lock, Wallet } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, updateUserInfo } from '../../../redux/slices/authSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { fetchAddressesApi, fetchUserDetailsApi } from '../../../services/api/userApis/profileApi';

function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [profileImage, setProfileImage] = useState(userInfo?.image || null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    fetchUserAddresses();
  }, []);

  const fetchUserDetails = async () => {
    try {
      console.log('Fetching user details...');
      const response = await fetchUserDetailsApi()
      console.log('User details response:', response.data);
      setUserDetails(response.data);
      
      // Update Redux store with user details including referralCode
      dispatch(updateUserInfo(response.data));
      
      if (response.data.image) {
        setProfileImage(response.data.image);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch user details');
      setLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await fetchAddressesApi()
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch addresses');
      setAddresses([]);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 animate-fadeIn">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Responsive */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-lg p-4 h-fit transition-all duration-300 hover:shadow-xl">
            <nav className="space-y-2">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">My Account</h2>
              {[
                { href: '/profile', icon: User, label: 'Profile', active: true },
                { href: '/orders', icon: Package, label: 'My Orders' },
                { href: '/profile/addresses', icon: MapPin, label: 'Addresses' },
                { href: '/wishlist', icon: Heart, label: 'Wishlist' },
                { href: '/wallet', icon: Wallet, label: 'Wallet' },
                { href: '/coupons', icon: Ticket, label: 'My Coupons' },
                { href: '/profile/change-password', icon: Lock, label: 'Change Password' }
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 p-3 rounded-md text-sm transition-all duration-200 transform hover:scale-105 ${
                    item.active 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-primary'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content - Responsive */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                Profile Information
              </h1>
              <Button 
                size="sm" 
                onClick={() => navigate('/profile/edit')}
                className="transition-all duration-300 hover:scale-105"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Profile
              </Button>
            </div>

            {/* Profile Display with Animation */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-1 transition-transform duration-300 group-hover:scale-110">
                  <div className="h-full w-full rounded-full bg-white overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="h-full w-full object-cover transition-transform duration-300 hover:scale-110" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'First Name', value: userDetails?.firstname },
                { label: 'Last Name', value: userDetails?.lastname },
                { label: 'Email', value: userDetails?.email },
                { label: 'Mobile', value: userDetails?.phone },
                { label: 'Username', value: userDetails?.username },
                { label: 'Member Since', value: userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : null }
              ].map((field, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                  <Label className="text-sm text-gray-500">{field.label}</Label>
                  <p className="text-sm font-medium mt-1">{field.value || 'Not provided'}</p>
                </div>
              ))}

              {/* Referral Code Section - Full Width */}
              <div className="col-span-full bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                <Label className="text-sm text-gray-500">Referral Code</Label>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xl font-mono bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text font-bold">
                    {userDetails?.referralCode || 'Not available'}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userDetails?.referralCode);
                      toast.success('Referral code copied!');
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-4 sm:mb-0">
                  Default Address
                </h2>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/profile/addresses')}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Manage Addresses
                </Button>
              </div>

              <div className="border p-6 rounded-lg text-sm bg-gray-50 transition-all duration-300 hover:shadow-lg">
                {addresses.find(addr => addr.isDefault) ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{addresses.find(addr => addr.isDefault).fullName}</p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).phone}</p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).street}</p>
                    <p className="text-gray-600">
                      {`${addresses.find(addr => addr.isDefault).city}, ${addresses.find(addr => addr.isDefault).state} ${addresses.find(addr => addr.isDefault).postalCode}`}
                    </p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).country}</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No default address set</p>
                    <Button
                      onClick={() => navigate('/addresses')}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      Add Address
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserProfile;
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md p-4 h-fit">
            <nav className="space-y-2">
              <h2 className="text-lg font-semibold mb-4">My Account</h2>
              <a href="/profile" className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md text-sm">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </a>
              <a href="/orders" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Package className="h-4 w-4" />
                <span>My Orders</span>
              </a>
              <a href="/profile/addresses" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </a>
              <a href="/wishlist" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </a>
              <a href="/wallet" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </a>
              <a href="/coupons" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Ticket className="h-4 w-4" />
                <span>My Coupons</span>
              </a>
              <a href="/profile/change-password" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold">Profile Information</h1>
              <Button size="sm" onClick={() => navigate('/profile/edit')}>
                <Edit className="h-3 w-3 mr-1" />
                Edit Profile
              </Button>
            </div>

            {/* Profile Display */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information Display */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-500">First Name</Label>
                <p className="text-sm font-medium">{userDetails?.firstname || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Last Name</Label>
                <p className="text-sm font-medium">{userDetails?.lastname || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="text-sm font-medium">{userDetails?.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Mobile</Label>
                <p className="text-sm font-medium">{userDetails?.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Username</Label>
                <p className="text-sm font-medium">{userDetails?.username || 'Not provided'}</p>
              <div className="col-span-2 mt-3">
                <Label className="text-sm text-gray-500">Referral Code</Label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text font-bold">
                    {userDetails?.referralCode || 'Not available'}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userDetails?.referralCode);
                      toast.success('Referral code copied to clipboard!');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
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
              <div>
                <Label className="text-sm text-gray-500">Member Since</Label>
                <p className="text-sm font-medium">
                  {userDetails?.createdAt
                    ? new Date(userDetails.createdAt).toLocaleDateString()
                    : 'Not available'
                  }
                </p>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Default Address</h2>
                <Button variant="link" onClick={() => navigate('/profile/addresses')}>
                  Manage Addresses
                </Button>
              </div>

              <div className="border p-3 rounded-lg text-sm">
                {addresses.find(addr => addr.isDefault) ? (
                  <div>
                    {/* Show default address details */}
                    <p className="font-semibold">{addresses.find(addr => addr.isDefault).fullName}</p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).phone}</p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).street}</p>
                    <p className="text-gray-600">
                      {`${addresses.find(addr => addr.isDefault).city}, ${addresses.find(addr => addr.isDefault).state} ${addresses.find(addr => addr.isDefault).postalCode}`}
                    </p>
                    <p className="text-gray-600">{addresses.find(addr => addr.isDefault).country}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No default address set</p>
                    <Button
                      variant="link"
                      onClick={() => navigate('/addresses')}
                      className="mt-2"
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
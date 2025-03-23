import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Camera, Edit, Plus, Trash, User, Package, MapPin, Heart, Ticket, Lock, Wallet } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../../../redux/slices/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

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
      const response = await axios.get(`${api}/user/profile/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
      setUserDetails(response.data);
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
      const response = await axios.get(`${api}/user/profile/address`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
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
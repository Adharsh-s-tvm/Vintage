import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Camera, Edit, Plus, Trash, User, Package, MapPin, Heart, Ticket, Lock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../../../redux/slices/authSlice';
import { toast } from 'sonner';
import axios from 'axios';

function UserProfile() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [profileImage, setProfileImage] = useState(userInfo?.image || null);
  const [loading, setLoading] = useState(false);

  // Initialize form data from Redux state
  const [formData, setFormData] = useState({
    firstname: userInfo?.firstname || '',
    lastname: userInfo?.lastname || '',
    email: userInfo?.email || '',
    username: userInfo?.username || '',
    image: userInfo?.image || '',
  });

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  // Update form data when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setFormData({
        firstname: userInfo.firstname || '',
        lastname: userInfo.lastname || '',
        email: userInfo.email || '',
        username: userInfo.username || '',
        image: userInfo.image || '',
      });
      setProfileImage(userInfo.image || null);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchUserAddresses();
  }, [userInfo]);

  const fetchUserAddresses = async () => {
    try {
      const response = await axios.get('/api/users/addresses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch addresses');
      setAddresses([]);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });

      // Update both Redux state and localStorage
      const updatedUserInfo = { ...userInfo, ...response.data };
      dispatch(setUserInfo(updatedUserInfo));
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        setLoading(true);
        const response = await axios.post('/api/users/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });

        // Update both local state and Redux
        setProfileImage(response.data.imageUrl);
        const updatedUserInfo = { ...userInfo, image: response.data.imageUrl };
        dispatch(setUserInfo(updatedUserInfo));
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        toast.success('Profile image updated successfully');
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAddress = async () => {
    try {
      await axios.post('/api/users/addresses', newAddress, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      toast.success('Address added successfully');
      setShowAddressForm(false);
      fetchUserAddresses();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

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
              <a href="/addresses" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </a>
              <a href="/wishlist" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </a>
              <a href="/coupons" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
                <Ticket className="h-4 w-4" />
                <span>My Coupons</span>
              </a>
              <a href="/change-password" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-sm">
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
              <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-3 w-3 mr-1" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {/* Profile Image Section */}
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
                <label className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
                  <Camera className="h-3 w-3" />
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstname" className="text-sm">First Name</Label>
                <Input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  disabled={!isEditing}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastname" className="text-sm">Last Name</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  disabled={!isEditing}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="username" className="text-sm">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!isEditing}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {isEditing && (
              <Button size="sm" className="mt-3" onClick={handleProfileUpdate}>
                Save Changes
              </Button>
            )}

            {/* Addresses Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Addresses</h2>
                <Button size="sm" onClick={() => setShowAddressForm(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Address
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addresses.map((address) => (
                  <div key={address._id} className="border p-3 rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{address.fullName}</p>
                        <p className="text-gray-600">{address.phone}</p>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">{`${address.city}, ${address.state} ${address.postalCode}`}</p>
                        <p className="text-gray-600">{address.country}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="xs">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="xs" className="text-red-500">
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserProfile;
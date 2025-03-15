import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Edit, Plus, Trash, MapPin } from 'lucide-react';
import { Checkbox } from '../../../ui/Checkbox';
import axios from 'axios';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

function UserAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`${api}/user/profile/address`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });
            setAddresses(response.data);
        } catch (error) {
            toast.error('Failed to fetch addresses');
        }
    };

    const handleDelete = async (addressId) => {
        try {
            await axios.delete(`${api}/user/profile/address/${addressId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            await axios.put(
                `${api}/user/profile/address/${addressId}`,
                { isDefault: true },
                { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
            );
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAddress) {
                await axios.put(
                    `${api}/user/profile/address/${editingAddress._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
                );
                toast.success('Address updated successfully');
            } else {
                await axios.post(
                    `${api}/user/profile/address`,
                    formData,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
                );
                toast.success('Address added successfully');
            }
            setShowModal(false);
            resetForm();
            fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            isDefault: false
        });
        setEditingAddress(null);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Addresses</h1>
                    <Button onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address._id}
                            className={`border rounded-lg p-4 ${address.isDefault ? 'border-primary bg-primary/5' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{address.fullName}</p>
                                    <p className="text-gray-600">{address.phone}</p>
                                    <p className="text-gray-600">{address.street}</p>
                                    <p className="text-gray-600">
                                        {`${address.city}, ${address.state} ${address.postalCode}`}
                                    </p>
                                    <p className="text-gray-600">{address.country}</p>
                                    {address.isDefault && (
                                        <span className="inline-flex items-center text-sm text-primary mt-2">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            Default Address
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(address)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    {!address.isDefault && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDefaultAddress(address._id)}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(address._id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isDefault: checked })}
                                    />
                                    <Label htmlFor="isDefault">Set as default address</Label>
                                </div>
                                <div className="flex justify-end space-x-2 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Address'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default UserAddresses;
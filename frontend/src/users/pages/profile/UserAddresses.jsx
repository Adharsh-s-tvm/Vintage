import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Edit, Plus, Trash, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { addAddressApi, deleteAddressApi, fetchAddressesApi, setDefaultAddressApi, updateAddressApi } from '../../../services/api/userApis/profileApi';

function UserAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
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
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        addressId: null,
        addressDetails: null
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editAddressId, setEditAddressId] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                toast.error('Please login to view addresses');
                return;
            }

            const response = await fetchAddressesApi()
            setAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch addresses');
            }
        }
    };

    const handleEdit = (address) => {
        setFormData({
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setEditAddressId(address._id);
        setIsEditMode(true);
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                toast.error('Please login to add address');
                return;
            }

            setLoading(true);
            if (isEditMode) {
                await updateAddressApi(editAddressId, formData)
                toast.success('Address updated successfully');
            } else {
                await addAddressApi(formData)
                toast.success('Address added successfully');
            }
            setShowAddModal(false);
            resetForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error submitting address:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
            } else {
                toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} address`);
            }
        } finally {
            setLoading(false);
            setIsEditMode(false);
            setEditAddressId(null);
        }
    };

    const initiateDelete = (address) => {
        setDeleteConfirmation({
            show: true,
            addressId: address._id,
            addressDetails: address
        });
    };

    const handleDelete = async () => {
        try {
            await deleteAddressApi(deleteConfirmation.addressId);
            toast.success('Address deleted successfully');
            fetchAddresses();
            setDeleteConfirmation({ show: false, addressId: null, addressDetails: null });
        } catch (error) {
            console.error('Error deleting address:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
            } else {
                toast.error(error.response?.data?.message || 'Failed to delete address');
            }
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            await setDefaultAddressApi(addressId)
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
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
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Addresses</h1>
                    <Button onClick={() => setShowAddModal(true)}>
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
                                        onClick={() => initiateDelete(address)}
                                    >
                                        <Trash className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Address Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {isEditMode ? 'Edit Address' : 'Add New Address'}
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
                                    <Label htmlFor="phone">Phone Number</Label>
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
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    />
                                    <Label htmlFor="isDefault">Set as default address</Label>
                                </div>
                                <div className="flex justify-end space-x-2 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setIsEditMode(false);
                                            setEditAddressId(null);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Address' : 'Add Address')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmation.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold text-red-600 mb-4">
                                Delete Address
                            </h2>
                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to delete this address?
                                </p>
                                {deleteConfirmation.addressDetails && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="font-semibold">
                                            {deleteConfirmation.addressDetails.fullName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {deleteConfirmation.addressDetails.street}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {`${deleteConfirmation.addressDetails.city}, ${deleteConfirmation.addressDetails.state} ${deleteConfirmation.addressDetails.postalCode}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDeleteConfirmation({
                                        show: false,
                                        addressId: null,
                                        addressDetails: null
                                    })}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Delete Address
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default UserAddresses;

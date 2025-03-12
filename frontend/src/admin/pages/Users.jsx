import React, { useEffect, useState } from 'react';
import { Layout } from '../layout/Layout';
import { UsersTable } from '../usersData/UserTable';
import { UserFormModal } from '../usersData/UserFormModal';
import { DeleteUserModal } from '../usersData/DeleteUserModal';
import { useToast } from '../../hooks/useToast';
import axios from 'axios';
import { api } from '../../lib/api';

export default function Users() {
    const [users, setUsers] = useState([]);  // Initialize as an empty array
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []); // Add dependency array to prevent infinite re-renders

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${api}/admin/users`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    console.log(users)

    // const handleNewUser = () => {
    //     setSelectedUser(null);
    //     setUserFormOpen(true);
    // };

    // const handleEditUser = (user) => {
    //     setSelectedUser(user);
    //     setUserFormOpen(true);
    // };

    // const handleDeleteUser = (user) => {
    //     setSelectedUser(user);
    //     setDeleteModalOpen(true);
    // };


    const handleNewUser = () => {
        // Implement new user functionality
        console.log('Add new user');
    };

    const handleEditUser = (user) => {
        // Implement edit user functionality
        console.log('Edit user:', user);
    };

    const handleDeleteUser = async (user) => {
        // Implement delete user functionality
        if (window.confirm(`Are you sure you want to delete ${user.firstname} ${user.lastname}?`)) {
            try {
                await axios.delete(`${api}/admin/users/${user._id}`, {
                    withCredentials: true
                });
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the user list
            } catch (err) {
                console.error('Error deleting user:', err);
                toast.error('Failed to delete user');
            }
        }
    }


    const handleUserFormSubmit = (userData) => {
        if (selectedUser) {
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, ...userData } : user
            ));
            toast({
                title: "User updated",
                description: `${userData.name} has been updated successfully.`,
            });
        } else {
            const newUser = { id: String(Date.now()), ...userData };
            setUsers([newUser, ...users]);
            toast({
                title: "User created",
                description: `${userData.name} has been added successfully.`,
            });
        }

        setUserFormOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedUser) {
            setUsers(users.filter(user => user.id !== selectedUser.id));
            toast({
                title: "User deleted",
                description: `${selectedUser.name} has been deleted.`,
                variant: "destructive",
            });
            setDeleteModalOpen(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 animate-fade-in">User Management</h1>
            </div>

            <div className="animate-fade-in">
                <UsersTable
                    users={users} // Pass fetched users to UsersTable
                    onNewUser={handleNewUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                />
            </div>

            <UserFormModal
                open={userFormOpen}
                onClose={() => setUserFormOpen(false)}
                onSubmit={handleUserFormSubmit}
                user={selectedUser}
            />

            <DeleteUserModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                user={selectedUser}
            />
        </>
    );
}

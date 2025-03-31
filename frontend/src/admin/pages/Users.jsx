import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '../layout/Layout';
import { UsersTable } from '../usersData/UserTable';
import { UserFormModal } from '../usersData/UserFormModal';
import { DeleteUserModal } from '../usersData/DeleteUserModal';
import { useToast } from '../../hooks/useToast';
import axios from 'axios';
import { api } from '../../lib/apiCall';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/DropDownMenu';
import { Button } from '../../ui/Button';
import { Filter } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [usersPerPage] = useState(parseInt(searchParams.get('limit')) || 5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            // Build query parameters
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', usersPerPage.toString());
            
            // Only add search if it exists
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            }
            
            // Only add filter if it's not 'all'
            if (filter && filter !== 'all') {
                params.set('filter', filter);
            }

            // Make API request
            const response = await axios.get(`${api}/admin/users?${params}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
            setTotalUsers(response.data.pagination.totalUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchQuery(value);
            setCurrentPage(1);
            const params = new URLSearchParams(searchParams);
            params.set('search', value);
            params.set('page', '1');
            setSearchParams(params);
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (event) => {
        const value = event.target.value;
        debouncedSearch(value);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
        
        // Update URL params
        const params = new URLSearchParams(searchParams);
        params.set('filter', newFilter);
        params.set('page', '1');
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        setSearchParams(params);
    };

    // Update useEffect to properly initialize from URL
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const searchParam = searchParams.get('search');
        const filterParam = searchParams.get('filter');

        if (pageParam) setCurrentPage(parseInt(pageParam));
        if (searchParam) setSearchQuery(searchParam);
        if (filterParam) setFilter(filterParam);
        
        // Initial fetch
        fetchUsers();
    }, []); // Run only once on mount

    // Update effect to watch for search params changes
    useEffect(() => {
        fetchUsers();
    }, [searchParams]); // Fetch when URL params change

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
    };

    const Pagination = () => (
        <div className="flex justify-center gap-2 mt-4">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
            >
                Previous
            </button>
            <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
            >
                Next
            </button>
        </div>
    );

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 animate-fade-in">
                    User Management
                </h1>
                <div className="mt-4 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-4 py-2 border rounded-lg w-full max-w-md"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10">
                                <Filter className="h-4 w-4 mr-2" />
                                {filter === 'all' ? 'All Users' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Users`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                                All Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('active')}>
                                Active Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('banned')}>
                                Banned Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('verified')}>
                                Verified Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterChange('unverified')}>
                                Unverified Users
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="animate-fade-in">
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <>
                        <UsersTable
                            users={users}
                            onNewUser={handleNewUser}
                            onEditUser={handleEditUser}
                            onDeleteUser={handleDeleteUser}
                        />
                        <Pagination />
                    </>
                )}
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

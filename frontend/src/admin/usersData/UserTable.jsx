import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../ui/Table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/DropDownMenu';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import {
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Search,
    Filter,
    UserPlus
} from 'lucide-react';
import { cn } from '../../lib/util';
import axios from 'axios';
import { toast } from 'sonner'; // Assuming you're using sonner for toast notifications
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../ui/AlertDialog';

// Define the API base URL - replace with your actual API URL
const API_BASE_URL = 'http://localhost:7000/api'; // Adjust this to match your backend URL

export function UsersTable({ users: initialUsers, onNewUser, onEditUser, onDeleteUser, onUserUpdated }) {
    const [users, setUsers] = useState(initialUsers || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        userId: null,
        newStatus: null,
        userName: ''
    });

    useEffect(() => {
        if (initialUsers) {
            setUsers(initialUsers);
        }
    }, [initialUsers]); // Add dependency to ensure effect runs when initialUsers changes

    const handleStatusChange = async (userId, newStatus) => {
        setIsLoading(true);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${userId}/status`,
                { status: newStatus },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );

            // Update local state
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, status: newStatus } : user
                )
            );

            // Show success message
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'banned'} successfully`);

            // Notify parent component that a user was updated (if callback exists)
            if (onUserUpdated) {
                onUserUpdated(userId, newStatus);
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            const errorMessage = error.response?.data?.message ||
                "Failed to update user status. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChangeClick = (user) => {
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        setConfirmationDialog({
            isOpen: true,
            userId: user._id,
            newStatus,
            userName: `${user.firstname} ${user.lastname}`
        });
    };

    const handleConfirmStatusChange = async () => {
        const { userId, newStatus } = confirmationDialog;
        await handleStatusChange(userId, newStatus);
        setConfirmationDialog({ isOpen: false, userId: null, newStatus: null, userName: '' });
    };

    // Filter users based on search term and filter
    const filteredUsers = users.filter(user => {
        // Search filter - fixed typo in lastname
        const matchesSearch =
            user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesFilter =
            filter === 'all' ||
            (filter === 'active' && user.status === 'active') ||
            (filter === 'banned' && user.status === 'banned') ||
            (filter === 'verified' && user.isVerified) ||  // Changed to match schema property name
            (filter === 'unverified' && !user.isVerified); // Changed to match schema property name

        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-elevation-2 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative w-full md:w-auto md:flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-10 h-10 bg-gray-50 focus:bg-white transition-all w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setFilter('all')}>
                                    All Users
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('active')}>
                                    Active Users
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('banned')}>
                                    Banned Users
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('verified')}>
                                    Verified Users
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('unverified')}>
                                    Unverified Users
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            className="h-10 bg-blue hover:bg-blue-dark transition-colors"
                            onClick={onNewUser}
                            disabled={isLoading}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            New User
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="text-left">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="hidden md:table-cell">Verified</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium">{user.firstname} {user.lastname}</div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {user.isVerified ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-gray-300" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                user.status === 'active' ? 'bg-green-light text-green-dark' : 'bg-red-light text-red-dark'
                                            )}>
                                                {user.status === 'active' ? 'Active' : 'Banned'}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChangeClick(user)}
                                                        className={user.status === 'active' ? "text-red-500" : "text-green-500"}
                                                    >
                                                        {user.status === 'active' ? 'Ban User' : 'Unban User'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Search className="h-8 w-8 mb-2 text-gray-300" />
                                            <p>No users found</p>
                                            <p className="text-sm">Try adjusting your search or filter</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog
                open={confirmationDialog.isOpen}
                onOpenChange={(isOpen) => setConfirmationDialog(prev => ({ ...prev, isOpen }))}
            >
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmationDialog.newStatus === 'banned'
                                ? 'Ban User'
                                : 'Unban User'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {confirmationDialog.newStatus === 'banned' ? 'ban' : 'unban'} {confirmationDialog.userName}?
                            {confirmationDialog.newStatus === 'banned'
                                ? ' This will prevent them from accessing their account.'
                                : ' This will restore their account access.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-end gap-3">
                        <AlertDialogCancel className="mb-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmStatusChange}
                            className={cn(
                                "mb-0",
                                confirmationDialog.newStatus === 'banned'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                            )}
                        >
                            {confirmationDialog.newStatus === 'banned' ? 'Ban User' : 'Unban User'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >
        </>
    );
}
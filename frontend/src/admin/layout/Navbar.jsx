import React, { useState, useEffect } from 'react';
import { Bell, Search, Globe, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/util';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { MobileSidebarTrigger } from './Sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/DropDownMenu';
import { logoutAdmin } from '../../redux/api/adminApi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { clearAdminInfo, setAdminInfo } from '../../redux/slices/adminSlice';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export function Navbar({ onMobileMenuClick }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const adminData = useSelector(state => state.admin.data);
    const isAuthenticated = useSelector(state => state.admin.isAuthenticated);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    // Check authentication status and redirect if needed
    useEffect(() => {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        if (!adminInfo) {
            navigate('/admin/signin');
        }
    }, [isAuthenticated, navigate]);


    useEffect(() => {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        const jwt = localStorage.getItem('jwt');

        if (adminInfo && jwt) {
            dispatch(setAdminInfo(adminInfo));
        }

    }, [dispatch]);


    const handleLogout = () => {
        setShowLogoutConfirmation(true);
    };

    const confirmLogout = () => {
        logoutAdmin()
            .then(() => {
                dispatch(clearAdminInfo());
                localStorage.removeItem('adminInfo');
                localStorage.removeItem('jwt');
                navigate('/admin/signin');
            })
            .catch(error => {
                console.error('Logout failed:', error);
                dispatch(clearAdminInfo());
                localStorage.removeItem('adminInfo');
                localStorage.removeItem('jwt');
                navigate('/admin/signin');
            });
        setShowLogoutConfirmation(false);
    };

    return (
        <>
            <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-100 shadow-subtle">
                <div className={cn(
                    "px-4 h-16 flex items-center justify-between transition-all",
                    searchOpen ? "md:justify-center" : ""
                )}>
                    {/* Left side */}
                    <div className={cn(
                        "flex items-center",
                        searchOpen ? "hidden md:flex" : "flex"
                    )}>
                        <MobileSidebarTrigger onClick={onMobileMenuClick} />
                        <span className="hidden ml-4 text-lg font-medium md:block">
                            Welcome {adminData?.firstname || 'Admin'} 👋
                        </span>
                    </div>

                    {/* Search - Desktop */}
                    <div className={cn(
                        "hidden md:block",
                        searchOpen ? "w-full max-w-xl" : "w-80",
                    )}>
                        {/* Search input removed for brevity */}
                    </div>

                    {/* Right side */}
                    <div className={cn(
                        "flex items-center space-x-3",
                        searchOpen ? "hidden md:flex" : "flex"
                    )}>
                        {/* Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                    
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">{adminData?.firstname || ''} {adminData?.lastname || ''}</p>
                                        <p className="text-xs text-gray-500">{adminData?.email || ''}</p>
                                    </div>
                                    <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white text-black">
                                {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem> */}
                                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Search Input (Overlay) */}
                    {searchOpen && (
                        <div className="absolute inset-0 bg-white p-4 z-10 flex md:hidden animate-fade-in">
                            {/* Mobile search input removed for brevity */}
                        </div>
                    )}
                </div>
            </header>

            <ConfirmationModal
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={confirmLogout}
            />
        </>
    );
}
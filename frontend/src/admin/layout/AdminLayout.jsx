import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { useSelector } from 'react-redux';

export function AdminLayout() {
    const navigate = useNavigate();
    const adminData = useSelector(state => state.admin.data);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for admin authentication from multiple sources
        const adminInfo = localStorage.getItem('adminInfo');
        
        if (!adminData && !adminInfo) {
            // No admin in Redux state or localStorage
            navigate('/admin/signin');
            return;
        }
        
        setIsAuthenticated(true);
    }, [adminData, navigate]);

    // Don't render anything until authentication is confirmed
    if (!isAuthenticated) {
        return null;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
} 
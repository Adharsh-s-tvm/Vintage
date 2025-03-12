import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from './Layout';

export function AdminLayout() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
} 
import React from 'react';
import { Layout } from '../layout/Layout';

export default function Blog() {
    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-4">Blog Page</h1>
                    <p className="text-gray-500 mb-6">This page is coming soon.</p>
                </div>
            </div>
        </Layout>
    );
} 
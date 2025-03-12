import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Layout } from '../admin/layout/Layout';

export default function NotFound({ redirectPageType }) {
    const location = useLocation();

    const redirectPath = redirectPageType == 'admin' ? '/admin' : '/'

    return (
        // <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-md mx-auto">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-red-light mb-6 animate-fade-in">
                <AlertCircle className="h-12 w-12 text-red" />
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red to-red-dark animate-fade-in">
                404
            </h1>

            <p className="text-xl font-medium text-gray-800 mb-2 animate-fade-in">
                Page Not Found
            </p>

            <p className="text-gray-500 mb-8 animate-fade-in">
                We couldn't find the page you were looking for. The URL <code className="px-2 py-1 bg-gray-100 rounded text-sm">{location.pathname}</code> may be incorrect or the page has been moved.
            </p>

            <Button
                asChild
                className="bg-blue hover:bg-blue-dark transition-colors animate-fade-in"
            >
                <Link to={redirectPath}>
                    Return
                </Link>
            </Button>
        </div>
        // </Layout>
    );
} 
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function Layout({ children }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <Sidebar
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 md:hidden animate-fade-in"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen md:ml-64">
                <Navbar onMobileMenuClick={toggleMobileSidebar} />

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>

                <footer className="py-4 px-6 border-t border-gray-100 text-center text-sm text-gray-500">
                    © 2023 Admin Dashboard. All rights reserved.
                </footer>
            </div>
        </div>
    );
} 
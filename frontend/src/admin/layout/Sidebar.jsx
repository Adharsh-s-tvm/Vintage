import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    LayoutDashboard,
    Users,
    ShoppingBag,
    FileText,
    LogIn,
    AlertCircle,
    Crown,
    Menu,
    Car,
    Ticket,
    Bus
} from 'lucide-react';
import { cn } from '../../lib/util';
import { Button } from '../../ui/Button';
import { BrandingWatermark, BrandingWatermarkOutlined, BrandingWatermarkRounded, BrandingWatermarkSharp, BrandingWatermarkTwoTone, Category, CategoryRounded, ListAlt, Percent, PersonAddAltRounded, ProductionQuantityLimitsSharp, WaterDamageOutlined, WidthNormalOutlined } from '@mui/icons-material';

export function Sidebar({ className, mobileOpen, onMobileClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const closeOnMobile = () => {
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
    };

    const navItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/admin',
            exact: true
        },
        {
            icon: Users,
            label: 'Users',
            path: '/admin/users'
        },
        {
            icon: ShoppingBag,
            label: 'Products',
            path: '/admin/products',
            badge: {
                // count: 24,
                color: 'badge-info'
            }
        },
        {
            icon: CategoryRounded,
            label: 'Category',
            path: '/admin/category',
            badge: {
                // count: 24,
                color: 'badge-info'
            }
        },
        {
            icon: BrandingWatermarkRounded,
            label: 'Brand',
            path: '/admin/brand',
            badge: {
                // count: 24,
                color: 'badge-info'
            }
        },
        {
            icon: ListAlt,
            label: 'Orders',
            path: '/admin/orders'
        },
        {
            icon: Bus,
            label: 'Returns',
            path: '/admin/returns'
        },
        {
            icon: Percent,
            label: 'Offers',
            path: '/admin/offers'
        },
        {
            icon: Ticket,
            label: 'Coupons',
            path: '/admin/coupons'
        },
    ];

    return (
        <aside
            className={cn(
                "fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col",
                collapsed ? "w-20" : "w-64",
                mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                "bg-white border-r border-gray-100 shadow-subtle",
                className
            )}
        >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
                <Link to="/admin" className="flex items-center" onClick={closeOnMobile}>
                    {!collapsed && (
                        <span className="text-xl font-semibold text-gray-900 animate-fade-in p-10">Admin </span>
                    )}
                    {collapsed && <span className="text-xl font-semibold">A</span>}
                </Link>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className="hidden md:flex"
                    >
                        <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeOnMobile}
                        className="md:hidden"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive =
                            item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={closeOnMobile}
                                    className={cn(
                                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                                        isActive
                                            ? "text-primary bg-blue-light"
                                            : "text-gray-700 hover:text-primary hover:bg-gray-50",
                                    )}
                                >
                                    <item.icon className={cn("flex-shrink-0 w-5 h-5 transition-all",
                                        isActive ? "text-primary" : "text-gray-500"
                                    )} />

                                    {!collapsed && (
                                        <span className="ms-3 whitespace-nowrap">{item.label}</span>
                                    )}

                                    {!collapsed && item.badge && (
                                        <span
                                            className={cn(
                                                "ms-auto",
                                                item.badge.color
                                            )}
                                        >
                                            {item.badge.count}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* <div className={cn(
                "p-4 border-t border-gray-100",
                collapsed ? "items-center" : ""
            )}>
                <div className={cn(
                    "p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100",
                    collapsed ? "p-2" : ""
                )}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center mb-2">
                                <Crown className="h-5 w-5 text-blue animate-float" />
                                <h5 className="ml-2 font-medium text-gray-900">Pro Upgrade</h5>
                            </div>
                            <p className="mb-2 text-xs text-gray-600">Get 6 months free with annual billing</p>
                            <Button
                                className="w-full bg-gradient-to-r from-blue to-blue-dark hover:opacity-90 transition-opacity"
                            >
                                Upgrade Now
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Crown className="h-5 w-5 text-blue animate-float" />
                            <Button
                                size="icon"
                                className="mt-2 bg-gradient-to-r from-blue to-blue-dark hover:opacity-90 transition-opacity"
                            >
                                <Crown className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div> */}
        </aside>
    );
}

export function MobileSidebarTrigger({ onClick }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="md:hidden"
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
} 
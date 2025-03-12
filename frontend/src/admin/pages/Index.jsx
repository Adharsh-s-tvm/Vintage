import React from 'react';
import { Layout } from '../layout/Layout';
import { StatsCard } from '../dashboard/StatsCard';
import { PieChartCard } from '../dashboard/PieChartCard';
import { BarChartCard } from '../dashboard/BarChartCard';
import { ShoppingBag, Users, ShoppingCart, MessageCircle } from 'lucide-react';

const visitsData = [
    { name: 'North America', value: 35, color: '#4E80EE' },
    { name: 'Europe', value: 30, color: '#8B5CF6' },
    { name: 'Asia', value: 25, color: '#F59E0B' },
    { name: 'Africa', value: 10, color: '#EF4444' },
];

const websiteVisitsData = [
    { name: 'Jan', teamA: 35, teamB: 28 },
    { name: 'Feb', teamA: 45, teamB: 31 },
    { name: 'Mar', teamA: 40, teamB: 35 },
    { name: 'Apr', teamA: 30, teamB: 40 },
    { name: 'May', teamA: 48, teamB: 42 },
    { name: 'Jun', teamA: 52, teamB: 48 },
];

export default function Dashboard() {
    return (
        <>
            {/* <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 animate-fade-in">Dashboard</h1>
                <p className="text-gray-500 mt-1 animate-fade-in">Overview of your business performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-fade-in">
                <StatsCard
                    title="Total Sales"
                    value="714K"
                    icon={<ShoppingBag />}
                    change={{ value: 2.5, trend: 'up' }}
                    color="blue"
                    sparklineData={[3, 7, 5, 9, 6, 8, 7]}
                />
                <StatsCard
                    title="Active Users"
                    value="1.35M"
                    icon={<Users />}
                    change={{ value: 8.1, trend: 'up' }}
                    color="purple"
                    sparklineData={[5, 3, 8, 6, 9, 11, 14]}
                />
                <StatsCard
                    title="Orders"
                    value="1.72M"
                    icon={<ShoppingCart />}
                    change={{ value: 1.2, trend: 'down' }}
                    color="yellow"
                    sparklineData={[9, 7, 6, 5, 8, 7, 6]}
                />
                <StatsCard
                    title="Messages"
                    value="234"
                    icon={<MessageCircle />}
                    change={{ value: 4.7, trend: 'up' }}
                    color="red"
                    sparklineData={[2, 4, 3, 6, 8, 9, 7]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in">
                <PieChartCard
                    title="Current Visits"
                    data={visitsData}
                />
                <BarChartCard
                    title="Website Visits"
                    data={websiteVisitsData}
                />
            </div> */}
        </>
    );
} 
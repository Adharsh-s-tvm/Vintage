import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { cn } from '../../lib/util';

export function BarChartCard({ title, data, className }) {
    // Transform data for the chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-IN', { 
            day: 'numeric',
            month: 'short'
        }),
        Sales: item.sales,
        Orders: item.orders
    }));

    return (
        <div className={cn(
            "rounded-xl p-5 bg-white border border-gray-100 shadow-elevation-2 transition-all hover:shadow-elevation-3 h-full",
            className
        )}>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>

            <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Sales" fill="#4F46E5" />
                        <Bar yAxisId="right" dataKey="Orders" fill="#8B5CF6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 
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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-sm rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <p key={index} className="text-sm text-gray-600">
                        {pld.name}: {pld.name === 'Sales' ? '₹' : ''}{pld.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

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
            "rounded-xl p-5 bg-white border border-gray-100 shadow-elevation-2 h-full",
            className
        )}>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>

            <div className="h-[450px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: 'rgba(0, 0, 0, 0.01)' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Sales" fill="#4F46E5" />
                        <Bar yAxisId="right" dataKey="Orders" fill="#8B5CF6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 
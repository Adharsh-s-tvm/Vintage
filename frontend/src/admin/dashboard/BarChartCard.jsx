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
    return (
        <div className={cn(
            "rounded-xl p-5 bg-white border border-gray-100 shadow-elevation-2 transition-all hover:shadow-elevation-3 h-full",
            className
        )}>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>

            <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e0e0e0' }}
                            tickFormatter={(value) => `${value}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '0.5rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                padding: '10px',
                                border: 'none'
                            }}
                            formatter={(value) => [`${value}k`, undefined]}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                                <span className="text-sm font-medium text-gray-700">{value}</span>
                            )}
                        />
                        <Bar dataKey="teamA" name="Team A" fill="#4E80EE" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="teamB" name="Team B" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 
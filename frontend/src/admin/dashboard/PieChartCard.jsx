import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '../../lib/util';

export function PieChartCard({ title, data, className }) {
    return (
        <div className={cn(
            "rounded-xl p-5 bg-white border border-gray-100 shadow-elevation-2 transition-all hover:shadow-elevation-3 h-full",
            className
        )}>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>

            <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            contentStyle={{
                                borderRadius: '0.5rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                padding: '10px',
                                border: 'none'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                                <span className="text-sm font-medium text-gray-700">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 
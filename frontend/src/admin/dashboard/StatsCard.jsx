import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/util';

export function StatsCard({ title, value, icon, change, color, sparklineData = [3, 7, 5, 9, 6, 8, 7] }) {
    const colorStyles = {
        blue: {
            bgLight: 'bg-blue-light',
            iconBg: 'bg-blue/10',
            iconColor: 'text-blue',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600',
        },
        purple: {
            bgLight: 'bg-purple-light',
            iconBg: 'bg-purple/10',
            iconColor: 'text-purple',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600',
        },
        yellow: {
            bgLight: 'bg-yellow-light',
            iconBg: 'bg-yellow/10',
            iconColor: 'text-yellow',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600',
        },
        red: {
            bgLight: 'bg-red-light',
            iconBg: 'bg-red/10',
            iconColor: 'text-red',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600',
        },
    };

    const styles = colorStyles[color];

    // Generate sparkline path
    const maxValue = Math.max(...sparklineData);
    const minValue = Math.min(...sparklineData);
    const range = maxValue - minValue;

    // Normalize data to values between 0 and 1
    const normalizedData = sparklineData.map(value => 1 - (value - minValue) / (range || 1));

    // Generate the path
    let path = '';
    const width = 60; // Width of the sparkline
    const height = 20; // Height of the sparkline
    const segmentWidth = width / (sparklineData.length - 1);

    normalizedData.forEach((point, i) => {
        const x = i * segmentWidth;
        const y = point * height;
        if (i === 0) {
            path += `M${x},${y}`;
        } else {
            path += ` L${x},${y}`;
        }
    });

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl p-5 shadow-elevation-2 transition-all hover:shadow-elevation-3",
            "bg-white border border-gray-100",
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h4 className="mt-2 text-2xl font-bold tracking-tight">{value}</h4>
                </div>
                <div className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-lg",
                    styles.iconBg
                )}>
                    <div className={cn("h-6 w-6", styles.iconColor)}>
                        {icon}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    {change.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                        className={cn(
                            "text-sm font-medium",
                            change.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        )}
                    >
                        {Math.abs(change.value)}%
                    </span>
                </div>

                {/* Mini sparkline */}
                <svg width="60" height="20" className="text-gray-300">
                    <path
                        d={path}
                        fill="none"
                        stroke={change.trend === 'up' ? '#10B981' : '#EF4444'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* Background decoration */}
            <div className={cn(
                "absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-10",
                color === 'blue' ? 'bg-blue' :
                    color === 'purple' ? 'bg-purple' :
                        color === 'yellow' ? 'bg-yellow' :
                            'bg-red'
            )} />
        </div>
    );
} 
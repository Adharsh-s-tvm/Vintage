import Order from '../../models/product/orderModel.js';

export const getSalesReport = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        let dateFilter = {};

        // Set date filter based on range
        switch (range) {
            case 'daily':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dateFilter = {
                    createdAt: {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                };
                break;
            case 'weekly':
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);
                dateFilter = {
                    createdAt: {
                        $gte: weekStart,
                        $lt: new Date()
                    }
                };
                break;
            case 'monthly':
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                dateFilter = {
                    createdAt: {
                        $gte: monthStart,
                        $lt: new Date()
                    }
                };
                break;
            case 'yearly':
                const yearStart = new Date(new Date().getFullYear(), 0, 1);
                dateFilter = {
                    createdAt: {
                        $gte: yearStart,
                        $lt: new Date()
                    }
                };
                break;
            case 'custom':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)
                    }
                };
                break;
        }

        // Debug logs
        console.log('Query Parameters:', { range, startDate, endDate });
        console.log('Date Filter:', dateFilter);

        // First check if we have any orders at all
        const totalOrders = await Order.countDocuments({});
        console.log('Total orders in database:', totalOrders);

        // Check orders within date range
        const ordersInRange = await Order.countDocuments(dateFilter);
        console.log('Orders in date range:', ordersInRange);

        // Check completed payments
        const completedPayments = await Order.countDocuments({
            ...dateFilter,
            'payment.status': 'completed'
        });
        console.log('Completed payments in range:', completedPayments);

        // Get stats
        const stats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { 
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$payment.status', 'completed'] },
                                    { $not: { $in: ['$orderStatus', ['Cancelled', 'Returned']] } }
                                ]},
                                '$totalAmount',
                                0
                            ]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'Pending'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
                    },
                    returnedOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'Returned'] }, 1, 0] }
                    }
                }
            }
        ]);

        console.log('Aggregation Results:', stats);

        // Get sales data for chart with proper date formatting
        const salesData = await Order.aggregate([
            { 
                $match: {
                    ...dateFilter,
                    'payment.status': 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: '%Y-%m-%d', 
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'  // Adjust timezone as needed
                        }
                    },
                    sales: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get recent transactions
        const transactions = await Order.find(dateFilter)
            .select('orderId totalAmount payment createdAt orderStatus')
            .sort('-createdAt')
            .limit(10);

        // Send response with default values if no stats found
        res.json({
            stats: stats[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                pendingOrders: 0,
                cancelledOrders: 0,
                returnedOrders: 0
            },
            salesData: salesData.map(item => ({
                date: item._id,
                sales: item.sales,
                orders: item.orders
            })),
            transactions: transactions.map(t => ({
                _id: t._id,
                orderId: t.orderId,
                amount: t.totalAmount,
                paymentMethod: t.payment.method,
                status: t.orderStatus,
                createdAt: t.createdAt
            }))
        });

    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(500).json({ message: 'Failed to generate sales report' });
    }
}; 
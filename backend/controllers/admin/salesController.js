import Order from '../../models/product/orderModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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
                                { $eq: ['$orderStatus', 'Delivered'] },
                                {
                                    $sum: {
                                        $map: {
                                            input: '$items',
                                            as: 'item',
                                            in: {
                                                $cond: [
                                                    {
                                                        $and: [
                                                            { $ne: ['$orderStatus', 'Cancelled'] },
                                                            { $ne: ['$$item.status', 'Returned'] }
                                                        ]
                                                    },
                                                    '$totalAmount',
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    returnedOrders: {
                        $sum: {
                            $cond: [
                                { $gt: [{ 
                                    $size: { 
                                        $filter: { 
                                            input: "$items",
                                            as: "item",
                                            cond: { $eq: ["$$item.status", "Returned"] }
                                        }
                                    }
                                }, 0] },
                                1,
                                0
                            ]
                        }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
                    },
                    totalDiscounts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$orderStatus', 'Cancelled'] },
                                        {
                                            $not: {
                                                $gt: [{
                                                    $size: {
                                                        $filter: {
                                                            input: '$items',
                                                            as: 'item',
                                                            cond: { $eq: ['$$item.status', 'Returned'] }
                                                        }
                                                    }
                                                }, 0]
                                            }
                                        }
                                    ]
                                },
                                {
                                    $reduce: {
                                        input: "$items",
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                "$$value",
                                                {
                                                    $subtract: [
                                                        { $multiply: ["$$this.price", "$$this.quantity"] },
                                                        "$$this.finalPrice"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                0
                            ]
                        }
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
                    orderStatus: 'Delivered'
                }
            },
            {
                $project: {
                    createdAt: 1,
                    items: {
                        $filter: {
                            input: '$items',
                            as: 'item',
                            cond: { $ne: ['$$item.status', 'Returned'] }
                        }
                    },
                    payment: 1
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: '%Y-%m-%d', 
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'
                        }
                    },
                    sales: {
                        $sum: {
                            $reduce: {
                                input: '$items',
                                initialValue: 0,
                                in: { $add: ['$$value', '$$this.finalPrice'] }
                            }
                        }
                    },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        

        // Get recent transactions
        const transactions = await Order.find(dateFilter)
            .select('orderId totalAmount payment createdAt orderStatus items.status items.returnStatus')
            .sort('-createdAt')
            .limit(10);

        // Send response with default values if no stats found
        res.json({
            stats: stats[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                returnedOrders: 0,
                cancelledOrders: 0,
                totalDiscounts: 0
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
                status: t.items.some(item => 
                    item.status === 'Returned' || 
                    item.returnStatus === 'Refunded' || 
                    item.returnStatus === 'Return Approved'
                ) ? 'Returned' : t.orderStatus,
                createdAt: t.createdAt
            }))
        });

    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(500).json({ message: 'Failed to generate sales report' });
    }
};


export const downloadSalesReport = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        let dateFilter = {};

        // Reuse the same date filter logic from getSalesReport
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

        const stats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$orderStatus', 'Delivered'] },
                                '$totalAmount',
                                0
                            ]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    returnedOrders: {
                        $sum: {
                            $cond: [{ $eq: ['$orderStatus', 'Returned'] }, 1, 0]
                        }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
                    },
                    totalDiscounts: {
                        $sum: '$discountAmount'
                    }
                }
            }
        ]);

        // Create PDF
        const doc = new PDFDocument();
        const filename = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        
        // Add date range
        doc.fontSize(12).text(`Period: ${range.charAt(0).toUpperCase() + range.slice(1)}`, { align: 'left' });
        if (range === 'custom') {
            doc.text(`From: ${new Date(startDate).toLocaleDateString()}`);
            doc.text(`To: ${new Date(endDate).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Add statistics
        const reportStats = stats[0] || {
            totalRevenue: 0,
            totalOrders: 0,
            returnedOrders: 0,
            cancelledOrders: 0,
            totalDiscounts: 0
        };

        doc.fontSize(14).text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total Revenue: ₹${reportStats.totalRevenue.toFixed(2)}`);
        doc.text(`Total Orders: ${reportStats.totalOrders}`);
        doc.text(`Returned Orders: ${reportStats.returnedOrders}`);
        doc.text(`Cancelled Orders: ${reportStats.cancelledOrders}`);
        doc.text(`Total Discounts: ₹${reportStats.totalDiscounts.toFixed(2)}`);

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Failed to generate PDF report' });
    }
};
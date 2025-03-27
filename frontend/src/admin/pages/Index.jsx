import React, { useState, useEffect } from 'react';
import { Layout } from '../layout/Layout';
import { StatsCard } from '../dashboard/StatsCard';
import { PieChartCard } from '../dashboard/PieChartCard';
import { BarChartCard } from '../dashboard/BarChartCard';
import { ShoppingBag, ShoppingCart, Clock, XCircle, Tag } from 'lucide-react';
import axios from 'axios';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/Select";
import { DatePicker } from "../../ui/DatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import { Button } from "../../ui/Button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/Pagination";

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
    const [dateRange, setDateRange] = useState('monthly');
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalReturns: 0,
        cancelledOrders: 0,
        totalDiscounts: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(25);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchSalesData();
    }, [dateRange, customStartDate, customEndDate, currentPage]);

    const fetchSalesData = async () => {
        try {
            setLoading(true);
            let params = { 
                range: dateRange,
                page: currentPage,
                limit: itemsPerPage
            };
            if (dateRange === 'custom') {
                params.startDate = customStartDate.toISOString();
                params.endDate = customEndDate.toISOString();
            }

            console.log('Fetching sales data with params:', params);
            const response = await axios.get(`${api}/admin/sales-report`, {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });

            console.log('API Response:', response.data);

            if (response.data) {
                const { stats, salesData, transactions, totalPages: total } = response.data;
                console.log('Received stats:', stats);
                setStats(stats || {
                    totalRevenue: 0,
                    totalOrders: 0,
                    pendingOrders: 0,
                    processingOrders: 0,
                    cancelledOrders: 0,
                    totalDiscounts: 0
                });
                setSalesData(salesData || []);
                setTransactions(transactions || []);
                setTotalPages(total || 1);
            }
        } catch (error) {
            console.error('Error details:', error.response || error);
            toast.error(error.response?.data?.message || 'Failed to fetch sales data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            let params = { 
                range: dateRange,
                format: 'pdf'
            };
            if (dateRange === 'custom') {
                params.startDate = customStartDate.toISOString();
                params.endDate = customEndDate.toISOString();
            }

            const response = await axios({
                url: `${api}/admin/sales-report/download`,
                method: 'GET',
                params,
                responseType: 'blob',
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                    'Accept': 'application/pdf'
                }
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            let params = { range: dateRange };
            if (dateRange === 'custom') {
                params.startDate = customStartDate.toISOString();
                params.endDate = customEndDate.toISOString();
            }

            const response = await axios({
                url: `${api}/admin/sales-report/download`,
                method: 'GET',
                params,
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>

                {dateRange === 'custom' && (
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selected={customStartDate}
                            onChange={setCustomStartDate}
                            placeholderText="Start date"
                        />
                        <DatePicker
                            selected={customEndDate}
                            onChange={setCustomEndDate}
                            placeholderText="End date"
                        />
                    </div>
                )}

                <div className="flex gap-2 ml-auto">
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownloadExcel}
                    >
                        Download Excel
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <StatsCard
                            title="Total Revenue"
                            value={stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : '₹0'}
                            icon={<ShoppingBag />}
                            color="blue"
                        />
                        <StatsCard
                            title="Total Orders"
                            value={stats.totalOrders || 0}
                            icon={<ShoppingCart />}
                            color="purple"
                        />
                        <StatsCard
                            title="Returned Orders"
                            value={stats.returnedOrders || 0}
                            icon={<Clock />}
                            color="yellow"
                        />
                        <StatsCard
                            title="Cancelled Orders"
                            value={stats.cancelledOrders || 0}
                            icon={<XCircle />}
                            color="red"
                        />
                        <StatsCard
                            title="Total Discounts"
                            value={stats?.totalDiscounts ? `₹${stats.totalDiscounts.toLocaleString()}` : '₹0'}
                            icon={<Tag />}
                            color="green"
                        />
                    </div>

                    <div className="mb-6">
                        <BarChartCard
                            title="Sales Overview"
                            data={salesData}
                            className="h-[500px]"
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Financial Ledger</h2>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction._id}>
                                            <TableCell>
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{transaction._id}</TableCell>
                                            <TableCell>Order #{transaction.orderId}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 ${
                                                    transaction.status === 'Cancelled' 
                                                        ? 'bg-red-100 text-red-800'
                                                        : transaction.status === 'Returned' || transaction.status === 'Refunded'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                } rounded-full text-xs`}>
                                                    {transaction.status === 'Cancelled' 
                                                        ? '—' 
                                                        : transaction.status === 'Returned' || transaction.status === 'Refunded'
                                                            ? 'REFUND'
                                                            : 'CREDIT'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={
                                                    transaction.status === 'Cancelled' || 
                                                    transaction.status === 'Returned' || 
                                                    transaction.status === 'Refunded'
                                                        ? 'text-red-600' 
                                                        : 'text-gray-900'
                                                }>
                                                    ₹{transaction.amount.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>{transaction.paymentMethod}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    transaction.status === 'Cancelled' 
                                                        ? 'bg-red-100 text-red-800'
                                                        : transaction.status === 'Returned' || transaction.status === 'Refunded'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : transaction.status === 'Delivered'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {transaction.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            />
                                        </PaginationItem>
                                        
                                        {[...Array(totalPages)].map((_, index) => (
                                            <PaginationItem key={index + 1}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(index + 1)}
                                                    isActive={currentPage === index + 1}
                                                >
                                                    {index + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
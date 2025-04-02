import { privateAPI } from '../api';

export const fetchSalesDataApi = (params) => privateAPI.get('/admin/sales-report', { params });
export const downloadSalesReportApi = (params) => privateAPI.get(`/admin/sales-report/download`, {
    params,
    responseType: 'blob'
});

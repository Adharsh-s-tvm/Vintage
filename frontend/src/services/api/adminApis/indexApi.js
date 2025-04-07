import { API } from '../api';

export const fetchSalesDataApi = (params) => API.get('/admin/sales-report', { params });
export const downloadSalesReportApi = (params) => API.get(`/admin/sales-report/download`, {
    params,
    responseType: 'blob'
});

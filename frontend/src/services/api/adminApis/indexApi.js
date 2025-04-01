import { privateAPI } from '../api';

export const fetchSalesDataApi = () => privateAPI.get(`/admin/sales-report`);
export const downloadSalesReportApi = (params) => privateAPI.get(`/admin/sales-report/download`, {
    params,
    responseType: 'blob'
});

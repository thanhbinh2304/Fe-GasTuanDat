import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface ExportReceipt {
  id: number;
  code: string;
  createdAt: string;
  customerCode: string;
  customerName: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  notes: string;
  branch: string;
  creator: string;
  details?: any[];
}

export interface ExportReceiptListResponse {
  data: ExportReceipt[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExportReceiptFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  customerGroupId?: string;
  customerId?: string;
  gasBookId?: string;
  stockId?: string;
}

const formatCurrency = (amount: number) => {
  return amount.toString();
};

const MOCK_ORDERS: ExportReceipt[] = Array.from({ length: 45 }).map((_, i) => {
  const totalAmount = 5000000 + i * 150000;
  const discount = i % 4 === 0 ? 500000 : 0;
  const finalAmount = totalAmount - discount;
  const paidAmount = i % 3 === 0 ? finalAmount / 2 : finalAmount;

  return {
    id: i + 1,
    code: `PXH00${1000 + i}`,
    createdAt: new Date(Date.now() - i * 3600000 * 24).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    customerCode: `NCC00${(i % 5) + 1}`,
    customerName: `Công ty TNHH Cung Cấp ${i % 5 + 1}`,
    totalAmount,
    discount,
    finalAmount,
    paidAmount,
    notes: i % 3 === 0 ? 'Giao buổi sáng' : '',
    branch: i % 2 === 0 ? 'Kho trung tâm' : 'Chi nhánh 1',
    creator: i % 2 === 0 ? 'Admin' : 'Nhân viên 1',
  };
});

export const getExportReceipts = async (params: ExportReceiptFilterParams = {}): Promise<ExportReceiptListResponse> => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    
    let filtered = [...MOCK_ORDERS];
    
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(t => t.code.toLowerCase().includes(kw));
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 15;
    const start = (page - 1) * pageSize;
    
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize
    };
  }
  
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', new Date(`${params.startDate}T00:00:00`).toISOString());
  if (params.endDate) query.append('endDate', new Date(`${params.endDate}T23:59:59`).toISOString());
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize));
  if (params.customerGroupId) query.append('customerGroupId', params.customerGroupId);
  if (params.customerId) query.append('customerId', params.customerId);
  if (params.gasBookId) query.append('gasBookId', params.gasBookId);
  if (params.stockId) query.append('stockId', params.stockId);
  query.append('orderType', 'Xuathang');
  
  const response = await fetchClient(`/sale-invoices?${query.toString()}`, { method: 'GET' });
  const pageResult = response.data || response;
  const rawData: any[] = pageResult.content || [];
  
  const mappedData: ExportReceipt[] = rawData.map((item: any) => ({
    id: item.invoiceId,
    code: item.invoiceCode,
    createdAt: item.invoiceDate,
    customerCode: item.customerCode || (item.customerId ? `KH${item.customerId.substring(0, 6).toUpperCase()}` : (item.gasBookId ? `SG${item.gasBookId.substring(0, 6).toUpperCase()}` : '')),
    customerId: item.customerId || item.gasBookId,
    customerName: item.customerName || (item.gasBookId ? 'Sổ Gas (chờ lấy tên)' : 'Khách lẻ'),
    totalAmount: Number(item.totalAmount) || 0,
    discount: Number(item.discountAmount) || 0,
    finalAmount: (Number(item.totalAmount) || 0) - (Number(item.discountAmount) || 0),
    paidAmount: Number(item.paidAmount) || 0,
    notes: item.note || '',
    branch: item.stockId || '',
    creator: item.employeeId || '',
    details: item.details ? item.details.map((d: any) => ({
      id: d.productId,
      code: d.productCode,
      name: d.productName,
      unit: d.unit === 1 ? 'Bộ' : d.unit === 2 ? 'Cái' : d.unit === 3 ? 'Bình' : d.unit === 4 ? 'Bao' : 'Cái',
      qty: d.quantity,
      price: d.unitPrice,
      total: d.total
    })) : []
  }));
  
  return {
    data: mappedData,
    total: pageResult.totalElements || 0,
    page: pageResult.page || params.page || 1,
    pageSize: pageResult.size || params.pageSize || 15
  };
};

export const deleteExportReceipt = async (id: number | string): Promise<void> => {
  return fetchClient(`/sale-invoices/${id}`, {
    method: 'DELETE'
  });
};

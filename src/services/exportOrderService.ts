import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface ExportOrder {
  id: number | string;
  code: string;
  createdAt: string;
  customerCode: string;
  customerName: string;
  customerId?: string;
  gasBookId?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  notes: string;
  branch: string;
  stockId?: string;
  creator: string;
  employeeId?: string;
  orderType?: string;
  paymentMethod?: string;
  details?: any[];
}

export interface ExportOrderListResponse {
  data: ExportOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExportOrderFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  customerGroupId?: string;
  customerId?: string;
  gasBookId?: string;
  orderType?: string;
  stockId?: string;
}

export interface CustomerGroup {
  customerGroupId: string;
  groupName: string;
}

export const getCustomerGroups = async (): Promise<CustomerGroup[]> => {
  const res = await fetchClient('/customers/groups', { method: 'GET' });
  return res.data || res || [];
};

const formatCurrency = (amount: number) => {
  return amount.toString();
};

const MOCK_ORDERS: ExportOrder[] = Array.from({ length: 45 }).map((_, i) => {
  const totalAmount = 5000000 + i * 150000;
  const discount = i % 4 === 0 ? 500000 : 0;
  const finalAmount = totalAmount - discount;
  const paidAmount = i % 3 === 0 ? finalAmount / 2 : finalAmount;

  return {
    id: i + 1,
    code: `DHX00${1000 + i}`,
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

export const getExportOrders = async (params: ExportOrderFilterParams = {}): Promise<ExportOrderListResponse> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', new Date(`${params.startDate}T00:00:00`).toISOString());
  if (params.endDate) query.append('endDate', new Date(`${params.endDate}T23:59:59`).toISOString());
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize)); // API uses limit instead of pageSize
  if (params.customerGroupId) query.append('customerGroupId', params.customerGroupId);
  if (params.customerId) query.append('customerId', params.customerId);
  if (params.gasBookId) query.append('gasBookId', params.gasBookId);
  if (params.stockId) query.append('stockId', params.stockId);
  if (params.orderType) query.append('orderType', params.orderType);
  const response = await fetchClient(`/sale-invoices?${query.toString()}`, { method: 'GET' });
  
  // Backend wraps response as: { code, message, data: { content: [], totalElements, page, size, totalPages } }
  const pageResult = response.data || response;
  const rawData: any[] = pageResult.content || [];
  
  const mappedData: ExportOrder[] = rawData.map((item: any) => ({
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
    orderType: item.orderType || 'Xuathang',
    details: item.details ? item.details.map((d: any) => ({
      id: d.productId,
      code: d.productCode || 'N/A',
      name: d.productName,
      unit: d.unit === 1 ? 'Bộ' : d.unit === 2 ? 'Cái' : d.unit === 3 ? 'Bình' : d.unit === 4 ? 'Bao' : 'Cái',
      qty: d.quantity,
      price: Number(d.unitPrice),
      total: Number(d.total),
      stock: 0
    })) : [],
  }));

  return {
    data: mappedData,
    total: pageResult.totalElements ?? 0,
    page: pageResult.page ?? params.page ?? 1,
    pageSize: pageResult.size ?? params.pageSize ?? 15
  };
};

export const createExportOrder = async (order: Partial<ExportOrder>): Promise<ExportOrder> => {
  const payload = {
    invoiceCode: order.code,
    invoiceDate: order.createdAt || new Date().toISOString(),
    totalAmount: order.totalAmount,
    discountAmount: order.discount,
    paidAmount: order.paidAmount,
    note: order.notes,
    orderType: order.orderType || 'Dathang',
    paymentMethod: order.paymentMethod || 'Cashes',
    customerId: order.customerId,
    gasBookId: order.gasBookId,
    stockId: order.stockId,
    employeeId: order.employeeId,
    details: order.details || [],
  };
  const response = await fetchClient('/sale-invoices', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  const item: any = response.data || response;
  return {
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
    orderType: item.orderType || 'Xuathang',
    details: item.details ? item.details.map((d: any) => ({
      id: d.productId,
      code: d.productCode || 'N/A',
      name: d.productName,
      unit: d.unit === 1 ? 'Bộ' : d.unit === 2 ? 'Cái' : d.unit === 3 ? 'Bình' : d.unit === 4 ? 'Bao' : 'Cái',
      qty: d.quantity,
      price: Number(d.unitPrice),
      total: Number(d.total),
      stock: 0
    })) : [],
  };
};

export const updateExportOrder = async (id: number | string, order: Partial<ExportOrder>): Promise<ExportOrder> => {
  const payload = {
    invoiceCode: order.code,
    invoiceDate: order.createdAt || new Date().toISOString(),
    totalAmount: order.totalAmount,
    discountAmount: order.discount,
    paidAmount: order.paidAmount,
    note: order.notes,
    orderType: order.orderType || 'Dathang',
    paymentMethod: order.paymentMethod || 'Cashes',
    customerId: order.customerId,
    gasBookId: order.gasBookId,
    stockId: order.stockId,
    employeeId: order.employeeId,
    details: order.details || [],
  };
  const response = await fetchClient(`/sale-invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  
  const item: any = response.data || response;
  return {
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
    orderType: item.orderType || 'Xuathang',
    details: item.details ? item.details.map((d: any) => ({
      id: d.productId,
      code: d.productCode || 'N/A',
      name: d.productName,
      unit: d.unit === 1 ? 'Bộ' : d.unit === 2 ? 'Cái' : d.unit === 3 ? 'Bình' : d.unit === 4 ? 'Bao' : 'Cái',
      qty: d.quantity,
      price: Number(d.unitPrice),
      total: Number(d.total),
      stock: 0
    })) : [],
  };
};

export const deleteExportOrder = async (id: number | string): Promise<void> => {
  return fetchClient(`/sale-invoices/${id}`, {
    method: 'DELETE'
  });
};

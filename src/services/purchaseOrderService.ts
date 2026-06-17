import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface PurchaseOrder {
  id: string | number;
  purchaseId?: string; // used internally for mapping
  purchaseCode: string;
  orderType?: string;
  createdAt: string;
  supplierId?: string;
  supplierCode: string;
  supplierName: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  notes: string;
  branch: string;
  creator: string;
  employeeId?: string;
  stockId?: string;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PurchaseOrderFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  supplierId?: string;
  stockId?: string;
  employeeId?: string;
  orderType?: string;
  page?: number;
  pageSize?: number;
}

const mapPurchaseOrder = (item: any): PurchaseOrder => {
  return {
    id: item.purchaseId,
    purchaseId: item.purchaseId,
    purchaseCode: item.purchaseCode || '',
    orderType: item.orderType || 'Dathang',
    createdAt: item.purchaseDate ? new Date(item.purchaseDate).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '',
    supplierId: item.supplierId,
    supplierCode: item.supplierCode || '',
    supplierName: item.supplierName || '',
    totalAmount: item.totalAmount || 0,
    discount: item.discountAmount || 0,
    finalAmount: (item.totalAmount || 0) - (item.discountAmount || 0),
    paidAmount: item.paidAmount || 0,
    notes: item.note || '',
    branch: item.stockName || '',
    creator: item.employeeName || '',
    employeeId: item.employeeId,
    stockId: item.stockId,
  };
};

export const getPurchaseOrders = async (params: PurchaseOrderFilterParams = {}): Promise<PurchaseOrderListResponse> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', new Date(`${params.startDate}T00:00:00`).toISOString());
  if (params.endDate) query.append('endDate', new Date(`${params.endDate}T23:59:59`).toISOString());
  if (params.supplierId) query.append('supplierId', params.supplierId);
  if (params.stockId) query.append('stockId', params.stockId);
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.orderType) query.append('orderType', params.orderType);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize));
  
  const res = await fetchClient(`/purchase-orders/search?${query.toString()}`, { method: 'GET' }) as any;
  return {
    data: (res.data || []).map(mapPurchaseOrder),
    total: res.pagination?.total || 0,
    page: res.pagination?.page || params.page || 1,
    pageSize: res.pagination?.limit || res.pagination?.pageSize || 15
  };
};

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder> => {
  const res = await fetchClient(`/purchase-orders/${id}`, { method: 'GET' }) as any;
  return mapPurchaseOrder(res.data);
};

export const createPurchaseOrder = async (data: any): Promise<PurchaseOrder> => {
  const payload = {
    ...data,
    purchaseCode: data.purchaseCode || undefined
  };
  const res = await fetchClient(`/purchase-orders`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as any;
  return mapPurchaseOrder(res.data);
};

export const updatePurchaseOrder = async (id: string, data: any): Promise<PurchaseOrder> => {
  const res = await fetchClient(`/purchase-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }) as any;
  return mapPurchaseOrder(res.data);
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await fetchClient(`/purchase-orders/${id}`, { method: 'DELETE' });
};

export const createPurchaseDetail = async (data: any): Promise<any> => {
  const res = await fetchClient(`/purchase-details`, {
    method: 'POST',
    body: JSON.stringify(data)
  }) as any;
  return res.data;
};

export const getPurchaseDetailsByOrderId = async (orderId: string): Promise<any[]> => {
  const res = await fetchClient(`/purchase-details/order/${orderId}`, { method: 'GET' }) as any;
  return res.data || [];
};

export const deletePurchaseDetail = async (id: string): Promise<void> => {
  await fetchClient(`/purchase-details/${id}`, { method: 'DELETE' });
};

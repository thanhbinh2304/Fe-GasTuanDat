import { fetchClient } from '../shares/fetchClient';

export interface DebtItem {
  id: string | number;
  productId?: string | number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  priceList: string;
}

export interface DebtReceipt {
  id: string | number;
  code: string;
  customerCode: string;
  customerName: string;
  debtDate: string;
  dueDate: string;
  status: 'Chưa trả nợ' | 'Đã trả nợ';
  notes: string;
  items: DebtItem[];
}

export interface DebtFilterParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  page: number;
  pageSize: number;
}

export const getDebtReceipts = async (params: DebtFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('limit', params.pageSize.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.dueStartDate) queryParams.append('dueStartDate', params.dueStartDate);
  if (params.dueEndDate) queryParams.append('dueEndDate', params.dueEndDate);

  const response = await fetchClient(`/debt-receipts?${queryParams.toString()}`);
  const pageResult = response.data || {};
  
  return {
    data: (pageResult.content || []).map((item: any) => ({
      id: item.id,
      code: item.code,
      customerCode: item.customerCode,
      customerName: item.customerName,
      debtDate: item.debtDate || '',
      dueDate: item.dueDate || '',
      status: item.status as 'Chưa trả nợ' | 'Đã trả nợ',
      notes: item.notes || '',
      items: item.items || []
    })),
    total: pageResult.totalElements || 0,
  };
};

export interface CreateDebtReceiptPayload {
  code?: string;
  customerCode: string;
  debtDate: string;
  dueDate: string;
  status: 'Chưa trả nợ' | 'Đã trả nợ';
  notes?: string;
  items: { productId: string | number; quantity: number; price: number; priceList: string }[];
}

export const createDebtReceipt = async (payload: CreateDebtReceiptPayload) => {
  const response = await fetchClient('/debt-receipts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const updateDebtReceipt = async (id: string | number, payload: CreateDebtReceiptPayload) => {
  const response = await fetchClient(`/debt-receipts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const deleteDebtReceipt = async (id: string | number) => {
  await fetchClient(`/debt-receipts/${id}`, {
    method: 'DELETE',
  });
};

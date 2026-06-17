import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

interface ApiResponse<T> {
  success?: boolean;
  code?: number;
  message?: string;
  data?: T;
  pagination?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface CheckDetail {
  id?: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  actualQuantity: number;
}

export interface Check {
  stockTakeId?: string;
  stockTakeCode: string;
  stockTakeDate: string;
  note?: string;
  employeeId?: string;
  employeeName?: string;
  stockId?: string;
  stockName?: string;
  details?: CheckDetail[];
}

export interface CheckListResponse {
  data: Check[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CheckFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  stock?: string;
  employee?: string;
  page?: number;
  pageSize?: number;
}

const MOCK_CHECKS: Check[] = [];

export const getChecks = async (params: CheckFilterParams = {}): Promise<CheckListResponse> => {
  if (USE_MOCK) {
    return { data: MOCK_CHECKS, total: 0, page: 1, pageSize: 15 };
  }
  
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', new Date(`${params.startDate}T00:00:00`).toISOString());
  if (params.endDate) query.append('endDate', new Date(`${params.endDate}T23:59:59`).toISOString());
  if (params.stock) query.append('stock', params.stock);
  if (params.employee) query.append('employee', params.employee);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  
  const res = await fetchClient(`/stock-takes?${query.toString()}`, { method: 'GET' }) as ApiResponse<Check[]>;
  return {
    data: res.data || [],
    total: res.pagination?.total || 0,
    page: res.pagination?.page || params.page || 1,
    pageSize: res.pagination?.pageSize || params.pageSize || 15
  };
};

export const getCheckById = async (id: string): Promise<Check> => {
  const res = await fetchClient(`/stock-takes/${id}`, { method: 'GET' }) as ApiResponse<Check>;
  return res.data as Check;
};

export const createCheck = async (data: Check): Promise<Check> => {
  const payload = {
    ...data,
    stockTakeCode: data.stockTakeCode || undefined
  };
  const res = await fetchClient(`/stock-takes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as ApiResponse<Check>;
  return res.data as Check;
};

export const updateCheck = async (id: string, data: Check): Promise<Check> => {
  const res = await fetchClient(`/stock-takes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }) as ApiResponse<Check>;
  return res.data as Check;
};

export const deleteCheck = async (id: string): Promise<void> => {
  await fetchClient(`/stock-takes/${id}`, { method: 'DELETE' });
};


import { fetchClient } from '../shares/fetchClient';

export interface GasBook {
  id: string | number;
  code: string;
  customerName: string;
  customerGroup: string;
  customerGroupId?: string;
  points: number;
  phone: string;
  email: string;
  address: string;
  area: string;
  ward: string;
  notes: string;
  debt: number;
}

export interface GetGasBooksParams {
  keyword?: string;
  customerGroup?: string;
  page?: number;
  pageSize?: number;
}

const mapBackendGasBook = (item: any): GasBook => {
  return {
    id: item.gasBookId ?? '',
    code: item.gasBookCode || (item.gasBookId ? `SG${item.gasBookId.substring(0, 6).toUpperCase()}` : ''),
    customerName: item.fullName ?? '',
    customerGroup: item.customerGroupName ?? '',
    customerGroupId: item.customerGroupId ?? '',
    points: item.points ?? 0,
    phone: item.phoneNumber ?? '',
    email: item.email ?? '',
    address: item.address ?? '',
    area: item.areaId ?? '',
    ward: item.wardId ?? '',
    notes: item.note ?? '',
    debt: item.debt || 0,
  };
};

export const getGasBooks = async (params: GetGasBooksParams = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize));
  if (params.customerGroup) query.append('customerGroup', params.customerGroup);

  const response = await fetchClient(`/gasbooks/search?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(mapBackendGasBook),
    total,
  };
};

export const getGasBookById = async (id: string | number): Promise<GasBook> => {
  const response = await fetchClient(`/gasbooks/${id}`);
  const api = response as any;
  return mapBackendGasBook(api.data || api);
};

export interface CreateGasBookPayload {
  gasBookCode?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  note?: string;
  wardId?: string;
  address?: string;
  customerGroupId?: string;
  points?: number;
  cycle?: number;
}

export const createGasBook = async (data: CreateGasBookPayload): Promise<GasBook> => {
  const response = await fetchClient('/gasbooks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const api = response as any;
  return mapBackendGasBook(api.data);
};

export interface CustomerGroup {
  id: string;
  name: string;
}

export const getCustomerGroups = async (): Promise<CustomerGroup[]> => {
  const response = await fetchClient('/customers/groups', { method: 'GET' });
  const api = response as any;
  const list: any[] = Array.isArray(api?.data) ? api.data : [];
  return list.map(item => ({
    id: item.customerGroupId,
    name: item.groupName,
  }));
};

export interface UpdateGasBookPayload {
  gasBookCode?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  note?: string;
  wardId?: string;
  address?: string;
  customerGroupId?: string;
  points?: number;
  cycle?: number;
}

export const updateGasBook = async (id: string, data: UpdateGasBookPayload): Promise<GasBook> => {
  const response = await fetchClient(`/gasbooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const api = response as any;
  return mapBackendGasBook(api.data);
};

export const deleteGasBook = async (id: string): Promise<void> => {
  await fetchClient(`/gasbooks/${id}`, {
    method: 'DELETE',
  });
};

export interface GasBookHistory {
  id: string;
  doc: string;
  time: string;
  value: number;
  debt: number;
}

export const getGasBookHistory = async (id: string, params: { page?: number; limit?: number } = {}): Promise<{ data: GasBookHistory[], total: number }> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const response = await fetchClient(`/gasbooks/${id}/history?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(item => ({
      id: item.id,
      doc: item.doc,
      time: new Date(item.time).toLocaleString('vi-VN'),
      value: item.value,
      debt: item.debt,
    })),
    total,
  };
};

export interface GasBookDetailedHistory {
  id: string;
  doc: string;
  time: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  note: string;
}

export const getGasBookDetailedHistory = async (id: string, params: { page?: number; limit?: number } = {}): Promise<{ data: GasBookDetailedHistory[], total: number }> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const response = await fetchClient(`/gasbooks/${id}/detailed-history?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(item => ({
      id: item.id,
      doc: item.doc,
      time: new Date(item.time).toLocaleString('vi-VN'),
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      note: item.note,
    })),
    total,
  };
};

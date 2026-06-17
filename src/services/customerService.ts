import { fetchClient } from '../shares/fetchClient';

export interface Customer {
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
  areaId?: string;
  ward: string;
  wardId?: string;
  notes: string;
  debt: number;
}

const mapBackendCustomer = (item: any): Customer => {
  return {
    id: item.customerId ?? '',
    code: item.customerCode || (item.customerId ? `KH${item.customerId.substring(0, 6).toUpperCase()}` : ''),
    customerName: item.fullName ?? '',
    customerGroup: item.customerGroupName ?? 'Khách lẻ',
    customerGroupId: item.customerGroupId ?? '',
    points: item.points ?? 0,
    phone: item.phoneNumber ?? '',
    email: item.email ?? '',
    address: item.address ?? '',
    area: item.areaName ?? '',
    areaId: item.areaId ?? '',
    ward: item.wardName ?? '',
    wardId: item.wardId ?? '',
    notes: item.note ?? '',
    debt: item.debt || 0,
  };
};

export interface GetCustomersParams {
  keyword?: string;
  customerGroup?: string;
  page?: number;
  pageSize?: number;
}

export const getCustomers = async (params: GetCustomersParams = {}): Promise<{ data: Customer[], total: number }> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('size', String(params.pageSize));
  if (params.customerGroup) query.append('customerGroup', params.customerGroup);

  const response = await fetchClient(`/customers?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(mapBackendCustomer),
    total,
  };
};

export const getCustomerById = async (id: string | number): Promise<Customer> => {
  const response = await fetchClient(`/customers/${id}`, { method: 'GET' });
  const api = response as any;
  return mapBackendCustomer(api.data);
};

export interface CustomerPayload {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  note?: string;
  wardId?: string;
  address?: string;
  customerGroupId?: string;
}

export const createCustomer = async (data: CustomerPayload): Promise<Customer> => {
  const response = await fetchClient('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const api = response as any;
  return mapBackendCustomer(api.data);
};

export const updateCustomer = async (id: string, data: CustomerPayload): Promise<Customer> => {
  const response = await fetchClient(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const api = response as any;
  return mapBackendCustomer(api.data);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await fetchClient(`/customers/${id}`, {
    method: 'DELETE',
  });
};

export interface CustomerHistory {
  id: string;
  doc: string;
  time: string;
  value: number;
  debt: number;
}

export const getCustomerHistory = async (
  customerId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ data: CustomerHistory[]; total: number }> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const response = await fetchClient(`/customers/${customerId}/history?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(item => ({
      id: item.id ?? '',
      doc: item.doc ?? '',
      time: item.time ? new Date(item.time).toLocaleString('vi-VN') : '',
      value: Number(item.value ?? 0),
      debt: Number(item.debt ?? 0),
    })),
    total,
  };
};

export const createCustomerGroup = async (groupName: string): Promise<any> => {
  const response = await fetchClient('/customers/groups', {
    method: 'POST',
    body: JSON.stringify({ groupName }),
  });
  return response;
};

export const updateCustomerGroup = async (id: string, groupName: string): Promise<any> => {
  const response = await fetchClient(`/customers/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ groupName }),
  });
  return response;
};

export const deleteCustomerGroup = async (id: string): Promise<any> => {
  const response = await fetchClient(`/customers/groups/${id}`, {
    method: 'DELETE',
  });
  return response;
};

import { fetchClient } from '../shares/fetchClient';

export interface Supplier {
  id: string;
  code: string;
  supplierName: string;
  phone: string;
  email: string;
  notes: string;
  debt: number;
  wardId?: string;
  address?: string;
}

export interface GetSuppliersParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

const mapBackendSupplier = (item: any): Supplier => ({
  id: item.supplierId ?? '',
  code: item.supplierId ? `NCC${item.supplierId.substring(0, 6).toUpperCase()}` : '',
  supplierName: item.fullName ?? '',
  phone: item.phoneNumber ?? '',
  email: item.email ?? '',
  notes: item.note ?? '',
  debt: item.debt || 0,
  wardId: item.wardId ?? '',
  address: item.address ?? '',
});

export const getSuppliers = async (
  params: GetSuppliersParams = {}
): Promise<{ data: Supplier[]; total: number }> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize));

  const response = await fetchClient(`/suppliers/search?${query.toString()}`, { method: 'GET' });
  const api = response as any;
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return { data: list.map(mapBackendSupplier), total };
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await fetchClient(`/suppliers/${id}`, { method: 'GET' });
  const api = response as any;
  return mapBackendSupplier(api.data);
};

export interface SupplierPayload {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  note?: string;
  wardId?: string;
  address?: string;
}

export const createSupplier = async (data: SupplierPayload): Promise<Supplier> => {
  const response = await fetchClient('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const api = response as any;
  return mapBackendSupplier(api.data);
};

export const updateSupplier = async (id: string, data: SupplierPayload): Promise<Supplier> => {
  const response = await fetchClient(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const api = response as any;
  return mapBackendSupplier(api.data);
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await fetchClient(`/suppliers/${id}`, { method: 'DELETE' });
};

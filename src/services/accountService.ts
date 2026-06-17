import { fetchClient } from '../shares/fetchClient';

export interface Account {
  id: string;
  accountId?: string;
  code?: string;
  username: string;
  roleId?: string;
  roleName?: string;
  role?: string;
  employeeId?: string;
  employeeCode?: string;
  employeeName?: string;
  notes?: string;
  password?: string;
  status?: boolean;
}

export interface GetAccountsParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
}

export const getAccounts = async (params: GetAccountsParams) => {
  const res = await fetchClient('/accounts', { method: 'GET' });
  let filtered = (res.data || []).map((item: any) => ({
    ...item,
    id: item.accountId,
    role: item.roleName,
    code: item.accountId ? item.accountId.substring(0, 8).toUpperCase() : 'ACC',
  }));

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter((a: any) => 
      (a.code && a.code.toLowerCase().includes(kw)) || 
      (a.username && a.username.toLowerCase().includes(kw))
    );
  }

  if (params.role && params.role !== 'all') {
    filtered = filtered.filter((a: any) => a.role === params.role);
  }

  return {
    data: filtered,
    total: filtered.length,
  };
};

export const createAccount = async (payload: Partial<Account>) => {
  const res = await fetchClient('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const updateAccount = async (id: string, payload: Partial<Account>) => {
  const res = await fetchClient(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const deleteAccount = async (id: string) => {
  const res = await fetchClient(`/accounts/${id}`, {
    method: 'DELETE',
  });
  return res.data;
};

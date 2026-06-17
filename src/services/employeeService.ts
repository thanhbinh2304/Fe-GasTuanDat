import { fetchClient } from '../shares/fetchClient';

export interface Employee {
  id: number | string;
  code: string;
  employeeName: string;
  phoneNumber: string;
  jobTitle: string;
  notes: string;
  email?: string;
  address?: string;
  area?: string;
  ward?: string;
}

export interface GetEmployeesParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  jobTitle?: string;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// --- Mock data (kept for local development) ----------------
const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, code: 'NV000001', employeeName: 'Nguyễn Văn A', phoneNumber: '0987654321', jobTitle: 'Quản lý', notes: '', email: 'nva@example.com', address: '123 Đường B', area: 'Quận 1', ward: 'Phường Bến Nghé' },
  { id: 2, code: 'NV000002', employeeName: 'Trần Thị B', phoneNumber: '0912345678', jobTitle: 'Nhân viên bán hàng', notes: '', email: '', address: '', area: '', ward: '' },
  { id: 3, code: 'NV000003', employeeName: 'Lê Văn C', phoneNumber: '0933111222', jobTitle: 'Thủ kho', notes: '', email: '', address: '', area: '', ward: '' },
  { id: 4, code: 'NV000004', employeeName: 'Phạm Thị D', phoneNumber: '0901122334', jobTitle: 'Nhân viên bán hàng', notes: '', email: '', address: '', area: '', ward: '' },
  { id: 5, code: 'NV000005', employeeName: 'Hoàng Văn E', phoneNumber: '0977888999', jobTitle: 'Giao hàng', notes: '', email: '', address: '', area: '', ward: '' },
];

// Simple API response wrapper used across services
interface ApiResponse<T> {
  success?: boolean;
  code?: number;
  message?: string;
  data?: T;
  pagination?: {
    page?: number;
    pageSize?: number;
    size?: number;
    limit?: number;
    total?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

const normalizeApiList = <T>(response: unknown) => {
  if (Array.isArray(response)) return { data: response as T[], pagination: undefined };
  const api = response as ApiResponse<T[]>;
  const list = Array.isArray(api?.data) ? api.data : [];
  return { data: list, pagination: api?.pagination };
};

const mapBackendEmployee = (item: any): Employee => {
  return {
    id: item.employeeId ?? '',
    code: item.code ?? '',
    employeeName: item.employeeName ?? '',
    phoneNumber: item.phoneNumber ?? '',
    jobTitle: item.positionName ?? '',
    notes: item.notes ?? '',
    email: item.email ?? '',
    address: item.address ?? '',
    area: item.areaId ?? '',
    ward: item.wardId ?? '',
  };
};

// ----------------------------------
// MOCK implementation
// ----------------------------------
const mockGetEmployees = async (params: GetEmployeesParams) => {
  await new Promise((r) => setTimeout(r, 300));
  const { keyword = '', page = 1, pageSize = 15, jobTitle = '' } = params;

  let filtered = MOCK_EMPLOYEES;
  if (keyword) {
    const k = keyword.toLowerCase();
    filtered = filtered.filter(e => e.code.toLowerCase().includes(k) || e.employeeName.toLowerCase().includes(k) || e.phoneNumber.includes(keyword));
  }
  if (jobTitle) filtered = filtered.filter(e => e.jobTitle === jobTitle);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return { data, total };
};

// ----------------------------------
// REAL implementation (call backend)
// ----------------------------------
const realGetEmployees = async (params: GetEmployeesParams) => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.page)    query.append('page', String(params.page));
  if (params.pageSize) query.append('limit', String(params.pageSize));
  if (params.jobTitle) query.append('jobTitle', params.jobTitle);

  const response = await fetchClient(`/employees/search?${query.toString()}`, { method: 'GET' });
  const api = response as ApiResponse<any>;
  // Backend wraps PageResult inside api.data: { content, totalElements, ... }
  const pageResult = api?.data;
  const list: any[] = Array.isArray(pageResult?.content) ? pageResult.content : [];
  const total: number = pageResult?.totalElements ?? list.length;

  return {
    data: list.map(mapBackendEmployee),
    total,
  };
};

export const getEmployeeById = async (id: string | number): Promise<Employee> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EMPLOYEES.find(e => String(e.id) === String(id)) || MOCK_EMPLOYEES[0];
  }
  const response = await fetchClient(`/employees/${id}`, { method: 'GET' });
  const api = response as ApiResponse<any>;
  return mapBackendEmployee(api.data);
};

export interface Position {
  positionId: string;
  positionName: string;
}

const realGetPositions = async (): Promise<Position[]> => {
  const response = await fetchClient('/positions', { method: 'GET' });
  const api = response as ApiResponse<Position[]>;
  return Array.isArray(api?.data) ? api.data : [];
};

export const getPositions = async (): Promise<Position[]> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return [
      { positionId: '1', positionName: 'Quản lý' },
      { positionId: '2', positionName: 'Nhân viên bán hàng' },
      { positionId: '3', positionName: 'Thủ kho' },
      { positionId: '4', positionName: 'Giao hàng' },
    ];
  }
  return realGetPositions();
};

export const createPosition = async (data: { positionName: string }): Promise<Position> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { positionId: Date.now().toString(), positionName: data.positionName };
  }
  const response = await fetchClient('/positions', {
    method: 'POST',
    body: JSON.stringify({ positionName: data.positionName }),
  });
  const api = response as ApiResponse<Position>;
  return api.data as Position;
};

export const updatePosition = async (id: string, data: { positionName: string }): Promise<Position> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { positionId: id, positionName: data.positionName };
  }
  const response = await fetchClient(`/positions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ positionName: data.positionName }),
  });
  const api = response as ApiResponse<Position>;
  return api.data as Position;
};

export const deletePosition = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return;
  }
  await fetchClient(`/positions/${id}`, {
    method: 'DELETE',
  });
};

// Public export
export const getEmployees = async (params: GetEmployeesParams = {}) => {
  if (USE_MOCK) return mockGetEmployees(params);
  return realGetEmployees(params);
};

export interface Ward {
  wardId: string;
  wardName: string;
  areaId: string;
}

export interface Area {
  areaId: string;
  areaName: string;
}

export const getWards = async (): Promise<Ward[]> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return [
      { wardId: '1', wardName: 'Phường Bến Nghé', areaId: '1' },
      { wardId: '2', wardName: 'Phường Thảo Điền', areaId: '2' },
      { wardId: '3', wardName: 'Phường 5', areaId: '3' },
    ];
  }
  const response = await fetchClient('/wards', { method: 'GET' });
  const api = response as ApiResponse<any[]>;
  return Array.isArray(api?.data) ? api.data.map((w: any) => ({
    wardId: w.wardId,
    wardName: w.wardName,
    areaId: w.area?.areaId,
  })) : [];
};

export const getAreas = async (): Promise<Area[]> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return [
      { areaId: '1', areaName: 'Quận 1' },
      { areaId: '2', areaName: 'Quận 2' },
      { areaId: '3', areaName: 'Quận 3' },
    ];
  }
  const response = await fetchClient('/wards/areas', { method: 'GET' });
  const api = response as ApiResponse<any[]>;
  return Array.isArray(api?.data) ? api.data : [];
};

export interface CreateEmployeePayload {
  positionId: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  note?: string;
  wardId?: string;
  gender?: string;
  address?: string;
}

export const createEmployee = async (data: CreateEmployeePayload): Promise<Employee> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: Date.now().toString(),
      code: `NV${Date.now().toString().slice(-6)}`,
      employeeName: data.fullName,
      phoneNumber: data.phoneNumber || '',
      jobTitle: data.positionId,
      notes: data.note || '',
      email: data.email,
    };
  }
  
  const response = await fetchClient('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const api = response as ApiResponse<any>;
  return mapBackendEmployee(api.data);
};

export interface UpdateEmployeePayload {
  positionId?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  note?: string;
  status?: boolean;
  wardId?: string;
}

export const updateEmployee = async (employeeId: string, data: UpdateEmployeePayload): Promise<Employee> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: employeeId,
      code: '',
      employeeName: data.fullName || '',
      phoneNumber: data.phoneNumber || '',
      jobTitle: data.positionId || '',
      notes: data.note || '',
      email: data.email,
    };
  }

  const response = await fetchClient(`/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const api = response as ApiResponse<any>;
  return mapBackendEmployee(api.data);
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await fetchClient(`/employees/${employeeId}`, { method: 'DELETE' });
};

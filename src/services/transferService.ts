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
    size?: number;
    limit?: number;
    total?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

// -----------------------------------------------------------
// Kiểu dữ liệu - khớp với entity StockTransfer của Spring Boot
// -----------------------------------------------------------
export interface TransferDetail {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  maxQuantity?: number;
  warehouses?: any[];
}

export interface Transfer {
  transferId?: string;
  transferCode: string;
  transferDate: string;
  employeeName?: string;
  employeeId?: string;
  note?: string;
  fromStockName?: string;
  fromStockId?: string;
  toStockName?: string;
  toStockId?: string;
  details?: TransferDetail[];
}

export interface TransferListResponse {
  data: Transfer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransferFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  fromStock?: string;
  toStock?: string;
  creator?: string;
  page?: number;
  pageSize?: number;
}

const normalizeApiList = <T>(response: unknown) => {
  if (Array.isArray(response)) {
    return { data: response as T[], pagination: undefined };
  }

  const apiResponse = response as ApiResponse<T[]>;
  const list = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
  const pagination = apiResponse?.pagination;

  return { data: list, pagination };
};

// -----------------------------------------------------------
// 1. MOCK DATA
// -----------------------------------------------------------
const MOCK_TRANSFERS: Transfer[] = Array.from({ length: 45 }).map((_, i) => ({
  transferId: String(i + 1),
  transferCode: `DC00${1000 + i}`,
  transferDate: new Date(Date.now() - i * 3600000 * 24).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }),
  employeeName: i % 2 === 0 ? 'Admin' : 'Nhân viên 1',
  note: i % 3 === 0 ? 'Điều chuyển nội bộ' : 'Bổ sung kho chi nhánh',
  fromStockName: 'Kho trung tâm',
  toStockName: i % 2 === 0 ? 'Chi nhánh 1' : 'Chi nhánh 2',
}));

// -----------------------------------------------------------
// 2. MOCK FUNCTIONS
// -----------------------------------------------------------
const mockGetTransfers = async (params: TransferFilterParams): Promise<TransferListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  let filtered = [...MOCK_TRANSFERS];

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter((t) => t.transferCode.toLowerCase().includes(kw));
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total, page, pageSize };
};

// -----------------------------------------------------------
// 3. REAL FUNCTIONS (gọi Spring Boot)
// -----------------------------------------------------------
const realGetTransfers = async (params: TransferFilterParams): Promise<TransferListResponse> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.fromStock && params.fromStock !== 'all') query.append('fromStock', params.fromStock);
  if (params.toStock && params.toStock !== 'all') query.append('toStock', params.toStock);
  if (params.creator && params.creator !== 'all') query.append('creator', params.creator);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));

  const response = await fetchClient(`/stock-transfers?${query.toString()}`, { method: 'GET' });
  const { data, pagination } = normalizeApiList<Transfer>(response);

  return {
    data,
    total: pagination?.total ?? pagination?.totalElements ?? data.length,
    page: pagination?.page ?? params.page ?? 1,
    pageSize: pagination?.pageSize ?? pagination?.size ?? pagination?.limit ?? params.pageSize ?? 15,
  };
};

const realGetTransferById = async (transferId: string): Promise<Transfer> => {
  const response = await fetchClient(`/stock-transfers/${transferId}`, { method: 'GET' });
  const apiResp = response as ApiResponse<Transfer>;
  return apiResp?.data || (response as Transfer);
};

const realCreateTransfer = async (transfer: Omit<Transfer, 'transferId'>): Promise<Transfer> => {
  const payload = {
    transferCode: transfer.transferCode,
    transferDate: transfer.transferDate,
    note: transfer.note,
    employeeId: transfer.employeeId,
    fromStockId: transfer.fromStockId,
    toStockId: transfer.toStockId,
    details: transfer.details?.map(d => ({
      productId: d.productId,
      quantity: d.quantity,
    })),
  };
  const response = await fetchClient('/stock-transfers', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  const apiResp = response as ApiResponse<Transfer>;
  return apiResp?.data || (response as Transfer);
};

const realUpdateTransfer = async (transferId: string, transfer: Transfer): Promise<Transfer> => {
  const payload = {
    transferCode: transfer.transferCode,
    transferDate: transfer.transferDate,
    note: transfer.note,
    employeeId: transfer.employeeId,
    fromStockId: transfer.fromStockId,
    toStockId: transfer.toStockId,
    details: transfer.details?.map(d => ({
      productId: d.productId,
      quantity: d.quantity,
    })),
  };
  const response = await fetchClient(`/stock-transfers/${transferId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  const apiResp = response as ApiResponse<Transfer>;
  return apiResp?.data || (response as Transfer);
};

const realDeleteTransfer = async (transferId: string): Promise<void> => {
  await fetchClient(`/stock-transfers/${transferId}`, {
    method: 'DELETE',
  });
};

// -----------------------------------------------------------
// 4. EXPORTS CHÍNH
// -----------------------------------------------------------
export const getTransfers = async (params: TransferFilterParams = {}): Promise<TransferListResponse> => {
  if (USE_MOCK) return mockGetTransfers(params);
  return realGetTransfers(params);
};

export const getTransferById = async (transferId: string): Promise<Transfer> => {
  if (USE_MOCK) {
    return MOCK_TRANSFERS.find(t => String(t.transferId) === transferId) || MOCK_TRANSFERS[0];
  }
  return realGetTransferById(transferId);
};

export const createTransfer = async (transfer: Omit<Transfer, 'transferId'>): Promise<Transfer> => {
  if (USE_MOCK) {
    const created: Transfer = { ...transfer, transferId: String(Date.now()) };
    return created;
  }
  return realCreateTransfer(transfer);
};

export const updateTransfer = async (transferId: string, transfer: Transfer): Promise<Transfer> => {
  if (USE_MOCK) {
    return { ...transfer, transferId };
  }
  return realUpdateTransfer(transferId, transfer);
};

export const deleteTransfer = async (transferId: string): Promise<void> => {
  if (USE_MOCK) return;
  return realDeleteTransfer(transferId);
};
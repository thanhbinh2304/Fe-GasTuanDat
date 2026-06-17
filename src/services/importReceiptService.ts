import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface ImportReceipt {
  id: number;
  code: string;
  createdAt: string;
  supplierCode: string;
  supplierName: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  notes: string;
  branch: string;
  creator: string;
}

export interface ImportReceiptListResponse {
  data: ImportReceipt[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportReceiptFilterParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

const formatCurrency = (amount: number) => {
  return amount.toString();
};

const MOCK_ORDERS: ImportReceipt[] = Array.from({ length: 45 }).map((_, i) => {
  const totalAmount = 5000000 + i * 150000;
  const discount = i % 4 === 0 ? 500000 : 0;
  const finalAmount = totalAmount - discount;
  const paidAmount = i % 3 === 0 ? finalAmount / 2 : finalAmount;

  return {
    id: i + 1,
    code: `PNH00${1000 + i}`,
    createdAt: new Date(Date.now() - i * 3600000 * 24).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    supplierCode: `NCC00${(i % 5) + 1}`,
    supplierName: `Công ty TNHH Cung Cấp ${i % 5 + 1}`,
    totalAmount,
    discount,
    finalAmount,
    paidAmount,
    notes: i % 3 === 0 ? 'Giao buổi sáng' : '',
    branch: i % 2 === 0 ? 'Kho trung tâm' : 'Chi nhánh 1',
    creator: i % 2 === 0 ? 'Admin' : 'Nhân viên 1',
  };
});

export const getImportReceipts = async (params: ImportReceiptFilterParams = {}): Promise<ImportReceiptListResponse> => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    
    let filtered = [...MOCK_ORDERS];
    
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(t => t.code.toLowerCase().includes(kw));
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 15;
    const start = (page - 1) * pageSize;
    
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize
    };
  }
  
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  
  return fetchClient(`/import-receipts?${query.toString()}`, { method: 'GET' });
};

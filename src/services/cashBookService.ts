export interface CashBookEntry {
  id: number;
  code: string;
  createdAt: string;
  personName: string; // Người nộp/nhận
  paymentMethod: string; // Hình thức (Tiền mặt / Chuyển khoản)
  value: number; // Giá trị
}

export interface CashBookFilterParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

const mockCashBook: CashBookEntry[] = [
  { id: 1, code: 'SQ00001', createdAt: '2026-05-22 08:30', personName: 'Nguyễn Văn A', paymentMethod: 'Tiền mặt', value: 1500000 },
  { id: 2, code: 'SQ00002', createdAt: '2026-05-22 09:15', personName: 'Trần Thị B', paymentMethod: 'Chuyển khoản', value: 2500000 },
  { id: 3, code: 'SQ00003', createdAt: '2026-05-22 10:00', personName: 'Công ty ABC', paymentMethod: 'Chuyển khoản', value: 5000000 },
];

export const getCashBookEntries = async (params: CashBookFilterParams) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const { keyword = '', paymentMethod = '', page = 1, pageSize = 15 } = params;
  let filtered = mockCashBook;
  if (keyword) {
    const lower = keyword.toLowerCase();
    filtered = filtered.filter(p => p.code.toLowerCase().includes(lower) || p.personName.toLowerCase().includes(lower));
  }
  if (paymentMethod) {
    filtered = filtered.filter(p => p.paymentMethod === paymentMethod);
  }
  const total = filtered.length;
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { data, total };
};

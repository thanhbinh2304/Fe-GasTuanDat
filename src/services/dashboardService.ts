import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const cache = new Map<string, { data: any, timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(key: string, fetchFn: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = fetchFn().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    pendingRequests.delete(key);
    return data;
  }).catch(err => {
    pendingRequests.delete(key);
    throw err;
  });

  pendingRequests.set(key, promise);
  return promise;
}

const getDashboardAPI = async (startDate: string, endDate: string) => {
  const key = `dashboard_api_${startDate}_${endDate}`;
  return fetchWithCache(key, async () => {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    const response = await fetchClient(`/dashboard?${query.toString()}`, { method: 'GET' });
    return response.data || response;
  });
};

// -----------------------------------------
// 1. Dữ liệu thẻ tóm tắt (Summary Cards)
// -----------------------------------------
const mockGetSummaryData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    revenue: 18430000,
    receipts: 18430000,
    invoices: 12,
    gasVolume: 45
  };
};

const realGetSummaryData = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const data = await getDashboardAPI(today, today);
    return data.summary || { revenue: 0, receipts: 0, invoices: 0, gasVolume: 0 };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu tổng quan:', error);
    return mockGetSummaryData();
  }
};

export const getSummaryData = async () => {
  if (USE_MOCK) return mockGetSummaryData();
  return realGetSummaryData();
};

// -----------------------------------------
// 2. Dữ liệu biểu đồ doanh thu
// -----------------------------------------
const mockGetChartData = async (startDate?: string, endDate?: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      data.push({
        name: `${dayStr}/${monthStr}`,
        value: Math.floor(Math.random() * 8000000) + 2000000,
      });
    }
    return data;
  }
  return [];
};

const realGetChartData = async (startDate?: string, endDate?: string) => {
  try {
    if (!startDate || !endDate) return [];
    const data = await getDashboardAPI(startDate, endDate);
    return data.revenueChart || [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ:', error);
    return mockGetChartData(startDate, endDate);
  }
};

export const getRevenueChartData = async (startDate?: string, endDate?: string) => {
  if (USE_MOCK) return mockGetChartData(startDate, endDate);
  return realGetChartData(startDate, endDate);
};

// -----------------------------------------
// 3. Dữ liệu Top 10 hàng bán chạy
// -----------------------------------------
const mockGetTopProducts = async (startDate?: string, endDate?: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const baseData = [
    { name: 'Bếp từ Prato PT020', value: 26 },
    { name: 'Bếp đôi từ Spelier', value: 19.9 }
  ];
  return baseData.map(item => ({ ...item, display: `${item.value} tr` }));
};

const realGetTopProducts = async (startDate?: string, endDate?: string) => {
  try {
    const data = await getDashboardAPI(startDate || '', endDate || '');
    return data.topProducts || [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu top sản phẩm:', error);
    return mockGetTopProducts(startDate, endDate);
  }
};

export const getTopProductsData = async (startDate?: string, endDate?: string) => {
  if (USE_MOCK) return mockGetTopProducts(startDate, endDate);
  return realGetTopProducts(startDate, endDate);
};

// -----------------------------------------
// 4. Dữ liệu Top 10 khách hàng
// -----------------------------------------
const mockGetTopCustomers = async (startDate?: string, endDate?: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const baseData = [
    { name: 'anh duy', value: 19.9 },
    { name: 'anh tùng', value: 18.4 }
  ];
  return baseData.map(item => ({ ...item, display: `${item.value} tr` }));
};

const realGetTopCustomers = async (startDate?: string, endDate?: string) => {
  try {
    const data = await getDashboardAPI(startDate || '', endDate || '');
    return data.topCustomers || [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu top khách hàng:', error);
    return mockGetTopCustomers(startDate, endDate);
  }
};

export const getTopCustomersData = async (startDate?: string, endDate?: string) => {
  if (USE_MOCK) return mockGetTopCustomers(startDate, endDate);
  return realGetTopCustomers(startDate, endDate);
};


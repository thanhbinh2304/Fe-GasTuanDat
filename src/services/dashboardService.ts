import { fetchClient } from '../shares/fetchClient';
import { getExportOrders } from './exportOrderService';
import { getProducts } from './productService';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// -----------------------------------------
// 1. Dữ liệu thẻ tóm tắt (Summary Cards)
// -----------------------------------------
const mockGetSummaryData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Giả lập mạng 0.8s
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
    
    const ordersRes = await getExportOrders({
      startDate: today,
      endDate: today,
      orderType: 'Xuathang',
      pageSize: 10000,
    });
    
    const orders = ordersRes.data || [];
    
    let revenue = 0;
    let receipts = 0;
    let invoices = orders.length;
    let gasVolume = 0;

    orders.forEach(order => {
      revenue += order.finalAmount || 0;
      receipts += order.paidAmount || 0;
    });

    const productsRes = await getProducts({ pageSize: 10000 });
    const gasProductCodes = new Set<string>();
    const gasProductIds = new Set<string>();
    
    productsRes.data.forEach(p => {
      if (p.category && p.category.toLowerCase().includes('bình gas')) {
        gasProductIds.add(String(p.id));
        if (p.code) gasProductCodes.add(p.code);
      }
    });

    orders.forEach(order => {
      if (order.details) {
        order.details.forEach(detail => {
          if (gasProductCodes.has(detail.code) || gasProductIds.has(String(detail.id))) {
            gasVolume += detail.qty || 0;
          }
        });
      }
    });

    return {
      revenue,
      receipts,
      invoices,
      gasVolume
    };
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
    
    const ordersRes = await getExportOrders({
      startDate,
      endDate,
      orderType: 'Xuathang',
      pageSize: 10000,
    });
    
    const orders = ordersRes.data || [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dataMap: Record<string, number> = {};
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${dayStr}/${monthStr}`;
      dataMap[key] = 0;
    }
    
    orders.forEach(order => {
      if (order.createdAt) {
        // Parse date considering local timezone to match start/endDate
        const dateObj = new Date(order.createdAt);
        const dayStr = String(dateObj.getDate()).padStart(2, '0');
        const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
        const key = `${dayStr}/${monthStr}`;
        if (dataMap[key] !== undefined) {
          dataMap[key] += (order.finalAmount || 0);
        }
      }
    });
    
    const data = Object.keys(dataMap).map(key => ({
      name: key,
      value: dataMap[key]
    }));
    
    return data;
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
    { name: 'Bếp đôi từ Spelier', value: 19.9 },
    { name: 'Bộ đầu nguồn inox', value: 13.5 },
    { name: 'Bếp từ Spelier đơn', value: 11.8 },
    { name: 'MLN Domira 9 cấp', value: 8.4 },
    { name: 'Bếp từ Canzy 208Plus', value: 7.5 },
    { name: 'Quạt đảo trần ChingHai', value: 6.9 },
    { name: 'Bếp dưỡng Nasyo', value: 6.5 },
    { name: 'Máy ép chậm Kalite', value: 6.2 },
    { name: 'Bếp DL Namilux', value: 5.9 },
  ];

  if (startDate || endDate) {
    return baseData.map(item => ({
      ...item,
      value: Number((item.value * (0.8 + Math.random() * 0.4)).toFixed(1))
    })).sort((a, b) => b.value - a.value).map(item => ({
      ...item,
      display: `${item.value} tr`
    }));
  }

  return baseData.map(item => ({ ...item, display: `${item.value} tr` }));
};

const realGetTopProducts = async (startDate?: string, endDate?: string) => {
  try {
    const ordersRes = await getExportOrders({
      startDate,
      endDate,
      orderType: 'Xuathang',
      pageSize: 10000,
    });
    
    const orders = ordersRes.data || [];
    const productMap: Record<string, number> = {};
    
    orders.forEach(order => {
      const orderTotal = order.totalAmount || 0;
      const orderFinal = order.finalAmount || 0;
      const ratio = orderTotal > 0 ? (orderFinal / orderTotal) : 1;

      if (order.details) {
        order.details.forEach(detail => {
          const name = detail.name || 'Sản phẩm khác';
          const total = (detail.total || 0) * ratio;
          if (!productMap[name]) productMap[name] = 0;
          productMap[name] += total;
        });
      }
    });
    
    const sorted = Object.keys(productMap)
      .map(name => ({ name, total: productMap[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
      
    return sorted.map(item => {
      const valueInMillions = Number((item.total / 1000000).toFixed(1));
      return {
        name: item.name,
        value: valueInMillions,
        display: `${valueInMillions} tr`
      };
    });
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
    { name: 'anh tùng', value: 18.4 },
    { name: 'anh tý', value: 15.2 },
    { name: 'a tuấn', value: 11.8 },
    { name: 'chú hảo', value: 10.4 },
    { name: 'Hùng Anh Km9', value: 9.3 },
    { name: 'Tem Hường – Minh Dân', value: 8.1 },
    { name: 'chị trang', value: 8 },
    { name: 'Nguyễn Thị Tuyết', value: 8 },
    { name: 'Minh Thiết Bình An', value: 7.3 },
  ];

  if (startDate || endDate) {
    return baseData.map(item => ({
      ...item,
      value: Number((item.value * (0.8 + Math.random() * 0.4)).toFixed(1))
    })).sort((a, b) => b.value - a.value).map(item => ({
      ...item,
      display: `${item.value} tr`
    }));
  }

  return baseData.map(item => ({ ...item, display: `${item.value} tr` }));
};

const realGetTopCustomers = async (startDate?: string, endDate?: string) => {
  try {
    const ordersRes = await getExportOrders({
      startDate,
      endDate,
      orderType: 'Xuathang',
      pageSize: 10000,
    });
    
    const orders = ordersRes.data || [];
    const customerMap: Record<string, number> = {};
    
    orders.forEach(order => {
      const name = order.customerName || 'Khách lẻ';
      const total = order.finalAmount || 0;
      if (!customerMap[name]) customerMap[name] = 0;
      customerMap[name] += total;
    });
    
    const sorted = Object.keys(customerMap)
      .map(name => ({ name, total: customerMap[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
      
    return sorted.map(item => {
      const valueInMillions = Number((item.total / 1000000).toFixed(1));
      return {
        name: item.name,
        value: valueInMillions,
        display: `${valueInMillions} tr`
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu top khách hàng:', error);
    return mockGetTopCustomers(startDate, endDate);
  }
};

export const getTopCustomersData = async (startDate?: string, endDate?: string) => {
  if (USE_MOCK) return mockGetTopCustomers(startDate, endDate);
  return realGetTopCustomers(startDate, endDate);
};

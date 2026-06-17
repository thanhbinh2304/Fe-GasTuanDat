import { fetchClient } from '../shares/fetchClient';

export interface ImportReportItem {
  productCode: string;
  productName: string;
  unit: number;
  qty: number;
  totalImportValue: number;
}

export interface ExportReportItem {
  productCode: string;
  productName: string;
  unit: number;
  qty: number;
  totalExportValue: number;
  costPrice: number;
  totalCost: number;
  profit: number;
}

export interface SaleInvoiceReportItem {
  time: string;             // Ngày (yyyy-MM-dd)
  totalReceipts: number;    // Tổng số phiếu xuất hàng
  totalCustomers: number;   // Tổng số khách hàng
  totalAmount: number;      // Tổng tiền
  totalDiscount: number;    // Tổng giảm giá
  totalAfterDiscount: number; // Tổng sau giảm giá
  totalRevenue: number;     // Tổng thu
  totalDebt: number;        // Tổng còn nợ
}

export interface PurchaseOrderReportItem {
  time: string;             // Ngày (yyyy-MM-dd)
  totalReceipts: number;    // Tổng số phiếu nhập hàng
  totalSuppliers: number;   // Tổng số nhà cung cấp
  totalAmount: number;      // Tổng tiền
  totalDiscount: number;    // Tổng giảm giá
  totalAfterDiscount: number; // Tổng sau giảm giá
  totalPaid: number;        // Tổng trả
  totalDebt: number;        // Tổng còn nợ
}

export interface GasBookReportItem {
  gasBookCode: string;     // Mã sổ gas (UUID dạng string)
  customerName: string;    // Tên khách hàng
  totalAmount: number;     // Tổng tiền
  totalDiscount: number;   // Tổng giảm giá
  totalAfterDiscount: number; // Tổng sau giảm giá
  totalPaid: number;       // Tổng thu
  totalDebt: number;       // Tổng còn nợ
}

export interface CustomerReportItem {
  customerCode: string;
  customerName: string;
  totalAmount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  totalPaid: number;
  totalDebt: number;
}

export interface SupplierReportItem {
  supplierCode: string;
  supplierName: string;
  totalAmount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  totalPaid: number;
  totalDebt: number;
}

export const reportService = {
  getImportReport: async (startDate: string, endDate: string): Promise<ImportReportItem[]> => {
    const response = await fetchClient(`/reports/products/import?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as ImportReportItem[];
  },

  getExportReport: async (startDate: string, endDate: string): Promise<ExportReportItem[]> => {
    const response = await fetchClient(`/reports/products/export?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as ExportReportItem[];
  },

  getExportSummaryReport: async (startDate: string, endDate: string): Promise<SaleInvoiceReportItem[]> => {
    const response = await fetchClient(`/reports/invoices/export-summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as SaleInvoiceReportItem[];
  },

  getImportSummaryReport: async (startDate: string, endDate: string): Promise<PurchaseOrderReportItem[]> => {
    const response = await fetchClient(`/reports/invoices/import-summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as PurchaseOrderReportItem[];
  },

  getGasBookSummaryReport: async (startDate: string, endDate: string): Promise<GasBookReportItem[]> => {
    const response = await fetchClient(`/reports/gas-books/summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as GasBookReportItem[];
  },

  getCustomerSummaryReport: async (startDate: string, endDate: string): Promise<CustomerReportItem[]> => {
    const response = await fetchClient(`/reports/customers/summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as CustomerReportItem[];
  },

  getSupplierSummaryReport: async (startDate: string, endDate: string): Promise<SupplierReportItem[]> => {
    const response = await fetchClient(`/reports/suppliers/summary?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    });
    return response as SupplierReportItem[];
  }
};

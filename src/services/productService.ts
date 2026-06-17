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

export interface ProductStockDto {
  stockId: string;
  name: string;
  quantity: number;
}

export interface ProductPriceDto {
  priceListId: string;
  priceListName: string;
  price: number;
}

export interface ProductAttributeDto {
  attributeId: string;
  attributeName: string;
  value: string;
}

interface BackendProduct {
  productId?: string;
  productCode?: string;
  productName?: string;
  cost?: number;
  categoryId?: string;
  categoryName?: string;
  unit?: string | number;
  note?: string;
  warehouses?: ProductStockDto[];
  priceTiers?: ProductPriceDto[];
  attributesList?: ProductAttributeDto[];
}

// -----------------------------------------------------------
// Kiểu dữ liệu - khớp với entity Product của Spring Boot
// -----------------------------------------------------------
export interface Product {
  id: number | string;
  code: string;           // Mã hàng
  name: string;           // Tên hàng
  displayName?: string;   // Tên hiển thị kèm thuộc tính
  imageUrl?: string;      // Ảnh (có thể null)
  category?: string;      // Nhóm hàng
  salePrice: number;      // Giá bán
  costPrice: number;      // Giá vốn
  stock: number;          // Tồn kho
  customerOrder: number;  // Khách đặt
  createdAt: string;      // Thời gian tạo (ISO string)
  unit?: string;          // Đơn vị
  notes?: string;         // Ghi chú

  // Dữ liệu gốc từ backend
  productId?: string;
  productName?: string;
  cost?: number;
  categoryId?: string;
  categoryName?: string;
  note?: string;
  warehouses?: ProductStockDto[];
  priceTiers?: ProductPriceDto[];
  attributesList?: ProductAttributeDto[];
}

export interface ProductListResponse {
  data: Product[];
  total: number;     // Tổng số bản ghi (dùng cho phân trang)
  page: number;
  pageSize: number;
}

export interface ProductFilterParams {
  keyword?: string;
  productCategory?: string;
  stock?: string;
  priceList?: string;
  productAttribute?: string;
  attributeValue?: string;
  page?: number;
  pageSize?: number;
}

// -----------------------------------------------------------
// 1. MOCK DATA
// -----------------------------------------------------------
const BASE_MOCK_PRODUCTS: Product[] = [
  { id: 1, code: 'ZC-I36912C', name: 'Bếp từ đôi Canzy ZC-I36912C', category: 'Bếp từ', salePrice: 7880000, costPrice: 6500000, stock: -20, customerOrder: 1, createdAt: '2026-05-19T16:39:00', unit: 'Bộ', notes: 'Bếp âm cao cấp' },
  { id: 2, code: 'SH5260', name: 'Máy làm sữa hạt sunhouse SH5260', category: 'Máy làm sữa hạt', salePrice: 1280000, costPrice: 950000, stock: 15, customerOrder: 0, createdAt: '2026-05-19T10:19:00', unit: 'Chiếc', notes: 'Bảo hành 12 tháng' },
  { id: 3, code: 'BA138PLUS', name: 'Máy làm sữa hạt Creen 138plus', category: 'Máy làm sữa hạt', salePrice: 1680000, costPrice: 1300000, stock: 8, customerOrder: 0, createdAt: '2026-05-19T10:18:00', unit: 'Chiếc', notes: 'Hàng dễ vỡ' },
  { id: 4, code: 'B25', name: 'Máy say sinh tố Gock B25', category: 'Máy xay sinh tố', salePrice: 855000, costPrice: 600000, stock: 24, customerOrder: 0, createdAt: '2026-05-19T10:14:00', unit: 'Chiếc', notes: '' },
  { id: 5, code: 'B32', name: 'Máy say sinh tố mini cầm tay Gock B32', category: 'Máy xay sinh tố', salePrice: 685000, costPrice: 500000, stock: 50, customerOrder: 0, createdAt: '2026-05-19T10:13:00', unit: 'Chiếc', notes: '' },
  { id: 6, code: 'CM105', name: 'Nồi chiên không dầu CREEN ( AG11L )', category: 'Nồi chiên không dầu', salePrice: 1680000, costPrice: 1250000, stock: 10, customerOrder: 0, createdAt: '2026-05-17T10:28:00', unit: 'Chiếc', notes: 'Bảo hành 2 năm' },
  { id: 7, code: 'KN946', name: 'Áp suất điện Koreno KN946 (6l)', category: 'Nồi áp suất', salePrice: 1680000, costPrice: 1200000, stock: 5, customerOrder: 0, createdAt: '2026-05-17T10:23:00', unit: 'Chiếc', notes: '' },
  { id: 8, code: 'KN940', name: 'Áp suất điện Koreno KN940 (4l)', category: 'Nồi áp suất', salePrice: 1480000, costPrice: 1050000, stock: 3, customerOrder: 0, createdAt: '2026-05-17T10:22:00', unit: 'Chiếc', notes: '' },
  { id: 9, code: 'GAS12', name: 'Bình gas Petrolimex 12kg', category: 'Bình gas', salePrice: 430000, costPrice: 380000, stock: 45, customerOrder: 0, createdAt: '2026-05-16T08:00:00', unit: 'Bình', notes: 'Gas chính hãng' },
  { id: 10, code: 'GAS45', name: 'Bình gas Saigon Petro 45kg', category: 'Bình gas', salePrice: 1350000, costPrice: 1200000, stock: 12, customerOrder: 2, createdAt: '2026-05-16T08:00:00', unit: 'Bình', notes: 'Dùng cho nhà hàng' },
  { id: 11, code: 'BEPGA01', name: 'Bếp gas dương Paloma PA-46KB', category: 'Bếp gas', salePrice: 2100000, costPrice: 1750000, stock: 8, customerOrder: 0, createdAt: '2026-05-15T09:30:00', unit: 'Chiếc', notes: 'Nhập khẩu Nhật Bản' },
  { id: 12, code: 'BEPGA02', name: 'Bếp gas âm Paloma PA-65JEB', category: 'Bếp gas', salePrice: 3500000, costPrice: 2900000, stock: 5, customerOrder: 1, createdAt: '2026-05-15T09:30:00', unit: 'Chiếc', notes: '' },
  { id: 13, code: 'VDAY01', name: 'Van dây gas cao áp Việt Nam', category: 'Phụ kiện gas', salePrice: 75000, costPrice: 50000, stock: 200, customerOrder: 0, createdAt: '2026-05-14T14:00:00', unit: 'Bộ', notes: 'Van tự động ngắt' },
  { id: 14, code: 'BEPTU01', name: 'Bếp từ đơn Spelier SP-168T', category: 'Bếp từ', salePrice: 980000, costPrice: 800000, stock: 15, customerOrder: 0, createdAt: '2026-05-13T11:00:00', unit: 'Chiếc', notes: 'Hẹn giờ thông minh' },
  { id: 15, code: 'BEPTU02', name: 'Bếp từ đôi Spelier SP-868T', category: 'Bếp từ', salePrice: 1990000, costPrice: 1650000, stock: 10, customerOrder: 3, createdAt: '2026-05-13T11:00:00', unit: 'Bộ', notes: 'Mặt kính Schott Ceran' },
];

const EXTRA_MOCK_PRODUCTS: Product[] = Array.from({ length: 45 }).map((_, i) => ({
  id: 16 + i,
  code: `SP${1000 + i}`,
  name: `Sản phẩm mẫu ${i + 1}`,
  category: i % 2 === 0 ? 'Bếp gas' : 'Phụ kiện gas',
  salePrice: 100000 + i * 50000,
  costPrice: 80000 + i * 40000,
  stock: 50 - i,
  customerOrder: i % 5,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  unit: i % 2 === 0 ? 'Chiếc' : 'Bộ',
  notes: i % 3 === 0 ? 'Hàng mới về' : ''
}));

const MOCK_PRODUCTS: Product[] = [...BASE_MOCK_PRODUCTS, ...EXTRA_MOCK_PRODUCTS];

const MOCK_CATEGORIES = ['Tất cả', 'Bình gas', 'Bếp gas', 'Bếp từ', 'Phụ kiện gas', 'Máy làm sữa hạt', 'Máy xay sinh tố', 'Nồi chiên không dầu', 'Nồi áp suất'];

const mapBackendProduct = (item: BackendProduct): Product => {
  const code = item.productCode || item.productId || '';
  const productName = item.productName || '';
  const costPrice = item.cost ?? 0;

  const warehouses = item.warehouses || [];
  const priceTiers = item.priceTiers || [];
  const attributesList = item.attributesList || [];

  const totalStock = warehouses.reduce((sum, w) => sum + w.quantity, 0);
  const primarySalePrice = priceTiers[0]?.price ?? 0; // Fallback to 0 if no price list exists

  let displayName = productName;
  if (attributesList.length > 0) {
    const attrValues = attributesList.map(a => a.value).filter(Boolean);
    if (attrValues.length > 0) {
      displayName = `${productName} - ${attrValues.join(' - ')}`;
    }
  }

  return {
    id: item.productId || code || productName,
    code: code,
    name: productName,
    displayName: displayName,
    category: item.categoryName,
    salePrice: primarySalePrice,
    costPrice,
    stock: totalStock,
    customerOrder: 0,
    createdAt: '',
    unit: item.unit != null ? String(item.unit) : undefined,
    notes: item.note,
    productId: item.productId,
    productName: item.productName,
    cost: item.cost,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    note: item.note,
    warehouses,
    priceTiers,
    attributesList,
  };
};

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
// 2. MOCK FUNCTIONS
// -----------------------------------------------------------
const mockGetProducts = async (params: ProductFilterParams): Promise<ProductListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  let filtered = [...MOCK_PRODUCTS];

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
    );
  }

  if (params.productCategory && params.productCategory !== 'Tất cả') {
    filtered = filtered.filter((p) => p.category === params.productCategory);
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total, page, pageSize };
};

const mockGetCategories = async (): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_CATEGORIES;
};

// -----------------------------------------------------------
// 3. REAL FUNCTIONS (gọi Spring Boot)
// -----------------------------------------------------------
const realGetProducts = async (params: ProductFilterParams): Promise<ProductListResponse> => {
  const query = new URLSearchParams();
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.productCategory && params.productCategory !== 'Tất cả') query.append('productCategory', params.productCategory);
  if (params.stock && params.stock !== 'all') query.append('stock', params.stock);
  if (params.priceList && params.priceList !== 'all') query.append('priceList', params.priceList);
  if (params.productAttribute && params.productAttribute !== 'all') query.append('productAttribute', params.productAttribute);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  const response = await fetchClient(`/products?${query.toString()}`, { method: 'GET' });
  const { data, pagination } = normalizeApiList<BackendProduct>(response);

  return {
    data: data.map(mapBackendProduct),
    total: pagination?.total ?? pagination?.totalElements ?? data.length,
    page: pagination?.page ?? params.page ?? 1,
    pageSize: pagination?.pageSize ?? pagination?.size ?? pagination?.limit ?? params.pageSize ?? 20,
  };
};

const realGetCategories = async (): Promise<string[]> => {
  const response = await fetchClient('/productCategory', { method: 'GET' });
  const categories = normalizeApiList<any>(response).data;

  return categories
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.categoryName ?? item?.name ?? '';
    })
    .filter(Boolean);
};

// -----------------------------------------------------------
// 4. EXPORTS CHÍNH
// -----------------------------------------------------------
export const getProducts = async (params: ProductFilterParams = {}): Promise<ProductListResponse> => {
  if (USE_MOCK) return mockGetProducts(params);
  return realGetProducts(params);
};

export const getCategories = async (): Promise<string[]> => {
  if (USE_MOCK) return mockGetCategories();
  return realGetCategories();
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  if (USE_MOCK) {
    const created: Product = { ...product, id: Date.now() };
    return created;
  }
  const payload = {
    productCode: product.code,
    productName: product.name,
    cost: product.costPrice,
    categoryId: product.categoryId,
    unit: product.unit,
    note: product.notes,
    warehouses: product.warehouses,
    priceTiers: product.priceTiers,
    attributesList: product.attributesList,
  };
  const response = await fetchClient('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  const apiResp = response as ApiResponse<BackendProduct>;
  const item = apiResp?.data || (response as BackendProduct);
  return mapBackendProduct(item);
};

export const updateProduct = async (productId: string, product: Product): Promise<Product> => {
  if (USE_MOCK) {
    return product;
  }
  const payload = {
    productCode: product.code,
    productName: product.name,
    cost: product.costPrice,
    categoryId: product.categoryId,
    unit: product.unit,
    note: product.notes,
    warehouses: product.warehouses,
    priceTiers: product.priceTiers,
    attributesList: product.attributesList,
  };
  const response = await fetchClient(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  const apiResp = response as ApiResponse<BackendProduct>;
  const item = apiResp?.data || (response as BackendProduct);
  return mapBackendProduct(item);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  if (USE_MOCK) return;
  await fetchClient(`/products/${productId}`, {
    method: 'DELETE',
  });
};

export const getProductById = async (id: string | number): Promise<Product> => {
  const response = await fetchClient(`/products/${id}`);
  const apiResp = response as ApiResponse<BackendProduct>;
  const item = apiResp?.data || (response as BackendProduct);
  return mapBackendProduct(item);
};

export const formatProductName = (p: Partial<Product>): string => {
  if (p.displayName) return p.displayName;
  let displayName = p.name || '';
  if (p.attributesList && p.attributesList.length > 0) {
    const attrValues = p.attributesList.map(a => a.value).filter(Boolean);
    if (attrValues.length > 0) {
      displayName = `${displayName} - ${attrValues.join(' - ')}`;
    }
  }
  return displayName;
};

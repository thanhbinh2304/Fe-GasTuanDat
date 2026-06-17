import { fetchClient } from '../shares/fetchClient';

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

export interface FilterItem {
    id: string;
    name: string;
    wardId?: string;
}

interface CategoryDto {
    categoryId?: string;
    categoryName?: string;
}

interface PriceListDto {
    priceListId?: string;
    priceListName?: string;
}

interface AttributeDto {
    attributeId?: string;
    attributeName?: string;
}

interface StockDto {
    stockId?: string;
    name?: string;
    wardId?: string;
}

const normalizeListResponse = <T>(response: unknown): T[] => {
    if (Array.isArray(response)) {
        return response as T[];
    }

    const apiResponse = response as ApiResponse<T[]>;
    return Array.isArray(apiResponse?.data) ? apiResponse.data : [];
};

const mapCategory = (item: CategoryDto): FilterItem => ({
    id: String(item.categoryId ?? ''),
    name: String(item.categoryName ?? ''),
});

const mapPriceList = (item: PriceListDto): FilterItem => ({
    id: String(item.priceListId ?? ''),
    name: String(item.priceListName ?? ''),
});

const mapAttribute = (item: AttributeDto): FilterItem => ({
    id: String(item.attributeId ?? ''),
    name: String(item.attributeName ?? ''),
});

const mapStock = (item: StockDto): FilterItem => ({
    id: String(item.stockId ?? ''),
    name: String(item.name ?? ''),
    wardId: item.wardId,
});

export const getProductCategories = async (): Promise<FilterItem[]> => {
    const response = await fetchClient('/productCategory', { method: 'GET' });
    return normalizeListResponse<CategoryDto>(response).map(mapCategory).filter((item) => item.id && item.name);
};

export const createProductCategory = async (name: string): Promise<FilterItem> => {
    const response = await fetchClient('/productCategory', {
        method: 'POST',
        body: JSON.stringify({ categoryName: name }),
    });
    return mapCategory(((response as ApiResponse<CategoryDto>)?.data ?? {}) as CategoryDto);
};

export const updateProductCategory = async (id: string, name: string): Promise<FilterItem> => {
    const response = await fetchClient(`/productCategory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ categoryName: name }),
    });
    return mapCategory(((response as ApiResponse<CategoryDto>)?.data ?? {}) as CategoryDto);
};

export const deleteProductCategory = async (id: string): Promise<void> => {
    await fetchClient(`/productCategory/${id}`, { method: 'DELETE' });
};

export const getPriceBooks = async (): Promise<FilterItem[]> => {
    const response = await fetchClient('/price-list/search?limit=200&page=1', { method: 'GET' });
    // Backend may return: { data: { content: [...], totalElements, ... } } OR { data: [...] }
    const raw = response as any;
    let items: PriceListDto[] = [];
    if (Array.isArray(raw)) {
        items = raw;
    } else if (Array.isArray(raw?.data)) {
        items = raw.data;
    } else if (Array.isArray(raw?.data?.content)) {
        items = raw.data.content;
    } else if (Array.isArray(raw?.content)) {
        items = raw.content;
    }
    return items.map(mapPriceList).filter((item) => item.id && item.name);
};

export const createPriceBook = async (name: string): Promise<FilterItem> => {
    const response = await fetchClient('/price-list', {
        method: 'POST',
        body: JSON.stringify({ priceListName: name }),
    });
    return mapPriceList(((response as ApiResponse<PriceListDto>)?.data ?? {}) as PriceListDto);
};

export const updatePriceBook = async (id: string, name: string): Promise<FilterItem> => {
    const response = await fetchClient(`/price-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ priceListName: name }),
    });
    return mapPriceList(((response as ApiResponse<PriceListDto>)?.data ?? {}) as PriceListDto);
};

export const deletePriceBook = async (id: string): Promise<void> => {
    await fetchClient(`/price-list/${id}`, { method: 'DELETE' });
};

export const getAttributes = async (): Promise<FilterItem[]> => {
    const response = await fetchClient('/attributes/search?limit=200&page=1', { method: 'GET' });
    return normalizeListResponse<AttributeDto>(response).map(mapAttribute).filter((item) => item.id && item.name);
};

export const createAttribute = async (name: string): Promise<FilterItem> => {
    const response = await fetchClient('/attributes', {
        method: 'POST',
        body: JSON.stringify({ attributeName: name }),
    });
    return mapAttribute(((response as ApiResponse<AttributeDto>)?.data ?? {}) as AttributeDto);
};

export const updateAttribute = async (id: string, name: string): Promise<FilterItem> => {
    const response = await fetchClient(`/attributes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ attributeName: name }),
    });
    return mapAttribute(((response as ApiResponse<AttributeDto>)?.data ?? {}) as AttributeDto);
};

export const deleteAttribute = async (id: string): Promise<void> => {
    await fetchClient(`/attributes/${id}`, { method: 'DELETE' });
};

export const getStocks = async (): Promise<FilterItem[]> => {
    const response = await fetchClient('/stocks', { method: 'GET' });
    return normalizeListResponse<StockDto>(response).map(mapStock).filter((item) => item.id && item.name);
};

export const createStock = async (name: string, wardId?: string): Promise<FilterItem> => {
    const response = await fetchClient('/stocks', {
        method: 'POST',
        body: JSON.stringify({ name, wardId: wardId || null }),
    });
    return mapStock(((response as ApiResponse<StockDto>)?.data ?? {}) as StockDto);
};

export const updateStock = async (id: string, name: string, wardId?: string): Promise<FilterItem> => {
    const response = await fetchClient(`/stocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, wardId: wardId || null }),
    });
    return mapStock(((response as ApiResponse<StockDto>)?.data ?? {}) as StockDto);
};

export const deleteStock = async (id: string): Promise<void> => {
    await fetchClient(`/stocks/${id}`, { method: 'DELETE' });
};

export interface Area {
    areaId: string;
    areaName: string;
}

export interface Ward {
    wardId: string;
    wardName: string;
    area?: Area;
}

export const getWards = async (): Promise<Ward[]> => {
    const response = await fetchClient('/wards', { method: 'GET' });
    return normalizeListResponse<Ward>(response);
};

export const getAreas = async (): Promise<Area[]> => {
    const response = await fetchClient('/wards/areas', { method: 'GET' });
    return normalizeListResponse<Area>(response);
};
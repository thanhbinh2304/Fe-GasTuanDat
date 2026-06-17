import { fetchClient } from '../shares/fetchClient';

export interface Promotion {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  name: string;
  minOrderValue: number;
  discountValue: number;
  notes: string;
  giftItems: any[];
}

export interface PromotionFilterParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

const mapItem = (item: any): Promotion => {
  // Đọc danh sách hàng tặng từ promotionDetails (backend trả về)
  const giftItems = (item.promotionDetails || []).map((d: any) => ({
    id: d.id || d.productId,
    name: d.productName || '',
    quantity: d.quantity || 1,
  }));
  return {
    id: item.promotionId,
    code: item.promotionCode || '',
    name: item.promotionName || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    minOrderValue: Number(item.leastValue ?? 0),
    discountValue: Number(item.value ?? 0),
    notes: item.notes || '',
    giftItems,
  };
};

export const getPromotions = async (params: PromotionFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('limit', params.pageSize.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetchClient(`/reward-milestones?${queryParams.toString()}`);
  const pageResult = response.data || {};

  return {
    data: (pageResult.content || []).map(mapItem),
    total: pageResult.totalElements || 0,
  };
};

export interface CreatePromotionPayload {
  promotionCode?: string;
  promotionName: string;
  startDate?: string;
  endDate?: string;
  minOrderValue?: number;
  discountValue?: number;
  note?: string;
  giftItems?: any[];
}

const toRequestBody = (payload: CreatePromotionPayload) => ({
  promotionCode: payload.promotionCode || undefined,
  promotionName: payload.promotionName,
  startDate: payload.startDate || undefined,
  endDate: payload.endDate || undefined,
  leastValue: payload.minOrderValue ?? 0,
  value: payload.discountValue ?? 0,
  percentage: 0,
  notes: payload.note || '',
  promotionDetails: (payload.giftItems || []).map((i: any) => ({
    productId: String(i.productId || i.id),
    quantity: i.quantity || 1,
  })),
});

export const createPromotion = async (payload: CreatePromotionPayload): Promise<Promotion> => {
  const response = await fetchClient('/reward-milestones', {
    method: 'POST',
    body: JSON.stringify(toRequestBody(payload)),
  });
  return mapItem(response.data);
};

export const updatePromotion = async (id: string, payload: CreatePromotionPayload): Promise<Promotion> => {
  const response = await fetchClient(`/reward-milestones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toRequestBody(payload)),
  });
  return mapItem(response.data);
};

export const deletePromotion = async (id: string) => {
  await fetchClient(`/reward-milestones/${id}`, {
    method: 'DELETE',
  });
};

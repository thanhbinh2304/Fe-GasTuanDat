// Cấu hình một fetch client dùng chung cho toàn bộ dự án
export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const url = `${baseUrl}${endpoint}`;

  // Lấy token từ localStorage nếu có (cho tính năng bảo mật sau này)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Xóa token và điều hướng về trang đăng nhập khi token hết hạn hoặc không hợp lệ (chuẩn Spring Security)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }

    // Ném lỗi để component bắt (catch) được
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi gọi API: ${response.status}`);
  }

  return response.json();
};

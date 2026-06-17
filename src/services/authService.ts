import { fetchClient } from '../shares/fetchClient';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Hàm giả lập (Mock) gọi API
const mockLogin = async (username: string, password: string) => {
  // Giả lập độ trễ mạng 1 giây
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Logic kiểm tra giả định
  if (username === 'admin' && password === 'admin') {
    return {
      success: true,
      token: 'mock-jwt-token-xyz123',
      user: { id: 1, name: 'Admin' }
    };
  }

  throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
};

// Hàm thật gọi đến Spring Boot Backend
const realLogin = async (username: string, password: string) => {
  return fetchClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

// Hàm export chính sẽ kiểm tra biến môi trường để quyết định dùng MOCK hay REAL
export const loginUser = async (username: string, password: string) => {
  if (USE_MOCK) {
    return mockLogin(username, password);
  } else {
    return realLogin(username, password);
  }
};

const mockForgotPassword = async (username: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (username === 'admin') {
    return { success: true, message: 'Đã gửi thông tin lấy lại mật khẩu vào email của người được thiết lập.' };
  }
  throw new Error('Tên đăng nhập không tồn tại trong hệ thống!');
};

const realForgotPassword = async (username: string) => {
  return fetchClient('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
};

export const forgotPassword = async (username: string) => {
  if (USE_MOCK) {
    return mockForgotPassword(username);
  } else {
    return realForgotPassword(username);
  }
};

const mockChangePassword = async (currentPass: string, newPass: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (currentPass !== 'admin') {
    throw new Error('Mật khẩu hiện tại không đúng!');
  }
  return { success: true, message: 'Đổi mật khẩu thành công!' };
};

const realChangePassword = async (currentPass: string, newPass: string) => {
  return fetchClient('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
  });
};

export const changePassword = async (currentPass: string, newPass: string) => {
  if (USE_MOCK) {
    return mockChangePassword(currentPass, newPass);
  } else {
    return realChangePassword(currentPass, newPass);
  }
};

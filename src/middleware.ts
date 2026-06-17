import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hàm middleware bắt buộc phải được export
export function middleware(request: NextRequest) {
  // Trả về luồng đi tiếp bình thường (không chặn gì cả)
  return NextResponse.next();
}

// (Tùy chọn) Chỉ định middleware chạy trên các đường dẫn nào
export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn request ngoại trừ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

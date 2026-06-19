# Gas Tuấn Đạt - KiotViet Dashboard

Giao diện quản trị (Frontend) cho dự án Gas Tuấn Đạt. Được thiết kế với kiến trúc Single Page Application (SPA), tối ưu hóa trải nghiệm người dùng với tốc độ phản hồi cực nhanh, lấy cảm hứng từ giao diện KiotViet.

## 🚀 Công nghệ sử dụng
- **Framework:** React.js / Next.js
- **Ngôn ngữ:** TypeScript
- **Styling:** CSS thuần / TailwindCSS
- **Thư viện Biểu đồ:** Recharts / Chart.js
- **Quản lý trạng thái & Cache:** Custom hooks kết hợp với Memory Cache (TTL 5 phút).

## ⚙️ Tính năng nổi bật
- **Hiệu năng Dashboard:** Sử dụng kiến trúc nhận *Dữ liệu tính toán sẵn (Aggregated Data)* từ Backend thay vì tự tính toán (Zero-Computation Frontend).
- **Request Deduping:** Thuật toán tự động "gom nhóm" (Deduplicate) các API request gọi cùng lúc, đảm bảo chỉ có duy nhất 1 luồng mạng (network call) được thực thi, giúp tiết kiệm băng thông tối đa.
- **Client-Side Caching:** Dữ liệu Dashboard được lưu vào biến Cache trong 5 phút. Khi chuyển trang (Navigation) và quay lại, giao diện render ngay lập tức dưới 10ms.

## 🛠 Hướng dẫn cài đặt và chạy (Local)

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Các bước cài đặt
1. **Cài đặt thư viện:**
   ```bash
   npm install
   # hoặc
   yarn install
   ```
2. **Cấu hình biến môi trường:**
   Tạo file `.env.local` ở thư mục gốc và cấu hình URL của Backend API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_USE_MOCK=false
   ```
3. **Chạy môi trường phát triển (Development):**
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```
   *Ứng dụng sẽ chạy tại địa chỉ `http://localhost:3000`.*

### Build cho môi trường Production
```bash
npm run build
npm start
```

## 📂 Cấu trúc thư mục chính
- `src/components/`: Các Component UI dùng chung (Bảng biểu, Nút bấm, Modal).
- `src/services/`: Chứa các hàm giao tiếp trực tiếp với Backend (sử dụng fetch/axios có cấu hình Authentication). Nơi chứa logic Cache và Deduping.
- `src/shares/`: Các tệp tiện ích dùng chung (fetchClient xử lý tự động JWT Bearer Token).

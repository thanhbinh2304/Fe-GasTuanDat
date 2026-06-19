# Gas Tuấn Đạt - KiotViet Dashboard

## 📖 Mô tả dự án
Giao diện quản trị (Frontend) cho dự án phần mềm Quản lý Phân phối và Bán lẻ **Gas Tuấn Đạt**. Hệ thống được thiết kế với giao diện trực quan, dễ sử dụng, lấy cảm hứng từ luồng nghiệp vụ của KiotViet nhằm mang lại trải nghiệm thao tác bán hàng, nhập kho và quản lý công nợ nhanh chóng nhất cho nhân viên cửa hàng.

## ✨ Tính năng nổi bật (Nghiệp vụ cốt lõi)
- **Bảng điều khiển (Dashboard) trực quan:** Theo dõi tình hình kinh doanh theo thời gian thực bao gồm: Doanh thu, số lượng đơn hàng, lượng vỏ bình gas bán ra, và biểu đồ thống kê chuyên sâu (Top sản phẩm, Top khách hàng).
- **Quản lý Bán hàng & Sổ Gas:** Giao diện lập hóa đơn bán hàng tối ưu thao tác, dễ dàng tìm kiếm khách hàng, thêm bớt sản phẩm, tính toán chiết khấu và theo dõi chi tiết vỏ bình gas mượn/trả.
- **Kiểm soát Tồn kho & Nhập hàng:** Quản lý hàng hóa, lập phiếu nhập kho nhanh chóng, hỗ trợ quản lý giá nhập/giá bán và mã hàng hóa (SKU).
- **Quản lý Sổ quỹ & Công nợ:** Cung cấp màn hình theo dõi thu/chi chi tiết, tự động cấn trừ công nợ khách hàng và nhà cung cấp.
- **Danh mục linh hoạt:** Quản lý hệ thống danh mục khách hàng, nhóm khách hàng, nhân viên giao hàng, và danh mục sản phẩm.
- **Xác thực & Bảo mật:** Giao diện đăng nhập an toàn, xử lý phân quyền hiển thị theo token (JWT), luồng quên/đặt lại mật khẩu.

## 🚀 Tech Stack
- **Framework:** React.js / Next.js
- **Ngôn ngữ:** TypeScript
- **Styling:** CSS / TailwindCSS
- **Thư viện Biểu đồ:** Recharts / Chart.js
- **Quản lý trạng thái:** React Hooks & Context API
- **Kết nối API:** Custom Fetch Client (tự động gắn JWT Token & xử lý Deduping/Cache)

## 🏛️ Kiến trúc và Cấu trúc dự án

### Kiến trúc phần mềm
Hệ thống áp dụng mô hình **Single Page Application (SPA)** kết hợp với kiến trúc **Component-Based**.
Phần quản lý dữ liệu (Data Fetching) được thiết kế theo hướng **Zero-Computation**: Toàn bộ dữ liệu tính toán lớn được giao cho Backend xử lý, Frontend chỉ đảm nhận việc render UI và lưu trữ dữ liệu (Cache) tĩnh trong bộ nhớ RAM của trình duyệt nhằm tối đa hóa tốc độ phản hồi.

### Cấu trúc thư mục (Directory Structure)
```text
src/
├── components/     # Các trang nghiệp vụ (Pages) và Module UI
│   ├── CashBook/       # Giao diện Quản lý Sổ quỹ (Phiếu Thu/Chi)
│   ├── Customers/      # Giao diện Danh mục Khách hàng
│   ├── Dashboard/      # Giao diện Bảng điều khiển tổng quan
│   ├── ExportOrder/    # Giao diện Bán hàng & Hóa đơn xuất
│   ├── Products/       # Giao diện Danh mục Hàng hóa
│   └── ...
├── services/       # Lớp giao tiếp API (Tích hợp Logic Cache & Deduping)
│   ├── dashboardService.ts
│   ├── exportOrderService.ts
│   └── ...
├── shares/         # Tệp tiện ích, Component UI dùng chung
│   ├── fetchClient.ts  # Cấu hình Fetch chung (Xử lý Bearer Token)
│   ├── Modal.tsx       # Component Cửa sổ Pop-up
│   └── ...
├── styles/         # CSS toàn cục, Tailwind Config
└── utils/          # Các hàm định dạng tiền tệ, ngày tháng (Formatter)
```

## 🛠 Hướng dẫn cài đặt và chạy (Local)

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Các bước cài đặt
1. **Cài đặt thư viện:**
   ```bash
   cd kiotviet-dashboard
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

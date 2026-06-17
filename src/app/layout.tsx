import type { Metadata } from "next";
import "./globals.css";
import { ToastConfirmProvider } from "@/components/ToastConfirm/ToastConfirmContext";
import ChatbotUI from "@/components/ChatbotUI/ChatbotUI";

export const metadata: Metadata = {
  title: "Gas Tuấn Đạt - Đăng nhập",
  description: "Quản lý gas Tuấn Đạt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ToastConfirmProvider>
          {children}
          <ChatbotUI />
        </ToastConfirmProvider>
      </body>
    </html>
  );
}

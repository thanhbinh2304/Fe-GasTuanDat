import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import DashboardContent from "@/components/Dashboard/DashboardContent";
import FloatingButtons from "@/components/FloatingButtons/FloatingButtons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gas Tuấn Đạt - Tổng quan",
  description: "Quản lý gas Tuấn Đạt",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Navbar />
      <main style={{ padding: '16px 24px', flex: 1, display: 'flex', gap: '20px', minWidth: 0 }}>
        <DashboardContent />
      </main>
      {/* <FloatingButtons /> */}
    </>
  );
}

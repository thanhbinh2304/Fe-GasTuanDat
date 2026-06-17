'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import { Search, Download, Printer } from 'lucide-react';
import styles from './ProductReportPage.module.css';
import { reportService, ImportReportItem, ExportReportItem } from '@/services/reportService';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

const getUnitName = (unit: number) => {
  switch (unit) {
    case 1: return 'Bộ';
    case 2: return 'Cái';
    case 3: return 'Bình';
    case 4: return 'Bao';
    default: return 'Khác';
  }
};

export default function ProductReportPage() {
  const [focus, setFocus] = useState('xuat_hang');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [importData, setImportData] = useState<ImportReportItem[]>([]);
  const [exportData, setExportData] = useState<ExportReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [focus, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (focus === 'nhap_hang') {
        const data = await reportService.getImportReport(startDate, endDate);
        setImportData(data);
      } else {
        const data = await reportService.getExportReport(startDate, endDate);
        setExportData(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render Table Head
  const renderThead = () => {
    if (focus === 'nhap_hang') {
      return (
        <tr>
          <th className={styles.thCode}>Mã hàng hóa</th>
          <th className={styles.thName}>Tên hàng hóa</th>
          <th className={styles.thUnit}>Đơn vị</th>
          <th className={styles.thNum}>Số lượng</th>
          <th className={styles.thNum}>Tổng tiền nhập hàng</th>
        </tr>
      );
    }

    // Xuất hàng
    return (
      <tr>
        <th className={styles.thCode}>Mã hàng hóa</th>
        <th className={styles.thName}>Tên hàng hóa</th>
        <th className={styles.thUnit}>Đơn vị</th>
        <th className={styles.thNum}>Số lượng</th>
        <th className={styles.thNum}>Tổng tiền xuất hàng</th>
        <th className={styles.thNum}>Giá vốn</th>
        <th className={styles.thNum}>Tổng tiền vốn</th>
        <th className={styles.thNum}>Lợi nhuận</th>
      </tr>
    );
  };

  // Render Table Body
  const renderTbody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={focus === 'nhap_hang' ? 5 : 8} style={{ textAlign: 'center', padding: '20px' }}>
            Đang tải dữ liệu...
          </td>
        </tr>
      );
    }

    if (focus === 'nhap_hang') {
      if (importData.length === 0) {
        return <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu nhập hàng</td></tr>;
      }
      return importData.map((d, i) => (
        <tr key={i} className={styles.tr}>
          <td className={styles.tdCode} style={{ color: 'var(--primary-color)' }}>{d.productCode}</td>
          <td className={styles.tdName}>{d.productName}</td>
          <td className={styles.tdUnit}>{getUnitName(d.unit)}</td>
          <td className={styles.tdNum}>{formatCurrency(d.qty)}</td>
          <td className={styles.tdNum} style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{formatCurrency(d.totalImportValue)}</td>
        </tr>
      ));
    }

    // Xuất hàng
    if (exportData.length === 0) {
      return <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu xuất hàng</td></tr>;
    }
    return exportData.map((d, i) => {
      const profit = d.profit;
      return (
        <tr key={i} className={styles.tr}>
          <td className={styles.tdCode} style={{ color: 'var(--primary-color)' }}>{d.productCode}</td>
          <td className={styles.tdName}>{d.productName}</td>
          <td className={styles.tdUnit}>{getUnitName(d.unit)}</td>
          <td className={styles.tdNum}>{formatCurrency(d.qty)}</td>
          <td className={styles.tdNum}>{formatCurrency(d.totalExportValue)}</td>
          <td className={styles.tdNum}>{formatCurrency(d.costPrice)}</td>
          <td className={styles.tdNum}>{formatCurrency(d.totalCost)}</td>
          <td className={styles.tdNum} style={{ color: profit > 0 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
            {formatCurrency(profit)}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        {/* SIDEBAR FILTER */}
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Thời gian</span>
            </div>
            <div className={styles.dateFilterGroup}>
              <div className={styles.dateField}>
                <label>Từ ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className={styles.dateField}>
                <label>Đến ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Mối quan tâm</span>
            </div>
            <select className={styles.sideSelect} style={{ marginTop: '8px' }} value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="nhap_hang">Nhập hàng</option>
              <option value="xuat_hang">Xuất hàng</option>
            </select>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className={styles.main}>
          <div className={styles.toolbar} style={{ justifyContent: 'flex-end' }}>
            <button className={styles.btnPrimary} style={{ backgroundColor: '#8c8c8c' }} onClick={() => window.print()}>
              <Printer size={14} />
              In
            </button>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.stockTableWrapper}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  {renderThead()}
                </thead>
                <tbody>
                  {renderTbody()}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                <button className={styles.pageBtn} disabled>&gt;</button>
              </div>
              <span className={styles.footerInfo}>Hiển thị 1 - {focus === 'nhap_hang' ? importData.length : exportData.length} trên tổng số {focus === 'nhap_hang' ? importData.length : exportData.length} kết quả</span>
            </div>
          </div>
        </main>
      </div>

      {/* VÙNG IN BÁO CÁO */}
      <div className={styles.printArea} style={{ display: 'none' }}>
        <div className={styles.printHeader}>
          <div className={styles.printHeaderLeft}>
            <div className={styles.printCompany}>NHÀ PHÂN PHỐI GAS TUẤN ĐẠT</div>
            <div className={styles.printText}>Tổ 16, P.Tân Quang, TP.Tuyên Quang</div>
            <div className={styles.printText}>ĐT: 0987.203.989 | 0866.657.088</div>
          </div>
          <div className={styles.printHeaderRight}>
            <div className={styles.printTitle}>BÁO CÁO HÀNG HÓA</div>
            <div className={styles.printText}>Từ: {new Date(startDate).toLocaleDateString('vi-VN')} - Đến: {new Date(endDate).toLocaleDateString('vi-VN')}</div>
            <div className={styles.printText}>Loại: {focus === 'nhap_hang' ? 'Nhập hàng' : 'Xuất hàng'}</div>
          </div>
        </div>

        <table className={styles.printTable}>
          <thead>
            {renderThead()}
          </thead>
          <tbody>
            {renderTbody()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

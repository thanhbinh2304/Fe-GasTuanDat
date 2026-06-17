'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import { Printer } from 'lucide-react';
import styles from './ProductReportPage.module.css';
import { reportService, SaleInvoiceReportItem } from '@/services/reportService';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

export default function ExportReportPage() {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<SaleInvoiceReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await reportService.getExportSummaryReport(startDate, endDate);
      setData(result);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu báo cáo xuất hàng:', error);
    } finally {
      setLoading(false);
    }
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
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Thời gian</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Tổng số phiếu xuất hàng</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Tổng số khách hàng</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Tổng tiền</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Tổng giảm giá</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Tổng sau giảm giá</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Tổng thu</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Tổng còn nợ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu xuất hàng</td>
                    </tr>
                  ) : (
                    data.map((d, i) => (
                      <tr key={i} className={styles.tr}>
                        <td style={{ padding: '12px 16px', color: 'var(--primary-color)' }}>{d.time}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{d.totalReceipts}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{d.totalCustomers}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(d.totalAmount)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--danger-color)' }}>{formatCurrency(d.totalDiscount)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(d.totalAfterDiscount)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(d.totalRevenue)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: d.totalDebt > 0 ? 'var(--danger-color)' : 'var(--text-dark)' }}>{formatCurrency(d.totalDebt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                <button className={styles.pageBtn} disabled>&gt;</button>
              </div>
              <span className={styles.footerInfo}>Hiển thị 1 - {data.length} trên tổng số {data.length} kết quả</span>
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
            <div className={styles.printTitle}>BÁO CÁO XUẤT HÀNG</div>
            <div className={styles.printText}>Từ: {new Date(startDate).toLocaleDateString('vi-VN')} - Đến: {new Date(endDate).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Tổng số phiếu xuất hàng</th>
              <th>Tổng số KH</th>
              <th>Tổng tiền</th>
              <th>Tổng giảm giá</th>
              <th>Tổng sau giảm giá</th>
              <th>Tổng thu</th>
              <th>Tổng còn nợ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.time}</td>
                <td style={{ textAlign: 'center' }}>{d.totalReceipts}</td>
                <td style={{ textAlign: 'center' }}>{d.totalCustomers}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(d.totalAmount)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(d.totalDiscount)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(d.totalAfterDiscount)}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(d.totalRevenue)}</td>
                <td style={{ textAlign: 'right', color: d.totalDebt > 0 ? 'red' : 'inherit' }}>{formatCurrency(d.totalDebt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

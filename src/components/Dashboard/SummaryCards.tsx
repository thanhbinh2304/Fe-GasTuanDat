'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, Receipt, Flame, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './SummaryCards.module.css';
import { getSummaryData } from '../../services/dashboardService';

export default function SummaryCards() {
  const [data, setData] = useState({ revenue: 0, receipts: 0, invoices: 0, gasVolume: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getSummaryData();
        setData(result);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        Kết quả bán hàng hôm nay
        {isLoading && <Loader2 size={16} className={styles.loadingIcon} style={{ marginLeft: '10px', animation: 'spin 1s linear infinite' }} />}
      </div>
      <div className={styles.cards}>
        {/* Doanh thu */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <span className={clsx(styles.iconCircle, styles.green)}>
              <DollarSign size={13} />
            </span>
            Doanh thu
          </div>
          <div className={styles.cardValue}>{isLoading ? '...' : formatNumber(data.revenue)}</div>
          <div className={styles.cardSub}>&nbsp;</div>
        </div>

        {/* Thực thu */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <span className={clsx(styles.iconCircle, styles.blue)}>
              <Wallet size={12} />
            </span>
            Thực thu
          </div>
          <div className={styles.cardValue}>{isLoading ? '...' : formatNumber(data.receipts)}</div>
          <div className={styles.cardSub}>&nbsp;</div>
        </div>

        {/* Hóa đơn */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <span className={clsx(styles.iconCircle, styles.orange)}>
              <Receipt size={12} />
            </span>
            Hóa đơn
          </div>
          <div className={styles.cardValue}>{isLoading ? '...' : formatNumber(data.invoices)}</div>
          <div className={styles.cardSub}>&nbsp;</div>
        </div>

        {/* Sản lượng gas */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <span className={clsx(styles.iconCircle, styles.red)}>
              <Flame size={12} />
            </span>
            Sản lượng gas
          </div>
          <div className={styles.cardValue}>{isLoading ? '...' : `${formatNumber(data.gasVolume)} bình`}</div>
          <div className={styles.cardSub}>&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

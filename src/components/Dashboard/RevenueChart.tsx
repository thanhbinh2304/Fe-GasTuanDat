'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Info, Maximize2, Loader2 } from 'lucide-react';
import styles from './RevenueChart.module.css';
import { getRevenueChartData } from '../../services/dashboardService';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '6px 10px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ color: '#444', fontWeight: 600 }}>{label.includes('/') ? `Ngày ${label}` : label}</div>
        <div style={{ fontWeight: 700, color: '#1255a8' }}>{payload[0].value.toLocaleString('vi-VN')} đ</div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDate = now.getDate();
  const defaultMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const [selectedMonthStr, setSelectedMonthStr] = useState<string>(defaultMonthStr);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!selectedMonthStr) return;
    const [yearStr, monthStr] = selectedMonthStr.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    let endDay = new Date(year, month, 0).getDate();
    if (year === currentYear && month === currentMonth) {
      endDay = currentDate;
    }
    const eDay = String(endDay).padStart(2, '0');
    
    setStartDate(`${year}-${monthStr}-01`);
    setEndDate(`${year}-${monthStr}-${eDay}`);
  }, [selectedMonthStr]);
  const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getRevenueChartData(startDate, endDate);
        setChartData(data);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    return `${tickItem / 1000000}M`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>Doanh thu thuần theo tháng</span>
        </div>
        <div className={styles.dateRange}>
          <input
            type="month"
            className={styles.dateInput}
            value={selectedMonthStr}
            onChange={(e) => setSelectedMonthStr(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.chartContainer}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '10px' }}>
            <Loader2 size={32} className={styles.loadingIcon} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)' }} />
            <span style={{ color: '#666', fontSize: '14px' }}>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ fill: '#666', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: '#f5f5f5' }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="value"
                fill="var(--primary-color)"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

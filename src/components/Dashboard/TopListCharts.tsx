'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';
import styles from './TopListCharts.module.css';
import { getTopProductsData, getTopCustomersData } from '../../services/dashboardService';

const formatXAxis = (value: number) => `${value} tr`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '6px 10px', fontSize: 12 }}>
        <div style={{ color: '#444', fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#1255a8', fontWeight: 700 }}>{(payload[0].value * 1000000).toLocaleString('vi-VN')} đ</div>
      </div>
    );
  }
  return null;
};

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width + 4} y={y + 9} fill="#666" fontSize={11} textAnchor="start">
      {value}
    </text>
  );
};

function HorizontalBarChart({ data, maxValue }: { data: any[], maxValue: number }) {
  const [isMounted, setIsMounted] = useState(false);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const element = chartRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSize = () => {
      setChartSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      {isMounted && chartSize.width > 0 && chartSize.height > 0 ? (
        <BarChart
          width={chartSize.width}
          height={chartSize.height}
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 55, left: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="0" horizontal={false} stroke="#f0f0f0" />
          <XAxis
            type="number"
            domain={[0, maxValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#999' }}
            tickFormatter={formatXAxis}
            tickCount={7}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#444', width: 180 }}
            width={190}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" fill="#1f8ef1" radius={[0, 2, 2, 0]}>
            <LabelList dataKey="display" content={<CustomLabel />} />
          </Bar>
        </BarChart>
      ) : null}
    </div>
  );
}

function TopProductsPanel() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  
  const [startDate, setStartDate] = useState(`${year}-${month}-01`);
  const [endDate, setEndDate] = useState(`${year}-${month}-${date}`);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getTopProductsData(startDate, endDate);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Top 10 hàng bán chạy</span>
        <div className={styles.filters}>
          <div className={styles.dateRange}>
            <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className={styles.dateSeparator}>-</span>
            <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '10px' }}>
            <Loader2 size={24} className={styles.loadingIcon} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)' }} />
          </div>
        ) : (
          <HorizontalBarChart data={data} maxValue={Math.max(...data.map(d => d.value)) * 1.2 || 36} />
        )}
      </div>
    </div>
  );
}

function TopCustomersPanel() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  
  const [startDate, setStartDate] = useState(`${year}-${month}-01`);
  const [endDate, setEndDate] = useState(`${year}-${month}-${date}`);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getTopCustomersData(startDate, endDate);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Top 10 khách mua nhiều nhất</span>
        <div className={styles.filters}>
          <div className={styles.dateRange}>
            <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className={styles.dateSeparator}>-</span>
            <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '10px' }}>
            <Loader2 size={24} className={styles.loadingIcon} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)' }} />
          </div>
        ) : (
          <HorizontalBarChart data={data} maxValue={Math.max(...data.map(d => d.value)) * 1.2 || 24} />
        )}
      </div>
    </div>
  );
}

export default function TopListCharts() {
  return (
    <div className={styles.wrapper}>
      <TopProductsPanel />
      <TopCustomersPanel />
    </div>
  );
}

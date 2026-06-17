'use client';

import { useEffect, useState } from 'react';
import SummaryCards from './SummaryCards';

type ChartComponent = () => React.JSX.Element;

function ChartSlot({ height, children }: { height: number; children?: React.ReactNode }) {
    return <div style={{ minHeight: height }}>{children}</div>;
}

function useClientComponent<T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) {
    const [Component, setComponent] = useState<T | null>(null);

    useEffect(() => {
        let active = true;

        loader().then((module) => {
            if (active) {
                setComponent(() => module.default);
            }
        });

        return () => {
            active = false;
        };
    }, [loader]);

    return Component;
}

function RevenueChartLoader() {
    const RevenueChart = useClientComponent(() => import('./RevenueChart'));
    return RevenueChart ? <RevenueChart /> : <ChartSlot height={260} />;
}

function TopListChartsLoader() {
    const TopListCharts = useClientComponent(() => import('./TopListCharts'));
    return TopListCharts ? <TopListCharts /> : <ChartSlot height={320} />;
}

export default function DashboardContent() {
    const [isEmployee, setIsEmployee] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(payloadBase64));
                const roleName = (payload.role || '').toLowerCase();
                if (roleName.includes('nhân viên') || roleName.includes('nhan vien') || roleName.includes('nhan_vien')) {
                    setIsEmployee(true);
                }
            }
        } catch { /* ignore */ }
        setIsLoading(false);
    }, []);

    if (isLoading) return null;

    if (isEmployee) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#666' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Không có quyền truy cập</h2>
                <p>Tài khoản của bạn không được phép xem nội dung Tổng quan.</p>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <SummaryCards />
            <RevenueChartLoader />
            <TopListChartsLoader />
        </div>
    );
}

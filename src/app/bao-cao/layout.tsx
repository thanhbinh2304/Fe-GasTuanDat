'use client';
import React, { useEffect, useState } from 'react';

export default function BaoCaoLayout({ children }: { children: React.ReactNode }) {
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
                <p>Tài khoản của bạn không được phép xem nội dung Báo cáo.</p>
            </div>
        );
    }

    return <>{children}</>;
}

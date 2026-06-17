'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Users, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddAccountModal from './AddAccountModal';
import AccountDetailModal from './AccountDetailModal';
import styles from './AccountPage.module.css';
import { getAccounts, createAccount, updateAccount, deleteAccount, Account, GetAccountsParams } from '@/services/accountService';
import { getRoles, Role } from '@/services/roleService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';

const PAGE_SIZE = 15;

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToastConfirm();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchAccounts = async (params: GetAccountsParams) => {
    setLoading(true);
    try {
      const res = await getAccounts(params);
      setAccounts(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts({ page, pageSize: PAGE_SIZE, keyword, role });
  }, [page, keyword, role]);

  useEffect(() => {
    getRoles().then(data => setRoles(data));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setPage(1);
  };

  const handleSaveAccount = async (updated: Account) => {
    try {
      await updateAccount(updated.id, updated);
      fetchAccounts({ page, pageSize: PAGE_SIZE, keyword, role });
      setSelectedAccount(null);
    } catch (e) {
      console.error(e);
      showToast('Cập nhật thất bại', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      fetchAccounts({ page, pageSize: PAGE_SIZE, keyword, role });
      setSelectedAccount(null);
    } catch (e) {
      console.error(e);
      showToast('Xóa thất bại', 'error');
    }
  };

  const handleCreateAccount = async (newAcc: Account) => {
    try {
      await createAccount(newAcc);
      fetchAccounts({ page, pageSize: PAGE_SIZE, keyword, role });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Thêm mới thất bại', 'error');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Vai trò</span>
            </div>
            <select className={styles.sideSelect} value={role} onChange={handleRoleChange}>
              <option value="all">Tất cả</option>
              {roles.map(r => (
                <option key={r.roleId} value={r.roleName}>{r.roleName}</option>
              ))}
            </select>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Theo mã, tên đăng nhập..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => setIsAddModalOpen(true)}>
                <Plus size={15} />
                Thêm mới
              </button>
            </div>
          </div>

          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.stateBox}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thCode}>Mã tài khoản</th>
                      <th className={styles.thName}>Tên đăng nhập</th>
                      <th className={styles.thGroup}>Vai trò</th>
                      <th className={styles.thCode}>Mã nhân viên</th>
                      <th className={styles.thName}>Tên nhân viên</th>
                      <th className={styles.thDebt}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          <Users size={32} className={styles.emptyIcon} />
                          <span>Không có tài khoản nào</span>
                        </td>
                      </tr>
                    ) : (
                      accounts.map((a) => (
                        <tr key={a.id} className={styles.tr} onClick={() => setSelectedAccount(a)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{a.code}</span></td>
                          <td className={styles.tdName}>{a.username}</td>
                          <td className={styles.tdGroup} style={{ textTransform: 'capitalize' }}>{a.role}</td>
                          <td className={styles.tdCode}>{a.employeeCode}</td>
                          <td className={styles.tdName}>{a.employeeName}</td>
                          <td className={styles.tdDebt}>{a.notes || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                  <div className={styles.footerInfo}>
                    Hiển thị {(page - 1) * PAGE_SIZE + (accounts.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} tài khoản
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          accounts={accounts}
          onClose={() => setSelectedAccount(null)}
          onSave={handleSaveAccount}
          onDelete={handleDeleteAccount}
        />
      )}

      {isAddModalOpen && (
        <AddAccountModal
          accounts={accounts}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateAccount}
        />
      )}
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Users, ChevronLeft, Download, Upload, GripVertical, Pencil } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddEmployeeModal from './AddEmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import FilterItemModal, { FilterItemType, FilterItemMode } from '@/components/Customer/FilterItemModal';
import styles from './EmployeePage.module.css';
import { getEmployees, getPositions, Employee, GetEmployeesParams, Position } from '@/services/employeeService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';

const PAGE_SIZE = 15;

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  const [filterModalConfig, setFilterModalConfig] = useState<{
    isOpen: boolean;
    type: FilterItemType;
    mode: FilterItemMode;
    initialData?: { code: string; name: string } | null;
  }>({
    isOpen: false,
    type: 'jobTitle',
    mode: 'create',
    initialData: null,
  });

  const openFilterModal = (mode: FilterItemMode, initialData: { code: string; name: string } | null = null) => {
    setFilterModalConfig({ isOpen: true, type: 'jobTitle', mode, initialData });
  };

  const closeFilterModal = () => {
    setFilterModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToastConfirm();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchEmployees = async (params: GetEmployeesParams) => {
    setLoading(true);
    try {
      const res = await getEmployees(params);
      setEmployees(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees({ page, pageSize: PAGE_SIZE, keyword, jobTitle });
  }, [page, keyword, jobTitle]);

  useEffect(() => {
    getPositions().then(setPositions).catch(console.error);
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

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobTitle(e.target.value);
    setPage(1);
  };

  const handleSaveEmployee = (updated: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setTotal((t) => t - 1);
    setSelectedEmployee(null);
  };

  const handleCreateEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
    setTotal((t) => t + 1);
    setIsAddModalOpen(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Chức danh</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('create')}>Tạo mới</button>
            </div>
            <select className={styles.sideSelect} value={jobTitle} onChange={handleJobTitleChange}>
              <option value="">Tất cả</option>
              {positions.map(p => (
                <option key={p.positionId} value={p.positionName}>{p.positionName}</option>
              ))}
            </select>
            <ul className={styles.sideList}>
              {positions.map(p => (
                <li key={p.positionId} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{p.positionName}</span>
                  <Pencil size={14} className={styles.editIcon} onClick={() => openFilterModal('edit', { code: p.positionId, name: p.positionName })} />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Theo mã, tên, điện thoại..."
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
                      <th className={styles.thCode}>Mã nhân viên</th>
                      <th className={styles.thName}>Tên nhân viên</th>
                      <th className={styles.thPhone}>Điện thoại</th>
                      <th className={styles.thGroup}>Chức danh</th>
                      <th className={styles.thDebt}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          <Users size={32} className={styles.emptyIcon} />
                          <span>Không có nhân viên nào</span>
                        </td>
                      </tr>
                    ) : (
                      employees.map((e) => (
                        <tr key={e.id} className={styles.tr} onClick={() => setSelectedEmployee(e)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{e.code}</span></td>
                          <td className={styles.tdName}>{e.employeeName}</td>
                          <td className={styles.tdPhone}>{e.phoneNumber}</td>
                          <td className={styles.tdGroup}>{e.jobTitle}</td>
                          <td className={styles.tdDebt}>{e.notes || '—'}</td>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (employees.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} nhân viên
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}

      {isAddModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateEmployee}
        />
      )}

      <FilterItemModal
        isOpen={filterModalConfig.isOpen}
        onClose={closeFilterModal}
        onSave={async (data) => {
          if (filterModalConfig.type === 'jobTitle') {
            try {
              if (filterModalConfig.mode === 'create') {
                await import('@/services/employeeService').then(m => m.createPosition({ positionName: data.name }));
              } else if (filterModalConfig.mode === 'edit' && filterModalConfig.initialData?.code) {
                await import('@/services/employeeService').then(m => m.updatePosition(filterModalConfig.initialData!.code, { positionName: data.name }));
              }
              const p = await getPositions();
              setPositions(p);
            } catch (error) {
              console.error('Failed to save position:', error);
            }
          }
        }}
        onDelete={async () => {
          if (filterModalConfig.type === 'jobTitle' && filterModalConfig.initialData?.code) {
            try {
              await import('@/services/employeeService').then(m => m.deletePosition(filterModalConfig.initialData!.code));
              const p = await getPositions();
              setPositions(p);
            } catch (error) {
              console.error('Failed to delete position:', error);
            }
          }
        }}
        type={filterModalConfig.type}
        mode={filterModalConfig.mode}
        initialData={filterModalConfig.initialData}
      />
    </div>
  );
}

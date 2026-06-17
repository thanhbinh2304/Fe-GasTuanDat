'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, X, Plus, User, RotateCw,
  Trash2, MoreVertical, Edit3
} from 'lucide-react';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import SupplierSearchInput from './SupplierSearchInput';
import { Supplier } from '@/services/supplierService';
import styles from './OrderProcessingPage.module.css';

// ─── Types ─────────────────────────────────────────────
type LineItem = {
  id: string | number; code: string; name: string; unit: string;
  qty: number; price: number; total: number; stock: number;
  rawProduct?: Product;
};

import { Employee, getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { updatePurchaseOrder, createPurchaseOrder } from '@/services/purchaseOrderService';

type TabData = {
  id: number;
  label: string;
  items: LineItem[];
  discount: number;
  paidAmount: number;
  notes: string;
  code: string;
  orderType: string;
  warehouse: string;
  supplier: Supplier | null;
  employee: Employee | null;
  purchaseId?: string;
};

const createEmptyTab = (id: number): TabData => ({
  id,
  label: `Phiếu nhập ${id}`,
  items: [],
  discount: 0,
  paidAmount: 0,
  notes: '',
  code: '',
  orderType: 'dat',
  warehouse: '',
  supplier: null,
  employee: null,
});

import SupplierDetailModal from '@/components/Supplier/SupplierDetailModal';
import { Supplier as AppSupplier } from '@/components/Supplier/SupplierPage';
import AddSupplierModal from '@/components/Supplier/AddSupplierModal';
import EmployeeSearchInput from '@/components/ExportProcessing/EmployeeSearchInput';
import { FilterItem, getPriceBooks, getStocks } from '@/services/productFilterService';

import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';

// ─── Component ─────────────────────────────────────────
export default function OrderProcessingPage() {
  const { showToast } = useToastConfirm();
  const [tabs, setTabs] = useState<TabData[]>([createEmptyTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [detailSupplier, setDetailSupplier] = useState<AppSupplier | null>(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  const [priceLists, setPriceLists] = useState<FilterItem[]>([]);
  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    Promise.all([getPriceBooks(), getStocks(), getWards(), getAreas()])
      .then(([plRes, stRes, wRes, aRes]) => {
        setPriceLists(plRes);
        setStocks(stRes);
        setWards(wRes);
        setAreas(aRes);
      })
      .catch(err => console.error('Failed to load filter data', err));
  }, []);

  const handleDetailClick = (s: Supplier) => {
    setDetailSupplier({
      id: s.id,
      code: s.code,
      supplierName: s.supplierName,
      phone: s.phone,
      email: s.email,
      address: s.address,
      wardId: s.wardId,
      notes: s.notes,
      debt: s.debt || 0
    });
  };

  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('pendingOrderToProcess');
      if (pendingRaw) {
        const order = JSON.parse(pendingRaw);
        localStorage.removeItem('pendingOrderToProcess');
        setTabs(prev => {
          const t = { ...prev[0] };
          t.code = order.purchaseCode || order.code || '';
          t.notes = order.notes || order.note || '';
          t.discount = order.discount || 0;
          t.paidAmount = order.paidAmount || 0;
          t.purchaseId = order.id || order.purchaseId;

          t.warehouse = order.stockId || '';
          
          if (order.orderType === 'Nhaphang' || order.orderType === 'nhap') {
            t.orderType = 'nhap';
          } else if (order.orderType === 'Dathang' || order.orderType === 'dat') {
            t.orderType = 'dat';
          }

          if (order.items) {
            t.items = order.items.map((i: any) => ({ ...i, stock: i.stock || 0 }));
            
            import('@/services/productService').then(({ getProductById }) => {
              Promise.all(order.items.map((i: any) => getProductById(i.id).catch(() => null)))
                .then(products => {
                  setTabs(tabs => tabs.map(tab => {
                    if (tab.id !== t.id) return tab;
                    return {
                      ...tab,
                      items: tab.items.map((item, index) => {
                        const fullProd = products[index];
                        if (!fullProd) return item;
                        
                        let newStock = fullProd.stock;
                        if (tab.warehouse && fullProd.warehouses) {
                          const w = fullProd.warehouses.find((wh: any) => String(wh.stockId) === String(tab.warehouse));
                          if (w) newStock = w.quantity;
                        }
                        
                        let finalQty = item.qty;
                        if (tab.orderType === 'nhap' && finalQty < 0 && Math.abs(finalQty) > newStock) {
                          finalQty = -newStock;
                        }
                        
                        return { ...item, qty: finalQty, total: finalQty * item.price, stock: newStock, rawProduct: fullProd };
                      })
                    };
                  }));
                });
            });
          }

          // Set supplier safely
          if (order.supplierCode && order.supplierName) {
            t.supplier = {
              id: order.supplierId || '', // use actual supplierId if available
              code: order.supplierCode,
              supplierName: order.supplierName,
              phone: '',
              email: '',
              notes: '',
              debt: 0
            };
            if (order.supplierId) {
              import('@/services/supplierService').then(({ getSupplierById }) => {
                getSupplierById(order.supplierId)
                  .then(fullSup => {
                    setTabs(tabs => tabs.map(tab => tab.id === t.id ? { ...tab, supplier: fullSup } : tab));
                  })
                  .catch(console.error);
              });
            }
          }
          
          if (order.employeeId && order.creator) {
            t.employee = {
              id: order.employeeId || '',
              employeeName: order.creator,
              code: '', phoneNumber: '', jobTitle: '', notes: ''
            } as any;
          }

          return [t];
        });
      }
    } catch { /* ignore */ }
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId)!;

  // ─── Tab CRUD ──────────────────────────────────────
  const handleAddTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs(prev => [...prev, createEmptyTab(newId)]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
  };

  // ─── Update helper ─────────────────────────────────
  const updateTab = (patch: Partial<TabData>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...patch } : t));
  };

  // ─── Import items ──────────────────────────────────
  const handleSelectImportProduct = (product: Product) => {
    updateTab({
      items: (() => {
        const exists = activeTab.items.find(i => i.id === product.id);
        if (exists) {
          return activeTab.items.map(i =>
            i.id === product.id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price } : i
          );
        }
        return [...activeTab.items, {
          id: product.id, code: product.code, name: (product as any).displayName || product.name,
          unit: product.unit || 'Cái', qty: 1, price: 0, total: 0,
          stock: product.stock, rawProduct: product
        }];
      })()
    });
  };

  const handleQtyChange = (id: string | number, val: string) => {
    let num = Number(val);
    if (isNaN(num)) num = 0;
    
    updateTab({
      items: activeTab.items.map(i => {
        if (i.id === id) {
          let finalQty = num;
          if (i.rawProduct && activeTab.orderType === 'nhap' && finalQty < 0) {
            if (Math.abs(finalQty) > i.stock) {
              finalQty = -i.stock;
            }
          }
          return { ...i, qty: finalQty, total: finalQty * i.price };
        }
        return i;
      })
    });
  };

  const handlePriceChange = (id: string | number, val: string) => {
    const num = Number(val.replace(/\D/g, '')) || 0;
    updateTab({ items: activeTab.items.map(i => i.id === id ? { ...i, price: num, total: i.qty * num } : i) });
  };

  const handleDeleteItem = (id: string | number) => {
    updateTab({ items: activeTab.items.filter(i => i.id !== id) });
  };



  // ─── Current user ──────────────────────────────────
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // ─── Derived values ────────────────────────────────
  const formatCurrency = (n: any) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0);
  const totalAmount = activeTab.items.reduce((s, i) => s + i.total, 0);
  const finalAmount = totalAmount - activeTab.discount;

  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }));
  }, []);

  const handleComplete = async () => {
    if (!activeTab.warehouse) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (activeTab.items.length === 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (activeTab.items.some(i => i.qty === 0)) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (!activeTab.supplier) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (activeTab.orderType === 'nhap' && activeTab.items.some(i => i.qty < 0 && Math.abs(i.qty) > i.stock)) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    try {
      const { 
        createPurchaseOrder, 
        createPurchaseDetail, 
        updatePurchaseOrder, 
        getPurchaseDetailsByOrderId, 
        deletePurchaseDetail 
      } = await import('@/services/purchaseOrderService');
      
      const payload = {
        purchaseCode: activeTab.code || undefined,
        totalAmount,
        discountAmount: activeTab.discount,
        paidAmount: activeTab.paidAmount,
        note: activeTab.notes,
        orderType: activeTab.orderType === 'nhap' ? 'Nhaphang' : 'Dathang',
        supplierId: activeTab.supplier?.id,
        employeeId: activeTab.employee?.id,
        stockId: activeTab.warehouse || undefined,
      };

      if (activeTab.purchaseId) {
        const orderId = activeTab.purchaseId;
        
        // Clear old details
        const existingDetails = await getPurchaseDetailsByOrderId(orderId);
        for (const ed of existingDetails) {
          if (ed.id) {
            await deletePurchaseDetail(ed.id);
          }
        }
        
        // Add new details
        for (const item of activeTab.items) {
          await createPurchaseDetail({
            purchaseId: orderId,
            productId: item.id,
            quantity: item.qty,
            purchasePrice: item.price,
            total: item.total
          });
        }
        
        // Update order last (so backend sees new details if orderType changes)
        await updatePurchaseOrder(orderId, payload);

      } else {
        const order = await createPurchaseOrder(payload);
        for (const item of activeTab.items) {
          await createPurchaseDetail({
            purchaseId: order.purchaseId || order.id,
            productId: item.id,
            quantity: item.qty,
            purchasePrice: item.price,
            total: item.total
          });
        }
      }

      showToast('Thao tác thành công', 'success');
      setTimeout(() => {
        window.location.href = '/dat-hang-nhap';
      }, 500);
    } catch (error) {
      console.error('Lỗi khi hoàn thành phiếu:', error);
      showToast('Thao tác không thành công', 'error');
    }
  };

  // ─── Render ────────────────────────────────────────
  return (
    <div className={styles.pageWrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ width: '320px', margin: '0 16px' }}>
          <ProductSearchInput 
            placeholder="Tìm hàng nhập" 
            onSelect={handleSelectImportProduct}
            stockId={activeTab.warehouse}
            disabled={!activeTab.warehouse}
            allowZeroStock={true}
          />
        </div>

        <div className={styles.tabsSection}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`${styles.tab} ${activeTabId === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <RotateCw size={13} style={{ marginRight: 6 }} />
              {tab.label}
              <X size={13} className={styles.closeTabBtn} onClick={(e) => handleCloseTab(tab.id, e)} />
            </div>
          ))}
          <button className={styles.addTabBtn} onClick={handleAddTab} title="Thêm phiếu">
            <Plus size={16} />
          </button>
        </div>

        <div className={styles.headerRight}>
          <Link href="/xu-ly-xuat-hang" target="_blank" rel="noopener noreferrer" className={styles.banHangBtn}>
            <ShoppingCart size={16} />
            Bán hàng
          </Link>
        </div>
      </header>

      {/* BODY */}
      <div className={styles.body}>
        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>
          {/* TOP HALF: Nhập hàng */}
          <div className={styles.topHalf}>
            <div className={styles.productList} style={{ marginBottom: '16px' }}>
              {activeTab.items.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                  Chưa có hàng nhập — tìm hàng hóa ở ô tìm kiếm phía trên
                </div>
              ) : (
                activeTab.items.map((item, index) => (
                  <div key={item.id} className={styles.productRow}>
                    <div className={styles.indexBox}>{index + 1}</div>
                    <Trash2 size={16} className={styles.deleteIcon} onClick={() => handleDeleteItem(item.id)} />
                    <div className={styles.prodCode}>{item.code}</div>
                    <div className={styles.prodName}>{item.name}</div>
                    <div className={styles.prodUnit}>{item.unit}</div>
                    <div className={styles.qtyInputBox}>
                      <input
                        type="number"
                        className={styles.qtyInput}
                        value={item.qty === 0 ? '' : item.qty}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      />
                    </div>
                    <div className={styles.priceInputBox}>
                      <input
                        type="text"
                        className={styles.priceInput}
                        value={formatCurrency(item.price)}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      />
                    </div>
                    <div className={styles.totalBox}>{formatCurrency(item.total)}</div>
                  </div>
                ))
              )}
            </div>
          </div>



          <div className={styles.notesWrapper}>
            <Edit3 size={16} color="#888" />
            <input
              type="text"
              placeholder="Ghi chú đơn hàng"
              className={styles.notesInput}
              value={activeTab.notes}
              onChange={(e) => updateTab({ notes: e.target.value })}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          <div className={styles.rightHeader}>
            <div className={styles.userInfo}>
              <span>{currentUser?.name ?? 'Đang tải...'}</span>
              <User size={14} />
            </div>
            <div className={styles.dateTime}>{currentTime}</div>
          </div>

          <div className={styles.supplierSearchWrapper}>
            <div style={{ flex: 1 }}>
              <SupplierSearchInput
                value={activeTab.supplier}
                onChange={(s) => updateTab({ supplier: s })}
                onDetailClick={handleDetailClick}
              />
            </div>
            <Plus
              size={18}
              className={styles.addSupplierBtn}
              onClick={() => setIsAddSupplierModalOpen(true)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 12px 16px', fontSize: '14px', color: '#333' }}>
            <span style={{ fontWeight: 500 }}>Số nợ cũ</span>
            <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
              {activeTab.supplier ? formatCurrency(activeTab.supplier.debt) : 0}
            </span>
          </div>

          <div className={styles.priceListWrapper}>
            <select
              className={styles.priceListSelect}
              value={activeTab.warehouse}
              onChange={(e) => updateTab({ warehouse: e.target.value })}
            >
              <option value="">Chọn kho</option>
              {stocks.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Mã phiếu</div>
              <input
                type="text"
                className={styles.styledInput}
                placeholder="Mã tự động"
                value={activeTab.code}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>
            <div className={styles.summaryRow} style={{ marginBottom: '12px' }}>
              <div className={styles.summaryLabel}>Loại phiếu</div>
              <select
                className={styles.styledSelect}
                value={activeTab.orderType}
                onChange={(e) => {
                  const newType = e.target.value;
                  if (newType === 'nhap') {
                    updateTab({
                      orderType: newType,
                      items: activeTab.items.map(i => {
                        let q = i.qty;
                        if (i.rawProduct && q < 0 && Math.abs(q) > i.stock) {
                          q = -i.stock;
                        }
                        return { ...i, qty: q, total: q * i.price };
                      })
                    });
                  } else {
                    updateTab({ orderType: newType });
                  }
                }}
              >
                <option value="dat">Phiếu đặt hàng nhập</option>
                <option value="nhap">Phiếu nhập hàng</option>
              </select>
            </div>

            <div className={styles.summaryRow} style={{ marginBottom: '12px' }}>
              <div className={styles.summaryLabel}>Nhân viên giao</div>
              <div style={{ flex: 1, minWidth: 0, marginLeft: 'auto', maxWidth: '60%' }}>
                <EmployeeSearchInput
                  value={activeTab.employee}
                  onChange={(e) => updateTab({ employee: e })}
                />
              </div>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>
                Tổng tiền hàng
              </div>
              <div className={styles.summaryTotalLabel}>{formatCurrency(totalAmount)}</div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Giảm giá</div>
              <input
                type="text"
                className={styles.summaryInput}
                value={formatCurrency(activeTab.discount)}
                onChange={(e) => updateTab({ discount: Number(e.target.value.replace(/\D/g, '')) || 0 })}
              />
            </div>
            <div className={styles.summaryRow} style={{ marginTop: '12px' }}>
              <div className={styles.summaryTotalLabel}>Cần trả NCC</div>
              <div className={styles.summaryTotalValue}>{formatCurrency(finalAmount)}</div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryTotalLabel}>Tiền trả NCC</div>
              <input
                type="text"
                className={styles.summaryInput}
                value={formatCurrency(activeTab.paidAmount)}
                onChange={(e) => updateTab({ paidAmount: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                style={{ fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div className={styles.paymentMethods}>
            <label><input type="radio" name={`payment-${activeTabId}`} defaultChecked /> Tiền mặt</label>
            <label><input type="radio" name={`payment-${activeTabId}`} /> Chuyển khoản</label>
          </div>

          <div className={styles.bottomActions}>
            <button className={styles.btnIn} onClick={() => window.print()}>IN</button>
            <button className={styles.btnThanhToan} onClick={handleComplete}>HOÀN THÀNH</button>
          </div>
        </div>
      </div>

      {/* VÙNG IN HÓA ĐƠN MÔ PHỎNG */}
      <div className={styles.printArea}>
        <div className={styles.printHeader}>
          <div className={styles.printHeaderLeft}>
            <div className={styles.printCompany}>NHÀ PHÂN PHỐI GAS TUẤN ĐẠT</div>
            <div className={styles.printText}>Tổ 16, P.Tân Quang, TP.Tuyên Quang</div>
            <div className={styles.printText}>ĐT: 0987.203.989 | 0866.657.088</div>
          </div>
          <div className={styles.printHeaderRight}>
            <div className={styles.printTitle}>PHIẾU NHẬP HÀNG</div>
            <div className={styles.printText}>Số: {activeTab.code || 'Phiếu 1'}</div>
            <div className={styles.printText}>Ngày: {currentTime}</div>
          </div>
        </div>

        <div className={styles.printCustomerInfo}>
          <div className={styles.printCustomerRow}>
            <strong style={{ width: '120px' }}>Mã NCC:</strong>
            <span style={{ flex: 1 }}>{activeTab.supplier?.code || ''}</span>
            <strong style={{ width: '120px', textAlign: 'center' }}>Tên:</strong>
            <span style={{ flex: 1, fontWeight: 'bold' }}>{activeTab.supplier?.supplierName || 'NCC lẻ'}</span>
            <strong style={{ width: '80px', textAlign: 'right', paddingRight: '10px' }}>Số ĐT:</strong>
            <span style={{ width: '120px' }}>{activeTab.supplier?.phone || ''}</span>
          </div>
          <div className={styles.printCustomerRow}>
            <strong style={{ width: '120px' }}>Địa chỉ:</strong>
            <span style={{ flex: 1 }}>
              {[
                activeTab.supplier?.address,
                wards.find(w => w.wardId === activeTab.supplier?.wardId)?.wardName,
                areas.find(a => a.areaId === wards.find(w => w.wardId === activeTab.supplier?.wardId)?.areaId)?.areaName
              ].filter(Boolean).join(' - ') || '- -'}
            </span>
          </div>
          <div className={styles.printCustomerRow}>
            <strong style={{ width: '120px' }}>Diễn giải:</strong>
            <span style={{ flex: 1 }}>{activeTab.notes}</span>
          </div>
        </div>

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>TT</th>
              <th style={{ width: '100px' }}>Mã hàng</th>
              <th>Tên hàng</th>
              <th style={{ width: '60px' }}>ĐVT</th>
              <th style={{ width: '60px' }}>SL</th>
              <th style={{ width: '120px' }}>Đơn giá</th>
              <th style={{ width: '80px' }}>CK</th>
              <th style={{ width: '120px' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {activeTab.items.map((i, idx) => (
              <tr key={i.id}>
                <td className={styles.center}>{idx + 1}</td>
                <td>{i.code}</td>
                <td>{i.name}</td>
                <td className={styles.center}>{i.unit}</td>
                <td className={styles.center}>{i.qty}</td>
                <td className={styles.right}>{formatCurrency(i.price)}</td>
                <td className={styles.right}>0</td>
                <td className={styles.right}>{formatCurrency(i.total)}</td>
              </tr>
            ))}

          </tbody>
        </table>

        <div className={styles.printTotals}>
          <div className={styles.printTotalsRow}>
            <span>Cộng thành tiền:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span>Giảm trừ:</span>
            <span>{formatCurrency(activeTab.discount)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span>Tổng tiền hóa đơn:</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
          <div className={styles.printTotalsLine}></div>
          <div className={styles.printTotalsRow}>
            <span>Số nợ cũ:</span>
            <span>{formatCurrency(activeTab.supplier?.debt || 0)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span style={{ fontWeight: 'bold' }}>Tiền trả NCC:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(activeTab.paidAmount)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span>Số nợ mới:</span>
            <span>{formatCurrency((activeTab.supplier?.debt || 0) + finalAmount - activeTab.paidAmount)}</span>
          </div>
        </div>

        <div className={styles.printSignatures}>
          <div className={styles.printSigBox}>
            <strong>Người giao hàng</strong>
            <em>(Ký, họ tên)</em>
          </div>
          <div className={styles.printSigBox}>
            <strong>Người nhận hàng</strong>
            <em>(Ký, họ tên)</em>
          </div>
          <div className={styles.printSigBox}>
            <strong>Thủ kho</strong>
            <em>(Ký, họ tên)</em>
          </div>
        </div>
      </div>

      {detailSupplier && (
        <SupplierDetailModal
          supplier={detailSupplier}
          onClose={() => setDetailSupplier(null)}
          onSave={(s) => setDetailSupplier(s)}
          onDelete={() => setDetailSupplier(null)}
        />
      )}
      {isAddSupplierModalOpen && (
        <AddSupplierModal
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSave={() => { setIsAddSupplierModalOpen(false); }}
        />
      )}
    </div>
  );
}

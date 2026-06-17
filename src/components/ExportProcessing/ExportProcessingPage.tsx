'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, X, Plus, User, RotateCw,
  Trash2, MoreVertical, Edit3, Gift
} from 'lucide-react';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import CustomerSearchInput from './CustomerSearchInput';
import { Customer } from '@/services/customerService';
import { createExportOrder, updateExportOrder } from '@/services/exportOrderService';
import styles from './ExportProcessingPage.module.css';

// ─── Types ─────────────────────────────────────────────
type LineItem = {
  id: string | number; code: string; name: string; unit: string;
  qty: number; price: number; total: number; stock: number; rawProduct: Product;
};

import { Employee, getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { getStocks, getPriceBooks, FilterItem } from '@/services/productFilterService';

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
  customer: Customer | null;
  employee: Employee | null;
  paymentMethod: string;
  priceBook: string;
  invoiceId?: string | number;
};

const createEmptyTab = (id: number): TabData => ({
  id,
  label: `Phiếu xuất ${id}`,
  items: [],
  discount: 0,
  paidAmount: 0,
  notes: '',
  code: '',
  orderType: 'dat',
  warehouse: '',
  customer: null,
  employee: null,
  paymentMethod: 'Cashes',
  priceBook: 'chung',
});

import CustomerDetailModal from '@/components/Customer/CustomerDetailModal';
import { Customer as GasCustomer } from '@/services/customerService';
import GasBookDetailModal from '@/components/GasBook/GasBookDetailModal';
import { GasBook } from '@/services/gasBookService';
import PromotionListModal from './PromotionListModal';
import AddCustomerModal from '@/components/Customer/AddCustomerModal';
import AddGasBookModal from '@/components/GasBook/AddGasBookModal';
import EmployeeSearchInput from './EmployeeSearchInput';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';

// ─── Component ─────────────────────────────────────────
export default function ExportProcessingPage() {
  const { showToast } = useToastConfirm();
  const [tabs, setTabs] = useState<TabData[]>([createEmptyTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [warehouses, setWarehouses] = useState<FilterItem[]>([]);
  const [priceBooks, setPriceBooks] = useState<FilterItem[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [detailCustomer, setDetailCustomer] = useState<GasCustomer | null>(null);
  const [detailGasBook, setDetailGasBook] = useState<GasBook | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAddGasBookModalOpen, setIsAddGasBookModalOpen] = useState(false);
  const [showAddCustomerMenu, setShowAddCustomerMenu] = useState(false);

  const handleDetailClick = (c: Customer) => {
    if (c.code.startsWith('SG')) {
      setDetailGasBook({
        id: c.id,
        code: c.code,
        customerName: c.customerName,
        customerGroup: c.customerGroup,
        points: c.points || 0,
        phone: c.phone,
        email: '',
        address: '',
        area: '',
        ward: '',
        notes: '',
        debt: c.debt || 0
      });
    } else {
      setDetailCustomer({
        id: c.id,
        code: c.code,
        customerName: c.customerName,
        customerGroup: c.customerGroup,
        points: c.points || 0,
        phone: c.phone,
        email: '',
        address: '',
        area: '',
        ward: '',
        notes: '',
        debt: c.debt || 0
      });
    }
  };

  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('pendingOrderToProcess');
      if (pendingRaw) {
        const order = JSON.parse(pendingRaw);
        localStorage.removeItem('pendingOrderToProcess');
        setTabs(prev => {
          const t = { ...prev[0] };
          t.invoiceId = order.id;
          t.code = order.code || '';
          t.notes = order.notes || '';
          t.discount = order.discount || 0;
          t.paidAmount = order.paidAmount || 0;

          if (order.stockId) {
            t.warehouse = order.stockId;
          } else if (order.branch) {
            t.warehouse = order.branch;
          }

          if (order.orderType === 'Xuathang' || order.orderType === 'xuat') {
            t.orderType = 'xuat';
          } else if (order.orderType === 'Dathang' || order.orderType === 'dat') {
            t.orderType = 'dat';
          }

          if (order.items) {
            t.items = order.items.map((i: any) => ({ ...i, stock: i.stock || 0, unit: i.unit || 'Cái' }));
            
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
                        if (tab.orderType === 'xuat' && finalQty > 0 && finalQty > newStock) {
                          finalQty = newStock > 0 ? newStock : 0;
                        }
                        
                        return { ...item, qty: finalQty, total: finalQty * item.price, stock: newStock, rawProduct: fullProd };
                      })
                    };
                  }));
                });
            });
          }

          // Set customer safely
          if (order.customerCode && order.customerName) {
            t.customer = {
              id: order.customerId || '', // use actual customerId if available
              code: order.customerCode,
              customerName: order.customerName,
              phone: '',
              customerGroup: '',
              debt: 0,
              email: '', address: '', area: '', ward: '', notes: '', points: 0
            };
            if (order.customerId) {
              if (order.customerCode.startsWith('SG')) {
                import('@/services/gasBookService').then(({ getGasBookById }) => {
                  getGasBookById(order.customerId)
                    .then(fullGB => {
                      setTabs(tabs => tabs.map(tab => tab.id === t.id ? { ...tab, customer: {
                         id: fullGB.id,
                         code: fullGB.code,
                         customerName: fullGB.customerName,
                         phone: fullGB.phone,
                         debt: fullGB.debt,
                         address: fullGB.address,
                         customerGroup: fullGB.customerGroup,
                         ward: fullGB.ward || '',
                         area: '', email: '', notes: '', points: fullGB.points || 0
                      } } : tab));
                    })
                    .catch(console.error);
                });
              } else {
                import('@/services/customerService').then(({ getCustomerById }) => {
                  getCustomerById(order.customerId)
                    .then(fullCus => {
                      setTabs(tabs => tabs.map(tab => tab.id === t.id ? { ...tab, customer: fullCus } : tab));
                    })
                    .catch(console.error);
                });
              }
            }
          }
          if (order.id) {
            t.invoiceId = order.id;
          }
          return [t];
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([getStocks(), getPriceBooks(), getWards(), getAreas()])
      .then(([stocksRes, pricesRes, wRes, aRes]) => {
        setWarehouses(stocksRes);
        setPriceBooks(pricesRes);
        setWards(wRes);
        setAreas(aRes);
        // Auto select first warehouse if not set
        if (stocksRes.length > 0) {
          setTabs(prev => prev.map(t => t.warehouse === '' ? { ...t, warehouse: stocksRes[0].id } : t));
        }
      })
      .catch(console.error);
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
          let newQty = exists.qty + 1;
          if (exists.rawProduct && activeTab.orderType === 'xuat' && newQty > 0 && newQty > exists.stock) {
            newQty = exists.stock > 0 ? exists.stock : 0;
          }
          return activeTab.items.map(i =>
            i.id === product.id ? { ...i, qty: newQty, total: newQty * i.price } : i
          );
        }
        
        let initialQty = 1;
        if (activeTab.orderType === 'xuat' && initialQty > product.stock) {
          initialQty = product.stock > 0 ? product.stock : 0;
        }

        let price: number;
        if (activeTab.priceBook === 'chung') {
          price = product.salePrice;
        } else {
          const tier = product.priceTiers?.find(t => String(t.priceListId) === String(activeTab.priceBook));
          price = tier ? tier.price : 0;
        }
        
        return [...activeTab.items, {
          id: product.id, code: product.code, name: (product as any).displayName || product.name,
          unit: product.unit || 'Cái', qty: initialQty, price: price, total: initialQty * price,
          stock: product.stock, rawProduct: product
        }];
      })()
    });
  };

  const handleQtyChange = (id: string | number, val: string) => {
    let isNegative = val.startsWith('-');
    let numStr = val.replace(/[^0-9]/g, '');
    let num = Number(numStr);
    if (isNegative) num = -num;
    if (val === '-' || val === '') num = 0;

    updateTab({
      items: activeTab.items.map(i => {
        if (i.id === id) {
          let finalQty = num;
          if (i.rawProduct && activeTab.orderType === 'xuat' && finalQty > 0 && finalQty > i.stock) {
            finalQty = i.stock > 0 ? i.stock : 0;
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
  const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
  const totalAmount = activeTab.items.reduce((s, i) => s + i.total, 0);
  const finalAmount = totalAmount - activeTab.discount;

  const currentTime = new Date().toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleCompleteOrder = async () => {
    try {
      if (!activeTab.warehouse) {
        showToast('Vui lòng chọn Kho!', 'error');
        return;
      }
      if (!activeTab.customer) {
        showToast('Vui lòng chọn Khách hàng hoặc Sổ Gas!', 'error');
        return;
      }
      if (activeTab.items.length === 0) {
        showToast('Vui lòng thêm sản phẩm vào phiếu!', 'error');
        return;
      }

      for (const item of activeTab.items) {
        if (item.qty === 0) {
          showToast('Thao tác không thành công', 'error');
          return;
        }
        if (activeTab.orderType === 'xuat' && item.qty > 0 && item.qty > item.stock) {
          showToast('Thao tác không thành công', 'error');
          return;
        }
      }

      const allDetails = activeTab.items.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.price, total: i.total }));

      const isGasBook = activeTab.customer?.code?.startsWith('SG') || false;
      const validId = activeTab.customer?.id && String(activeTab.customer.id).length > 20 ? String(activeTab.customer.id) : undefined;

      const payload = {
        code: activeTab.code,
        createdAt: new Date().toISOString(),
        customerCode: activeTab.customer?.code || '',
        customerName: activeTab.customer?.customerName || '',
        customerId: !isGasBook ? validId : undefined,
        gasBookId: isGasBook ? validId : undefined,
        totalAmount,
        discount: activeTab.discount,
        finalAmount,
        paidAmount: activeTab.paidAmount,
        notes: activeTab.notes,
        branch: '',
        stockId: activeTab.warehouse || undefined,
        creator: '',
        employeeId: activeTab.employee ? String(activeTab.employee.id) : undefined,
        orderType: activeTab.orderType === 'dat' ? 'Dathang' : 'Xuathang',
        paymentMethod: activeTab.paymentMethod,
        details: allDetails
      };

      if (activeTab.invoiceId) {
        await updateExportOrder(activeTab.invoiceId, payload);
        showToast('Thao tác thành công', 'success');
      } else {
        await createExportOrder(payload);
        showToast('Thao tác thành công', 'success');
      }
      setTimeout(() => {
        if (activeTab.orderType === 'dat') {
          window.location.href = '/dat-hang-xuat';
        } else {
          window.location.href = '/phieu-xuat-hang';
        }
      }, 1000);
    } catch (error: any) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  // ─── Render ────────────────────────────────────────
  return (
    <div className={styles.pageWrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ width: '320px', margin: '0 16px' }}>
          <ProductSearchInput placeholder="Tìm hàng xuất" onSelect={handleSelectImportProduct} stockId={activeTab.warehouse} allowZeroStock={true} />
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
          {/* TOP HALF: Xuất hàng */}
          <div className={styles.topHalf}>
            <div className={styles.productList} style={{ marginBottom: '16px' }}>
              {activeTab.items.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                  Chưa có hàng xuất — tìm hàng hóa ở ô tìm kiếm phía trên
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

          <div className={styles.customerSearchWrapper} style={{ position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <CustomerSearchInput
                value={activeTab.customer}
                onChange={(s) => updateTab({ customer: s })}
                onDetailClick={handleDetailClick}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Plus
                size={18}
                className={styles.addCustomerBtn}
                onClick={() => setShowAddCustomerMenu(!showAddCustomerMenu)}
              />
              {showAddCustomerMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  minWidth: '150px'
                }}>
                  <div
                    style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => { setIsAddCustomerModalOpen(true); setShowAddCustomerMenu(false); }}
                  >
                    Thêm khách hàng
                  </div>
                  <div
                    style={{ padding: '8px 16px', cursor: 'pointer' }}
                    onClick={() => { setIsAddGasBookModalOpen(true); setShowAddCustomerMenu(false); }}
                  >
                    Thêm sổ gas
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 8px 16px', fontSize: '14px', color: '#333' }}>
            <span style={{ fontWeight: 500 }}>Số nợ cũ</span>
            <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
              {activeTab.customer ? formatCurrency(activeTab.customer.debt) : 0}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 12px 16px', fontSize: '14px', color: '#333' }}>
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setIsPromotionModalOpen(true)}
              title="Xem danh sách khuyến mại"
            >
              <Gift size={18} color="#e020a5" />
            </div>
            <span style={{ fontWeight: 500 }}>Số điểm</span>
            <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>{activeTab.customer?.points || 0}</span>
          </div>

          <div className={styles.priceListWrapper}>
            <select
              className={styles.priceListSelect}
              value={activeTab.warehouse}
              onChange={(e) => {
                const newWh = e.target.value;
                const newItems = activeTab.items.map(item => {
                  let newStock = 0;
                  if (item.rawProduct.warehouses) {
                    const w = item.rawProduct.warehouses.find(wh => String(wh.stockId) === String(newWh));
                    if (w) newStock = w.quantity;
                  }
                  
                  let finalQty = item.qty;
                  if (activeTab.orderType === 'xuat' && finalQty > 0 && finalQty > newStock) {
                    finalQty = newStock > 0 ? newStock : 0;
                  }
                  
                  return { ...item, stock: newStock, qty: finalQty, total: finalQty * item.price };
                });
                updateTab({ warehouse: newWh, items: newItems });
              }}
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select 
              className={styles.priceListSelect}
              value={activeTab.priceBook}
              onChange={(e) => {
                const newPb = e.target.value;
                const newItems = activeTab.items.map(item => {
                  let price: number;
                  if (newPb === 'chung') {
                    price = item.rawProduct.salePrice;
                  } else {
                    const tier = item.rawProduct.priceTiers?.find(t => String(t.priceListId) === String(newPb));
                    price = tier ? tier.price : 0;
                  }
                  return { ...item, price, total: item.qty * price };
                });
                updateTab({ priceBook: newPb, items: newItems });
              }}
            >
              <option value="chung">Bảng giá chung</option>
              {priceBooks.filter(p => p.name !== 'Bảng giá chung').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
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
                style={{ backgroundColor: '#f5f5f5', color: '#888' }}
                onChange={(e) => updateTab({ code: e.target.value })}
              />
            </div>
            <div className={styles.summaryRow} style={{ marginBottom: '12px' }}>
              <div className={styles.summaryLabel}>Loại phiếu</div>
              <select
                className={styles.styledSelect}
                value={activeTab.orderType}
                onChange={(e) => {
                  const newType = e.target.value;
                  let newItems = activeTab.items;
                  if (newType === 'xuat') {
                    newItems = activeTab.items.map(i => {
                      let finalQty = i.qty;
                      if (i.rawProduct && finalQty > 0 && finalQty > i.stock) {
                        finalQty = i.stock > 0 ? i.stock : 0;
                      }
                      return { ...i, qty: finalQty, total: finalQty * i.price };
                    });
                    updateTab({ orderType: newType, items: newItems });
                  } else {
                    updateTab({ orderType: newType, items: newItems, paidAmount: 0 });
                  }
                }}
              >
                <option value="dat">Phiếu đặt hàng xuất</option>
                <option value="xuat">Phiếu xuất hàng</option>
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
                {/* <span className={styles.summaryLabelBadge}>{activeTab.items.length}</span> */}
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
              <div className={styles.summaryTotalLabel}>Khách cần trả</div>
              <div className={styles.summaryTotalValue}>{formatCurrency(finalAmount)}</div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryTotalLabel}>Khách thanh toán</div>
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
            <label>
              <input 
                type="radio" 
                name={`payment-${activeTabId}`} 
                checked={activeTab.paymentMethod === 'Cashes'}
                onChange={() => updateTab({ paymentMethod: 'Cashes' })}
              /> Tiền mặt
            </label>
            <label>
              <input 
                type="radio" 
                name={`payment-${activeTabId}`} 
                checked={activeTab.paymentMethod === 'QR_Code'}
                onChange={() => updateTab({ paymentMethod: 'QR_Code' })}
              /> Chuyển khoản
            </label>
          </div>

          <div className={styles.bottomActions}>
            <button className={styles.btnIn} onClick={() => window.print()}>IN</button>
            <button className={styles.btnThanhToan} onClick={handleCompleteOrder}>HOÀN THÀNH</button>
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
            <div className={styles.printTitle}>PHIẾU XUẤT HÀNG</div>
            <div className={styles.printText}>Số: {activeTab.code || 'Hóa đơn 1'}</div>
            <div className={styles.printText}>Ngày: {currentTime}</div>
          </div>
        </div>

        <div className={styles.printCustomerInfo}>
          <div className={styles.printCustomerRow}>
            <strong style={{ width: '120px' }}>Mã KH:</strong>
            <span style={{ flex: 1 }}>{activeTab.customer?.code || ''}</span>
            <strong style={{ width: '120px', textAlign: 'center' }}>Tên:</strong>
            <span style={{ flex: 1, fontWeight: 'bold' }}>{activeTab.customer?.customerName || 'Khách lẻ'}</span>
            <strong style={{ width: '80px', textAlign: 'right', paddingRight: '10px' }}>Số ĐT:</strong>
            <span style={{ width: '120px' }}>{activeTab.customer?.phone || ''}</span>
          </div>
          <div className={styles.printCustomerRow}>
            <strong style={{ width: '120px' }}>Địa chỉ:</strong>
            <span style={{ flex: 1 }}>
              {[
                activeTab.customer?.address,
                wards.find(w => w.wardId === activeTab.customer?.ward)?.wardName,
                areas.find(a => a.areaId === wards.find(w => w.wardId === activeTab.customer?.ward)?.areaId)?.areaName
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
            <span>{formatCurrency(activeTab.customer?.debt || 0)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span style={{ fontWeight: 'bold' }}>Khách thanh toán:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(activeTab.paidAmount)}</span>
          </div>
          <div className={styles.printTotalsRow}>
            <span>Số nợ mới:</span>
            <span>{formatCurrency((activeTab.customer?.debt || 0) + finalAmount - activeTab.paidAmount)}</span>
          </div>
        </div>

        <div className={styles.printSignatures}>
          <div className={styles.printSigBox}>
            <strong>Khách hàng</strong>
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

      {detailCustomer && (
        <CustomerDetailModal
          customer={detailCustomer}
          onClose={() => setDetailCustomer(null)}
          onSave={() => setDetailCustomer(null)}
          onDelete={() => setDetailCustomer(null)}
        />
      )}

      {detailGasBook && (
        <GasBookDetailModal
          gasBook={detailGasBook}
          onClose={() => setDetailGasBook(null)}
          onSave={() => setDetailGasBook(null)}
          onDelete={() => setDetailGasBook(null)}
        />
      )}
      {isPromotionModalOpen && (
        <PromotionListModal onClose={() => setIsPromotionModalOpen(false)} />
      )}
      {isAddCustomerModalOpen && (
        <AddCustomerModal
          onClose={() => setIsAddCustomerModalOpen(false)}
          onSave={() => { setIsAddCustomerModalOpen(false); }}
        />
      )}
      {isAddGasBookModalOpen && (
        <AddGasBookModal
          onClose={() => setIsAddGasBookModalOpen(false)}
          onSave={() => { setIsAddGasBookModalOpen(false); }}
        />
      )}
    </div>
  );
}

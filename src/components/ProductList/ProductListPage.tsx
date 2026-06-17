'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Loader2, Package, AlertCircle, ChevronLeft, ChevronDown, GripVertical, Pencil } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import ProductDetailModal from './ProductDetailModal';
import AddProductModal from './AddProductModal';
import FilterItemModal, { FilterItemType, FilterItemMode } from './FilterItemModal';
import styles from './ProductListPage.module.css';
import { getProducts, Product, ProductFilterParams, createProduct, updateProduct, deleteProduct } from '@/services/productService';
import {
  FilterItem,
  createAttribute,
  createPriceBook,
  createProductCategory,
  createStock,
  deleteAttribute,
  deletePriceBook,
  deleteProductCategory,
  deleteStock,
  getAttributes,
  getPriceBooks,
  getProductCategories,
  getStocks,
  updateAttribute,
  updatePriceBook,
  updateProductCategory,
  updateStock,
} from '@/services/productFilterService';

const formatCurrency = (num: number) =>
  num === 0 ? '0' : new Intl.NumberFormat('vi-VN').format(num);

const PAGE_SIZE = 15;

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<FilterItem[]>([]);
  const [priceBooks, setPriceBooks] = useState<FilterItem[]>([]);
  const [attributes, setAttributes] = useState<FilterItem[]>([]);
  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedPriceBook, setSelectedPriceBook] = useState('all');
  const [selectedAttributeGroup, setSelectedAttributeGroup] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filterModalConfig, setFilterModalConfig] = useState<{
    isOpen: boolean;
    type: FilterItemType;
    mode: FilterItemMode;
    initialData?: { id?: string; code: string; name: string; wardId?: string } | null;
  }>({
    isOpen: false,
    type: 'category',
    mode: 'create',
    initialData: null,
  });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadFilterData = useCallback(async () => {
    const [categoryResult, priceBookResult, attributeResult, stockResult] = await Promise.allSettled([
      getProductCategories(),
      getPriceBooks(),
      getAttributes(),
      getStocks(),
    ]);

    if (categoryResult.status === 'fulfilled') {
      setCategories(categoryResult.value);
    } else {
      console.error(categoryResult.reason);
    }

    if (priceBookResult.status === 'fulfilled') {
      setPriceBooks(priceBookResult.value);
    } else {
      console.error(priceBookResult.reason);
    }

    if (attributeResult.status === 'fulfilled') {
      setAttributes(attributeResult.value);
    } else {
      console.error(attributeResult.reason);
    }

    if (stockResult.status === 'fulfilled') {
      setStocks(stockResult.value);
    } else {
      console.error(stockResult.reason);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadFilterData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadFilterData]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: ProductFilterParams = {
        keyword,
        productCategory: selectedCategory,
        stock: selectedBranch,
        priceList: selectedPriceBook,
        productAttribute: selectedAttributeGroup,
        page,
        pageSize: PAGE_SIZE,
      };
      const res = await getProducts(params);
      setProducts(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedCategory, selectedBranch, selectedPriceBook, selectedAttributeGroup, page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setKeyword(e.target.value);
    }, 400);
  };

  const handleCategoryChange = (cat: string) => { setSelectedCategory(cat); setPage(1); };
  const handleBranchChange = (branch: string) => { setSelectedBranch(branch); setPage(1); };
  const handlePriceBookChange = (pb: string) => { setSelectedPriceBook(pb); setPage(1); };
  const handleAttributeGroupChange = (ag: string) => { setSelectedAttributeGroup(ag); setPage(1); };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      if (updatedProduct.productId) {
        const saved = await updateProduct(updatedProduct.productId, updatedProduct);
        setProducts((prev) =>
          prev.map((p) => (p.productId === updatedProduct.productId ? saved : p))
        );
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
      }
      setSelectedProduct(null);
      void fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    try {
      if (typeof productId === 'string') {
        await deleteProduct(productId);
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId && p.productId !== productId));
      setTotal((t) => t - 1);
      setSelectedProduct(null);
      void fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProduct = async (newProduct: Product) => {
    try {
      const created = await createProduct(newProduct);
      setProducts((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setIsAddModalOpen(false);
      void fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const openFilterModal = (type: FilterItemType, mode: FilterItemMode, initialData: { id?: string; code: string; name: string; wardId?: string } | null = null) => {
    setFilterModalConfig({ isOpen: true, type, mode, initialData });
  };

  const closeFilterModal = () => {
    setFilterModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveFilterItem = async (data: { code: string; name: string; wardId?: string }) => {
    const currentId = filterModalConfig.initialData?.id || filterModalConfig.initialData?.code || '';

    if (filterModalConfig.type === 'category') {
      if (filterModalConfig.mode === 'edit' && currentId) {
        await updateProductCategory(currentId, data.name);
      } else {
        await createProductCategory(data.name);
      }
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'priceBook') {
      if (filterModalConfig.mode === 'edit' && currentId) {
        await updatePriceBook(currentId, data.name);
      } else {
        await createPriceBook(data.name);
      }
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'attribute') {
      if (filterModalConfig.mode === 'edit' && currentId) {
        await updateAttribute(currentId, data.name);
      } else {
        await createAttribute(data.name);
      }
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'branch') {
      if (filterModalConfig.mode === 'edit' && currentId) {
        await updateStock(currentId, data.name, data.wardId);
      } else {
        await createStock(data.name, data.wardId);
      }
      await loadFilterData();
      void fetchProducts();
      return;
    }

    console.log('Saved filter item:', filterModalConfig.type, filterModalConfig.mode, data);
  };

  const handleDeleteFilterItem = async () => {
    const currentId = filterModalConfig.initialData?.id || filterModalConfig.initialData?.code || '';

    if (filterModalConfig.type === 'category' && currentId) {
      await deleteProductCategory(currentId);
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'priceBook' && currentId) {
      await deletePriceBook(currentId);
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'attribute' && currentId) {
      await deleteAttribute(currentId);
      await loadFilterData();
      void fetchProducts();
      return;
    }

    if (filterModalConfig.type === 'branch' && currentId) {
      await deleteStock(currentId);
      await loadFilterData();
      void fetchProducts();
      return;
    }

    console.log('Deleted filter item:', filterModalConfig.type, filterModalConfig.initialData?.code);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />

      <div className={styles.body}>
        {/* ===== SIDEBAR ===== */}
        <aside className={styles.sidebar}>
          {/* 1. Nhóm hàng hóa */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Nhóm hàng hóa</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('category', 'create')}>Tạo mới</button>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="Tất cả">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ul className={styles.sideList}>
              {categories.map((item) => (
                <li key={item.id} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{item.name}</span>
                  <Pencil
                    size={14}
                    className={styles.editIcon}
                    onClick={() => openFilterModal('category', 'edit', { id: item.id, code: item.id, name: item.name })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sideDivider} />

          {/* 2. Kho */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Kho</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('branch', 'create')}>Tạo mới</button>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {stocks.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <ul className={styles.sideList}>
              {stocks.map((item) => (
                <li key={item.id} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{item.name}</span>
                  <Pencil
                    size={14}
                    className={styles.editIcon}
                    onClick={() => openFilterModal('branch', 'edit', { id: item.id, code: item.id, name: item.name, wardId: item.wardId })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sideDivider} />

          {/* 3. Bảng giá */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Bảng giá</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('priceBook', 'create')}>Tạo mới</button>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedPriceBook}
              onChange={(e) => handlePriceBookChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {priceBooks.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <ul className={styles.sideList}>
              {priceBooks.map((item) => (
                <li key={item.id} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{item.name}</span>
                  <Pencil
                    size={14}
                    className={styles.editIcon}
                    onClick={() => openFilterModal('priceBook', 'edit', { id: item.id, code: item.id, name: item.name })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sideDivider} />

          {/* 4. Thuộc tính */}
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Thuộc tính</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('attribute', 'create')}>Tạo mới</button>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedAttributeGroup}
              onChange={(e) => handleAttributeGroupChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {attributes.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>

            <ul className={styles.sideList}>
              {attributes.map((item) => (
                <li key={item.id} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{item.name}</span>
                  <Pencil
                    size={14}
                    className={styles.editIcon}
                    onClick={() => openFilterModal('attribute', 'edit', { id: item.id, code: item.id, name: item.name })}
                  />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Theo mã, tên hàng"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => setIsAddModalOpen(true)}>
                <Plus size={15} />
                Tạo mới
              </button>
            </div>
          </div>

          <div className={styles.tableCard}>
            {isLoading ? (
              <div className={styles.stateBox}>
                <Loader2 size={28} className={styles.spinner} />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className={styles.stateBox}>
                <AlertCircle size={28} className={styles.errorIcon} />
                <span>{error}</span>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.thead}>
                      <th className={styles.thCode}>Mã hàng hóa</th>
                      <th className={styles.thName}>Tên hàng hóa</th>
                      <th className={styles.thUnit}>Đơn vị</th>
                      <th className={styles.thNum}>Giá bán</th>
                      <th className={styles.thNum}>Giá vốn</th>
                      <th className={styles.thNum}>Tồn kho</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có hàng hóa nào</span>
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => {
                        let displayStock = product.stock;
                        if (selectedBranch && selectedBranch !== 'all' && product.warehouses) {
                          const w = product.warehouses.find((wh) => wh.name === selectedBranch);
                          displayStock = w ? w.quantity : 0;
                        }

                        let displaySalePrice = product.salePrice;
                        if (selectedPriceBook && selectedPriceBook !== 'all' && product.priceTiers) {
                          const pb = product.priceTiers.find((pt) => pt.priceListName === selectedPriceBook);
                          displaySalePrice = pb ? pb.price : product.salePrice;
                        }

                        return (
                          <tr
                            key={`${product.id}-${product.code}-${index}`}
                            className={styles.tr}
                            onClick={() => setSelectedProduct(product)}
                          >
                            <td className={styles.tdCode}>{product.code}</td>
                            <td className={styles.tdName}>
                              {(product as any).displayName || product.name}
                            </td>
                            <td className={styles.tdUnit}>{product.unit || '—'}</td>
                            <td className={styles.tdNum}>{formatCurrency(displaySalePrice)}</td>
                            <td className={styles.tdNum}>{formatCurrency(product.costPrice)}</td>
                            <td className={`${styles.tdNum} ${displayStock < 0 ? styles.negative : ''}`}>
                              {formatCurrency(displayStock)}
                            </td>
                            <td className={styles.tdNotes}>{product.notes || '—'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft size={15} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className={styles.pageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <ChevronDown size={15} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                    </div>
                  )}
                  <div className={styles.footerInfo}>
                    Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} / {total} hàng hóa
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      {/* <FloatingButtons /> */}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
          categories={categories}
          stocks={stocks}
          priceBooks={priceBooks}
          attributes={attributes}
        />
      )}

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateProduct}
          existingProducts={products}
          categories={categories}
          stocks={stocks}
          priceBooks={priceBooks}
          attributes={attributes}
        />
      )}

      <FilterItemModal
        isOpen={filterModalConfig.isOpen}
        onClose={closeFilterModal}
        onSave={handleSaveFilterItem}
        onDelete={handleDeleteFilterItem}
        type={filterModalConfig.type}
        mode={filterModalConfig.mode}
        initialData={filterModalConfig.initialData}
      />
    </div>
  );
}

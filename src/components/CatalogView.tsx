import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Store,
  Truck,
  Verified,
  Star,
  ShoppingBag,
  MessageCircle,
  Lock,
  Plus,
  Minus,
  Trash2,
  Ruler,
  Tag,
  ArrowRight,
  Zap,
  X,
} from 'lucide-react';
import {
  CartItem,
  CategoryId,
  FulfillmentMode,
  Product,
} from '../types/store';
import { FALLBACK_IMAGE, WHATSAPP_NUMBER, formatARS } from '../data/products';

interface CatalogViewProps {
  products: Product[];
  cart: CartItem[];
  fulfillment: FulfillmentMode;
  setFulfillment: (f: FulfillmentMode) => void;
  onAddToCart: (product: Product, size: string, colorName: string, colorHex: string) => void;
  onUpdateQty: (productId: string, size: string, color: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onClearCart: () => void;
  onOpenProductDetail: (product: Product) => void;
  onProceedToTerminal: () => void;
  searchQuery: string;
  mobileCartOpen: boolean;
  setMobileCartOpen: (open: boolean) => void;
}

const CATEGORIES: { id: CategoryId; label: string; isSpecial?: boolean }[] = [
  { id: 'all', label: 'Novedades & Todo' },
  { id: 'femenino', label: 'Femenino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'especiales', label: 'Talles Grandes / Especiales', isSpecial: true },
  { id: 'bebe', label: 'Bebé & Niños' },
  { id: 'calzado', label: 'Calzado' },
  { id: 'accesorios', label: 'Accesorios' },
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'plus-first';

const FREE_SHIPPING_THRESHOLD = 85000;

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  cart,
  fulfillment,
  setFulfillment,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenProductDetail,
  onProceedToTerminal,
  searchQuery,
  mobileCartOpen,
  setMobileCartOpen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const filterSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = filterSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFilterSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-110px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Track selected color & size per product card
  const [cardSelections, setCardSelections] = useState<
    Record<string, { colorIdx: number; size: string }>
  >({});

  const getSelection = (product: Product) => {
    const existing = cardSelections[product.id];
    const firstAvailableSize =
      product.sizes.find((s) => s.salon + s.deposito > 0)?.size || product.sizes[0]?.size || 'Único';
    return {
      colorIdx: existing?.colorIdx ?? 0,
      size: existing?.size ?? firstAvailableSize,
    };
  };

  const setCardColor = (productId: string, colorIdx: number, fallbackSize: string) => {
    setCardSelections((prev) => ({
      ...prev,
      [productId]: { colorIdx, size: prev[productId]?.size ?? fallbackSize },
    }));
  };

  const setCardSize = (productId: string, size: string) => {
    setCardSelections((prev) => ({
      ...prev,
      [productId]: { colorIdx: prev[productId]?.colorIdx ?? 0, size },
    }));
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'especiales'
          ? p.isPlusSize
          : p.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.sizes.some((s) => s.size.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'plus-first')
      list = [...list].sort((a, b) => Number(b.isPlusSize) - Number(a.isPlusSize));

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shippingCost =
    fulfillment === 'pickup' || subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 4500;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === 'VANGUARDIA10' || code === 'VIP10' || code === 'DEMO') {
      setCouponApplied(true);
    }
  };

  const buildWhatsAppLink = () => {
    if (cart.length === 0) {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        'Hola Vanguardia! Estoy viendo el catálogo digital y tengo una consulta sobre talles.'
      )}`;
    }
    const lines = cart.map(
      (item) => `• ${item.qty}x ${item.name} (${item.color} / Talle ${item.size}) - ${formatARS(item.price * item.qty)}`
    );
    const deliveryText =
      fulfillment === 'pickup'
        ? 'Retiro en Local Palermo (Pick-up 15 min)'
        : 'Envío Express a Domicilio';
    const msg = `Hola Vanguardia! Quiero confirmar mi pedido:\n\n${lines.join('\n')}\n\nModalidad: ${deliveryText}\nTotal estimado: ${formatARS(total)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const CartPanelContent = (
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <h2 className="font-editorial text-xl text-primary">Bolsa de Pedidos</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {fulfillment === 'pickup'
              ? 'Modalidad: Retiro en Local Palermo (Listo en 15m)'
              : 'Modalidad: Envío Express 2h CABA'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              title="Vaciar bolsa"
              className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileCartOpen(false)}
            className="xl:hidden p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Free Shipping Progress */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1.5">
          <span className="flex items-center gap-1.5 text-secondary">
            <Truck className="w-3.5 h-3.5" />
            {missingForFreeShipping === 0 && subtotal > 0
              ? '¡Envío Gratis Bonificado!'
              : `¡Faltan ${formatARS(missingForFreeShipping)} para Envío Gratis!`}
          </span>
          <span className="tabular-nums text-outline">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
        <p className="text-[11px] text-on-surface-variant mt-1.5 tabular-nums">
          Llevás acumulado {formatARS(subtotal)} en artículos seleccionados.
        </p>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-outline-variant rounded-xl bg-surface/50">
          <ShoppingBag className="w-8 h-8 text-outline mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-on-surface">Tu bolsa está vacía</p>
          <p className="text-xs text-on-surface-variant mt-1 px-4">
            Elegí tu talle en cualquier prenda, calzado o accesorio para armar tu pedido.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/40"
            >
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-12 h-14 object-cover rounded-lg shrink-0 bg-surface-container"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-primary truncate">{item.name}</div>
                <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-outline-variant shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="truncate">
                    {item.color} • Talle <strong>{item.size}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-secondary font-medium mt-0.5">
                  Stock salón verificado ({item.maxStock} un.)
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-sm font-bold text-primary tabular-nums">
                  {formatARS(item.price * item.qty)}
                </span>
                <div className="inline-flex items-center rounded-full bg-surface-container-lowest border border-outline-variant/60 h-7 px-1">
                  <button
                    type="button"
                    onClick={() =>
                      item.qty <= 1
                        ? onRemoveItem(item.productId, item.size, item.color)
                        : onUpdateQty(item.productId, item.size, item.color, -1)
                    }
                    className="w-6 h-6 flex items-center justify-center text-on-surface hover:text-error"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold tabular-nums">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.productId, item.size, item.color, 1)}
                    className="w-6 h-6 flex items-center justify-center text-on-surface hover:text-secondary"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-surface-container-low border border-outline-variant/50 rounded-full px-3 h-9">
          <Tag className="w-3.5 h-3.5 text-outline shrink-0" />
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Cupón: VANGUARDIA10"
            className="w-full bg-transparent text-xs outline-none text-on-surface placeholder:text-outline"
          />
        </div>
        <button
          type="button"
          onClick={handleApplyCoupon}
          className="px-4 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary transition-colors"
        >
          {couponApplied ? 'Aplicado' : 'Aplicar'}
        </button>
      </div>

      {/* Totals */}
      <div className="border-t border-outline-variant/50 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal ({totalItems} {totalItems === 1 ? 'prenda' : 'prendas'}):</span>
          <span className="font-semibold text-on-surface tabular-nums">{formatARS(subtotal)}</span>
        </div>
        {couponApplied && discount > 0 && (
          <div className="flex justify-between text-secondary font-semibold">
            <span>Cupón VANGUARDIA10 (10%):</span>
            <span className="tabular-nums">-{formatARS(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-on-surface-variant">
          <span>Despacho / Retiro:</span>
          <span className="font-bold text-secondary text-xs uppercase tracking-wider">
            {shippingCost === 0 ? 'Gratis' : formatARS(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/40">
          <span className="font-bold text-primary text-base">Total a Cobrar:</span>
          <span className="text-2xl font-bold text-primary tabular-nums">{formatARS(total)}</span>
        </div>
        <p className="text-[11px] text-outline">
          Incluye IVA y reserva física prioritaria por 24 hs.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            setMobileCartOpen(false);
            onProceedToTerminal();
          }}
          className="w-full h-12 rounded-full bg-primary hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none text-on-primary font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Iniciar Pago Seguro / Terminal
        </button>
        <a
          href={buildWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-11 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Confirmar Pedido por WhatsApp
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-24 xl:pb-12">
      {/* Operational Status Bar & Logistics Dispatcher */}
      <section className="w-full bg-surface-container-low border-b border-outline-variant/40 px-3 sm:px-6 lg:px-10 py-2.5">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
            <span className="font-bold uppercase tracking-wider text-secondary text-[11px]">
              Stock Central en Vivo
            </span>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <span className="text-on-surface-variant flex items-center gap-1 text-xs">
              <Zap className="w-3.5 h-3.5 text-secondary shrink-0" />
              Pick-up disponible en <strong className="text-primary">15 min</strong> en Sucursal Palermo Soho
            </span>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-full">
            <button
              type="button"
              onClick={() => setFulfillment('pickup')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                fulfillment === 'pickup'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Retiro en Local</span>
            </button>
            <button
              type="button"
              onClick={() => setFulfillment('express')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                fulfillment === 'express'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Envío Express 2h</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Catalog Canvas */}
          <div className="xl:col-span-8 flex flex-col gap-5 min-w-0">
            {/* Editorial Lead */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary">
                    Vanguardia Moda &amp; Tienda
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                    Campaña 2025
                  </span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight leading-tight">
                  Warm Urban &amp; Lifestyle
                </h1>
                <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mt-1">
                  Indumentaria femenina, masculina, bebé, calzado y accesorios con curva real de{' '}
                  <strong className="text-secondary">Talles Especiales (hasta 5XL / 56)</strong> y disponibilidad inmediata.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-end bg-surface-container px-3.5 py-2 rounded-full shrink-0">
                <Verified className="w-4 h-4 text-secondary" />
                <span className="text-xs font-semibold text-primary">Curaduría Certificada</span>
              </div>
            </div>

            {/* Sentinel para detectar estado sticky de los filtros */}
            <div ref={filterSentinelRef} className="h-px w-full -mb-4 pointer-events-none" aria-hidden="true" />

            {/* Category Horizontal Pill Scroller + Sort (Sticky con animación suave) */}
            <div
              style={{ top: 'var(--header-height, 108px)' }}
              className={`sticky z-30 transition-all duration-300 ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isFilterSticky
                  ? 'bg-surface/95 backdrop-blur-xl py-2.5 px-3 -mx-3 sm:px-4 sm:-mx-4 rounded-b-2xl border-b border-outline-variant/50 shadow-[0_10px_28px_-8px_rgba(18,20,23,0.12)]'
                  : 'py-1 bg-transparent border-b border-transparent'
              }`}
            >
              <nav
                aria-label="Filtro de categorías"
                className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
              >
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-4 h-[38px] rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ease-out active:scale-95 flex items-center gap-1.5 shrink-0 ${
                        active
                          ? cat.isSpecial
                            ? 'bg-secondary text-on-secondary shadow-sm scale-[1.02]'
                            : 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                          : cat.isSpecial
                          ? 'bg-secondary-container/70 text-on-secondary-container border border-secondary/30 hover:bg-secondary-container'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {cat.isSpecial && <Star className="w-3.5 h-3.5" />}
                      {cat.label}
                    </button>
                  );
                })}
              </nav>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Ordenar catálogo"
                className="h-[38px] px-3 rounded-full bg-surface-container-lowest border border-outline-variant/60 text-xs font-semibold text-on-surface outline-none focus:border-primary self-start sm:self-auto transition-colors"
              >
                <option value="featured">Ordenar: Destacados</option>
                <option value="plus-first">Priorizar Talles Especiales</option>
                <option value="price-asc">Menor Precio</option>
                <option value="price-desc">Mayor Precio</option>
              </select>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>
                Mostrando <strong className="text-primary">{filteredProducts.length}</strong> artículos
                {selectedCategory !== 'all' ? ` en ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}` : ''}
                {searchQuery ? ` para "${searchQuery}"` : ''}
              </span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-secondary font-semibold hover:underline"
                >
                  Ver todas las categorías
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-10 text-center">
                <p className="font-editorial text-2xl text-primary mb-2">
                  No encontramos coincidencias
                </p>
                <p className="text-sm text-on-surface-variant mb-4">
                  Probá con otro término o limpiá los filtros activos.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="px-5 h-10 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider"
                >
                  Restablecer Catálogo
                </button>
              </div>
            ) : (
              <div
                key={`${selectedCategory}-${sortBy}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-slide"
              >
                {filteredProducts.map((product) => {
                  const sel = getSelection(product);
                  const activeColor = product.colors[sel.colorIdx] || product.colors[0];
                  const activeSizeObj =
                    product.sizes.find((s) => s.size === sel.size) || product.sizes[0];
                  const stockInStore = (activeSizeObj?.salon ?? 0) + (activeSizeObj?.deposito ?? 0);

                  return (
                    <article
                      key={product.id}
                      className="bg-surface-container-lowest border border-paper rounded-2xl overflow-hidden flex flex-col justify-between hover:border-outline-variant transition-all group"
                    >
                      <div>
                        {/* 4:5 Editorial Image */}
                        <div
                          onClick={() => onOpenProductDetail(product)}
                          className="relative aspect-[4/5] bg-surface-container overflow-hidden cursor-pointer"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />

                          {/* Top Badge */}
                          {product.badge && (
                            <span
                              className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                product.badgeVariant === 'alert'
                                  ? 'bg-error text-on-error'
                                  : product.badgeVariant === 'emerald'
                                  ? 'bg-secondary text-on-secondary'
                                  : product.badgeVariant === 'neutral'
                                  ? 'bg-surface-container-lowest/95 text-primary'
                                  : 'bg-primary text-on-primary'
                              }`}
                            >
                              {product.badge}
                            </span>
                          )}

                          {/* Category Tag */}
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-primary">
                            {product.categoryLabel}
                          </span>

                          {/* Color Swatches Pill */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm shadow-sm"
                          >
                            {product.colors.map((col, idx) => (
                              <button
                                key={col.name}
                                type="button"
                                title={col.name}
                                onClick={() => setCardColor(product.id, idx, sel.size)}
                                className={`w-4 h-4 rounded-full border transition-transform ${
                                  sel.colorIdx === idx
                                    ? 'border-primary scale-110 ring-1 ring-primary ring-offset-1'
                                    : 'border-outline-variant/80 hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                                {product.subtitle}
                              </span>
                              <h3
                                onClick={() => onOpenProductDetail(product)}
                                className="text-base font-bold text-primary leading-snug mt-0.5 cursor-pointer hover:text-secondary transition-colors"
                              >
                                {product.name}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-bold text-primary tabular-nums block">
                                {formatARS(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[11px] text-outline line-through tabular-nums">
                                  {formatARS(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Size Selector Chips */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                              <span>Talles ({activeColor.name}):</span>
                              {product.isPlusSize && (
                                <span className="text-secondary">Curva Especial</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {product.sizes.map((s) => {
                                const totalS = s.salon + s.deposito;
                                const isSelected = sel.size === s.size;
                                const lowStock = totalS > 0 && totalS <= 4;
                                return (
                                  <button
                                    key={s.size}
                                    type="button"
                                    disabled={totalS === 0}
                                    onClick={() => setCardSize(product.id, s.size)}
                                    className={`relative min-w-[36px] h-8 px-2.5 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                      totalS === 0
                                        ? 'border border-dashed border-outline-variant text-outline line-through opacity-50'
                                        : isSelected
                                        ? 'bg-primary text-on-primary scale-105'
                                        : s.isPlus
                                        ? 'bg-secondary-container/70 text-on-secondary-container hover:bg-secondary-container'
                                        : 'bg-paper text-primary hover:bg-surface-container-high'
                                    }`}
                                  >
                                    {s.size}
                                    {lowStock && !isSelected && (
                                      <span
                                        title="Últimas unidades"
                                        className="w-1.5 h-1.5 rounded-full bg-secondary"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={stockInStore === 0}
                          onClick={() =>
                            onAddToCart(product, sel.size, activeColor.name, activeColor.hex)
                          }
                          className="flex-1 h-10 rounded-full bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-on-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Añadir al Pedido
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenProductDetail(product)}
                          title="Ver Ficha Técnica y Probador Biométrico"
                          className="h-10 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Ruler className="w-3.5 h-3.5 text-secondary" />
                          <span className="hidden sm:inline">Ficha</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Persistent Tactile Drawer (Desktop) */}
          <aside className="hidden xl:block xl:col-span-4 sticky top-[116px]">
            {CartPanelContent}
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Docked Action Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-lg border-t border-outline-variant/60 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => setMobileCartOpen(true)}
          className="flex items-center gap-3 text-left"
        >
          <div className="relative w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              {totalItems}
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Mi Bolsa ({totalItems})
            </div>
            <div className="text-base font-bold text-primary tabular-nums leading-tight">
              {formatARS(total)}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="h-10 px-4 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Ver Bolsa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Cart Drawer */}
      {mobileCartOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-fade-slide">
            {CartPanelContent}
          </div>
        </div>
      )}
    </div>
  );
};

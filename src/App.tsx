import React, { useEffect, useState } from 'react';
import { INITIAL_PRODUCTS } from './data/products';
import { AppViewMode, CartItem, FulfillmentMode, Product } from './types/store';
import { usePWA } from './hooks/usePWA';
import { DemoBar } from './components/DemoBar';
import { CatalogView } from './components/CatalogView';
import { ProductDetailView } from './components/ProductDetailView';
import { TerminalView } from './components/TerminalView';
import { InventoryView } from './components/InventoryView';
import {
  BarcodeScannerModal,
  InstallPWAModal,
  MobileQRModal,
} from './components/PWAModals';

const CART_STORAGE_KEY = 'vanguardia_app_dress_cart_v1';

export function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [viewMode, setViewMode] = useState<AppViewMode>('catalogo');
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRODUCTS[0].id);
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>('pickup');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { canNativeInstall, isInstalled, isOnline, triggerInstall } = usePWA();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return [
      {
        productId: INITIAL_PRODUCTS[0].id,
        sku: INITIAL_PRODUCTS[0].sku,
        name: INITIAL_PRODUCTS[0].name,
        price: INITIAL_PRODUCTS[0].price,
        image: INITIAL_PRODUCTS[0].image,
        color: INITIAL_PRODUCTS[0].colors[0].name,
        colorHex: INITIAL_PRODUCTS[0].colors[0].hex,
        size: '48',
        qty: 1,
        maxStock: 10,
      },
      {
        productId: INITIAL_PRODUCTS[1].id,
        sku: INITIAL_PRODUCTS[1].sku,
        name: INITIAL_PRODUCTS[1].name,
        price: INITIAL_PRODUCTS[1].price,
        image: INITIAL_PRODUCTS[1].image,
        color: INITIAL_PRODUCTS[1].colors[0].name,
        colorHex: INITIAL_PRODUCTS[1].colors[0].hex,
        size: '3XL',
        qty: 1,
        maxStock: 8,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const handleAddToCart = (
    product: Product,
    size: string,
    colorName: string,
    colorHex: string,
    hemmingRequested = false
  ) => {
    const sizeObj = product.sizes.find((s) => s.size === size);
    const maxStock = (sizeObj?.salon ?? 1) + (sizeObj?.deposito ?? 4);

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id && item.size === size && item.color === colorName
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qty: Math.min(updated[idx].maxStock, updated[idx].qty + 1),
          hemmingRequested: hemmingRequested || updated[idx].hemmingRequested,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          image: product.image,
          color: colorName,
          colorHex,
          size,
          qty: 1,
          maxStock,
          hemmingRequested,
        },
      ];
    });
    showToast(`Agregado: ${product.name} (Talle ${size})`);
  };

  const handleUpdateQty = (productId: string, size: string, color: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return {
            ...item,
            qty: Math.max(1, Math.min(item.maxStock, item.qty + delta)),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const handleClearCart = () => setCart([]);

  const handleCompleteSale = () => {
    // Deduct sold units from live product inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const soldForProd = cart.filter((c) => c.productId === prod.id);
        if (soldForProd.length === 0) return prod;
        return {
          ...prod,
          sizes: prod.sizes.map((s) => {
            const qtySold = soldForProd
              .filter((c) => c.size === s.size)
              .reduce((a, b) => a + b.qty, 0);
            if (qtySold === 0) return s;
            return { ...s, salon: Math.max(0, s.salon - qtySold) };
          }),
        };
      })
    );
    setCart([]);
  };

  const handleReplenishSize = (productId: string, size: string, deltaSalon: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          sizes: p.sizes.map((s) =>
            s.size === size
              ? {
                  ...s,
                  salon: s.salon + deltaSalon,
                  deposito: Math.max(0, s.deposito - deltaSalon),
                }
              : s
          ),
        };
      })
    );
    showToast(`+${deltaSalon} unidades repuestas a Salón (Talle ${size})`);
  };

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <DemoBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        cartCount={cartCount}
        onOpenMobileCart={() => {
          if (viewMode !== 'catalogo') {
            setViewMode('catalogo');
          }
          setMobileCartOpen(true);
        }}
        onOpenInstall={() => setInstallModalOpen(true)}
        onOpenQR={() => setQrModalOpen(true)}
        onOpenScanner={() => setScannerModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOnline={isOnline}
        isInstalled={isInstalled}
      />

      <main className="flex-1">
        {viewMode === 'catalogo' && (
          <CatalogView
            products={products}
            cart={cart}
            fulfillment={fulfillment}
            setFulfillment={setFulfillment}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenProductDetail={(p) => {
              setSelectedProductId(p.id);
              setViewMode('ficha');
            }}
            onProceedToTerminal={() => setViewMode('terminal')}
            searchQuery={searchQuery}
            mobileCartOpen={mobileCartOpen}
            setMobileCartOpen={setMobileCartOpen}
          />
        )}

        {viewMode === 'ficha' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            allProducts={products}
            onSelectProduct={(p) => setSelectedProductId(p.id)}
            onBackToCatalog={() => setViewMode('catalogo')}
            onAddToCart={handleAddToCart}
          />
        )}

        {viewMode === 'terminal' && (
          <TerminalView
            cart={cart}
            fulfillment={fulfillment}
            setFulfillment={setFulfillment}
            onBackToCatalog={() => setViewMode('catalogo')}
            onCompleteSale={handleCompleteSale}
          />
        )}

        {viewMode === 'inventario' && (
          <InventoryView
            products={products}
            onReplenishSize={handleReplenishSize}
            onBackToCatalog={() => setViewMode('catalogo')}
          />
        )}
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant/40 px-4 sm:px-8 py-6 text-xs text-on-surface-variant mb-14 xl:mb-0">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-editorial text-base text-primary uppercase">
              Vanguardia Moda &amp; Tienda
            </span>
            <span className="mx-2 text-outline-variant">•</span>
            <span>PWA Demo Omnicanal — Indumentaria, Calzado, Bebé, Accesorios &amp; Talles Especiales</span>
          </div>
          <div className="text-[11px] text-outline">
            Desarrollado para despliegue en GitHub &amp; Vercel • Grupo Infinity
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 xl:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-xl animate-fade-slide">
          {toastMsg}
        </div>
      )}

      {/* Modals */}
      <InstallPWAModal
        open={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        canNativeInstall={canNativeInstall}
        onNativeInstall={async () => {
          await triggerInstall();
          setInstallModalOpen(false);
        }}
      />

      <MobileQRModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />

      <BarcodeScannerModal
        open={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setSelectedProductId(p.id);
          setViewMode('ficha');
        }}
      />
    </div>
  );
}

export default App;

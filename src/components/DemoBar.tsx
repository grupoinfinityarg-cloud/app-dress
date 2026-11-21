import React from 'react';
import {
  Download,
  QrCode,
  MessageCircle,
  ShoppingBag,
  ScanBarcode,
  Search,
  Sparkles,
  Ruler,
  TabletSmartphone,
  Boxes,
  Wifi,
  WifiOff,
  Store,
} from 'lucide-react';
import { AppViewMode } from '../types/store';

interface DemoBarProps {
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  cartCount: number;
  onOpenMobileCart: () => void;
  onOpenInstall: () => void;
  onOpenQR: () => void;
  onOpenScanner: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isOnline: boolean;
  isInstalled: boolean;
}

const VIEW_TABS: { id: AppViewMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    id: 'catalogo',
    label: '1. Catálogo Omnicanal',
    shortLabel: 'Catálogo',
    icon: <Store className="w-3.5 h-3.5" />,
  },
  {
    id: 'ficha',
    label: '2. Probador & Ficha',
    shortLabel: 'Probador',
    icon: <Ruler className="w-3.5 h-3.5" />,
  },
  {
    id: 'terminal',
    label: '3. Terminal POS',
    shortLabel: 'Terminal',
    icon: <TabletSmartphone className="w-3.5 h-3.5" />,
  },
  {
    id: 'inventario',
    label: '4. Stock & Curvas',
    shortLabel: 'Stock',
    icon: <Boxes className="w-3.5 h-3.5" />,
  },
];

export const DemoBar: React.FC<DemoBarProps> = ({
  viewMode,
  setViewMode,
  cartCount,
  onOpenMobileCart,
  onOpenInstall,
  onOpenQR,
  onOpenScanner,
  searchQuery,
  setSearchQuery,
  isOnline,
  isInstalled,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/40">
      {/* Top Demo & PWA Status Strip */}
      <div className="bg-primary text-on-primary px-3 sm:px-6 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-semibold uppercase tracking-wider shrink-0">
            <Sparkles className="w-3 h-3" />
            Modo Demo
          </span>
          <span className="hidden md:inline text-outline-variant">•</span>
          <div className="flex items-center gap-1">
            {VIEW_TABS.map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-inverse-on-surface/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className={`hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              isOnline ? 'bg-white/10 text-secondary-fixed' : 'bg-error text-on-error'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'PWA En Línea' : 'Modo Offline'}
          </span>

          <button
            type="button"
            onClick={onOpenQR}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            title="Probar en Celular"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Probar en Celular</span>
          </button>

          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/90 text-white font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          <a
            href="https://wa.me/5492236779934?text=Hola!%20Vi%20la%20demo%20de%20Vanguardia%20App%20Dress%20y%20quiero%20implementarla%20en%20mi%20tienda."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container hover:brightness-95 font-bold transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Implementar</span>
          </a>
        </div>
      </div>

      {/* Main Brand & Search Bar */}
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => setViewMode('catalogo')}
          className="flex flex-col text-left shrink-0 group"
        >
          <span className="font-editorial text-xl sm:text-2xl tracking-tight text-primary uppercase leading-none group-hover:text-secondary transition-colors">
            Vanguardia
          </span>
          <span className="text-[10px] font-bold tracking-[0.16em] text-secondary uppercase mt-0.5">
            Moda &amp; Tienda • PWA
          </span>
        </button>

        {/* Search + Barcode */}
        <div className="flex-1 max-w-xl">
          <div className="w-full flex items-center bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary rounded-full px-3 sm:px-4 h-10 sm:h-11 transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <Search className="w-4 h-4 text-outline shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (viewMode !== 'catalogo') setViewMode('catalogo');
              }}
              placeholder="Buscar prenda, calzado, talle especial o SKU..."
              className="w-full bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-outline"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-outline hover:text-primary px-2"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={onOpenScanner}
              title="Simular Escáner de Código de Barras"
              className="p-1.5 rounded-full hover:bg-surface-container text-secondary transition-colors shrink-0"
            >
              <ScanBarcode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="relative flex items-center gap-2 px-3 sm:px-4 h-10 sm:h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Mi Bolsa</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-secondary text-on-secondary text-[11px] font-bold tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

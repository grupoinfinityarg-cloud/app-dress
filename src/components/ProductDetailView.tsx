import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Ruler,
  Store,
  Warehouse,
  Scissors,
  ShoppingBag,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types/store';
import { FALLBACK_IMAGE, WHATSAPP_NUMBER, formatARS } from '../data/products';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onBackToCatalog: () => void;
  onAddToCart: (
    product: Product,
    size: string,
    colorName: string,
    colorHex: string,
    hemmingRequested?: boolean
  ) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onBackToCatalog,
  onAddToCart,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find((s) => s.isPlus && s.salon + s.deposito > 0)?.size ||
      product.sizes[0]?.size ||
      'Único'
  );
  const [waistCm, setWaistCm] = useState(94);
  const [hipCm, setHipCm] = useState(116);
  const [hemmingRequested, setHemmingRequested] = useState(false);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const activeSizeObj = product.sizes.find((s) => s.size === selectedSize) || product.sizes[0];
  const totalAvailable = product.sizes.reduce((a, s) => a + s.salon + s.deposito + s.taller, 0);

  // Biometric size recommendation
  const recommendedSize = useMemo(() => {
    const sizes = product.sizes.map((s) => s.size);
    if (sizes.includes('48') || sizes.includes('52')) {
      if (hipCm <= 98 && sizes.includes('38')) return '38';
      if (hipCm <= 104 && sizes.includes('40')) return '40';
      if (hipCm <= 112 && sizes.includes('44')) return '44';
      if (hipCm <= 120 && sizes.includes('48')) return '48';
      if (hipCm <= 128 && sizes.includes('52')) return '52';
      if (hipCm <= 134 && sizes.includes('54')) return '54';
      if (sizes.includes('56')) return '56';
    }
    if (sizes.includes('3XL') || sizes.includes('4XL')) {
      if (waistCm <= 78 && sizes.includes('S')) return 'S';
      if (waistCm <= 86 && sizes.includes('M')) return 'M';
      if (waistCm <= 94 && sizes.includes('L')) return 'L';
      if (waistCm <= 102 && sizes.includes('XL')) return 'XL';
      if (waistCm <= 112 && sizes.includes('3XL')) return '3XL';
      if (waistCm <= 122 && sizes.includes('4XL')) return '4XL';
      if (sizes.includes('5XL')) return '5XL';
    }
    return selectedSize;
  }, [hipCm, waistCm, product.sizes, selectedSize]);

  const defaultMeasurements = product.measurements || [
    { segment: 'Contorno Principal', rest: 'Acorde a curva', expanded: '+4 cm elasticidad', tolerance: 'Calce confortable' },
    { segment: 'Largo Total', rest: 'Estándar atelier', expanded: '—', tolerance: 'Ajustable en 20 min' },
  ];

  const shareWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola Vanguardia! Quiero consultar por:\n• ${product.name} (SKU: ${product.sku})\n• Color: ${activeColor.name}\n• Talle elegido: ${selectedSize}\n• Medidas referencia: Cintura ${waistCm}cm / Cadera ${hipCm}cm`
  )}`;

  return (
    <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Catálogo
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-xs font-semibold text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            PALERMO SOHO • PROBADOR &amp; FICHA TÉCNICA
          </span>
        </div>

        {/* Quick Switch Product */}
        <select
          value={product.id}
          onChange={(e) => {
            const found = allProducts.find((p) => p.id === e.target.value);
            if (found) onSelectProduct(found);
          }}
          aria-label="Cambiar artículo en ficha técnica"
          className="h-10 px-4 rounded-full bg-surface-container-lowest border border-outline-variant/60 text-xs font-semibold text-primary outline-none focus:border-primary max-w-xs"
        >
          {allProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.categoryLabel}: {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Showcase */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
              {product.subtitle}
            </span>
            <span className="text-[11px] font-semibold text-outline">{product.categoryLabel}</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl text-primary leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline justify-between mt-2 mb-4">
            <span className="text-xs text-outline font-semibold tabular-nums">
              SKU: {product.sku} • EAN: {product.barcode}
            </span>
            <span className="text-2xl font-bold text-primary tabular-nums">
              {formatARS(product.price)}
            </span>
          </div>

          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-container mb-4">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            {product.isPlusSize && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-white text-[11px] font-semibold">
                Moldería Curva Real
              </span>
            )}
          </div>

          {/* Color Variants */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-outline">Variante Textil</span>
              <span className="font-semibold text-primary">{activeColor.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedColorIdx === idx
                      ? 'border-primary bg-surface-container-low text-primary'
                      : 'border-outline-variant/60 bg-white text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-outline-variant"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant space-y-1.5">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              {product.fabricNote}
            </div>
            <p>{product.description}</p>
          </div>
        </div>

        {/* Center Column: Biometric Fitting Calculator & Measurements */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-primary">
                    Calculador Biométrico de Probador
                  </h2>
                  <p className="text-[11px] text-on-surface-variant">
                    Ingresá tus medidas para sugerir el talle exacto
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                Calce Óptimo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Cintura Natural (cm)
                </span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    min={55}
                    max={150}
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value) || 80)}
                    className="w-20 bg-white border border-outline-variant rounded-lg px-2.5 py-1 text-xl font-bold text-primary tabular-nums outline-none focus:border-primary"
                  />
                  <span className="text-xs text-on-surface-variant">cm</span>
                </div>
              </label>

              <label className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Cadera Mayor (cm)
                </span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    min={75}
                    max={165}
                    value={hipCm}
                    onChange={(e) => setHipCm(Number(e.target.value) || 100)}
                    className="w-20 bg-white border border-outline-variant rounded-lg px-2.5 py-1 text-xl font-bold text-primary tabular-nums outline-none focus:border-primary"
                  />
                  <span className="text-xs text-on-surface-variant">cm</span>
                </div>
              </label>
            </div>

            {/* Suggested Size Banner */}
            <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[8px] uppercase tracking-wider opacity-80">Talle</span>
                  <span className="text-sm font-bold leading-none">{recommendedSize}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary flex items-center gap-1">
                    Recomendación Sugerida
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Calce confortable con tolerancia adaptativa (+4 cm disponibles).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSize(recommendedSize)}
                className="px-3 py-1.5 rounded-full bg-secondary text-white text-[11px] font-bold shrink-0 hover:bg-secondary/90"
              >
                Aplicar T.{recommendedSize}
              </button>
            </div>

            {/* Full Size Curve */}
            <div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-2">
                <span>Curva Completa Disponible</span>
                <span>Tocar para seleccionar</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const avail = s.salon + s.deposito;
                  const active = selectedSize === s.size;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={avail === 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[46px] h-10 px-3 rounded-full text-xs font-bold transition-all ${
                        avail === 0
                          ? 'border border-dashed border-outline-variant text-outline line-through opacity-50'
                          : active
                          ? 'bg-primary text-on-primary scale-105 shadow-sm'
                          : s.isPlus
                          ? 'bg-secondary-container text-on-secondary-container hover:brightness-95'
                          : 'bg-paper text-primary hover:bg-surface-container-high'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-primary">Medidas de Confección en Mesa</h3>
              <span className="text-xs font-bold text-secondary">Talle Activo: {selectedSize}</span>
            </div>
            <div className="divide-y divide-outline-variant/40 text-xs">
              {defaultMeasurements.map((m) => (
                <div key={m.segment} className="py-2.5 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 font-semibold text-primary">{m.segment}</div>
                  <div className="col-span-2 font-bold tabular-nums text-on-surface">{m.rest}</div>
                  <div className="col-span-2 tabular-nums text-on-surface-variant">{m.expanded}</div>
                  <div className="col-span-3 text-right text-secondary font-medium">
                    {m.tolerance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Omnichannel Inventory & Counter Actions */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-primary">Inventario Omnicanal</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold tabular-nums">
                {totalAvailable} Disp. Total
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-secondary shrink-0" />
                  <div>
                    <div className="font-bold text-primary">Perchero Salón Palermo</div>
                    <div className="text-[11px] text-outline">Talle {selectedSize} inmediato</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white font-bold text-primary tabular-nums">
                  {activeSizeObj?.salon ?? 0} un.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Warehouse className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="font-bold text-primary">Depósito Central (PB)</div>
                    <div className="text-[11px] text-outline">Despacho en 2 hs</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white font-bold text-primary tabular-nums">
                  {activeSizeObj?.deposito ?? 0} un.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Scissors className="w-4 h-4 text-secondary shrink-0" />
                  <div>
                    <div className="font-bold text-primary">Atelier Confección</div>
                    <div className="text-[11px] text-outline">Reposición 24 hs</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white font-bold text-primary tabular-nums">
                  {activeSizeObj?.taller ?? 0} un.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-primary">Acciones de Mostrador</h3>

            <label className="p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hemmingRequested}
                onChange={(e) => setHemmingRequested(e.target.checked)}
                className="mt-0.5 accent-secondary w-4 h-4"
              />
              <div className="text-xs">
                <div className="font-bold text-primary">Servicio Ruedo / Ajuste Express</div>
                <div className="text-[11px] text-on-surface-variant">
                  Cortesía sin cargo en 20 min en taller del local.
                </div>
              </div>
            </label>

            <button
              type="button"
              onClick={() =>
                onAddToCart(
                  product,
                  selectedSize,
                  activeColor.name,
                  activeColor.hex,
                  hemmingRequested
                )
              }
              className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Agregar T.{selectedSize} a la Bolsa
            </button>

            <a
              href={shareWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-secondary" />
              Enviar Ficha &amp; Medidas por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

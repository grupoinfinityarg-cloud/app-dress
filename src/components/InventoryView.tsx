import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  PackagePlus,
  Scissors,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../types/store';
import { FALLBACK_IMAGE, formatARS } from '../data/products';

interface InventoryViewProps {
  products: Product[];
  onReplenishSize: (productId: string, size: string, deltaSalon: number) => void;
  onBackToCatalog: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onReplenishSize,
  onBackToCatalog,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [batchChecked, setBatchChecked] = useState<Record<string, boolean>>({
    lote1: true,
    lote2: true,
    lote3: false,
  });

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const totalUnitsAll = products.reduce(
    (acc, p) => acc + p.sizes.reduce((sAcc, s) => sAcc + s.salon + s.deposito + s.taller, 0),
    0
  );

  const criticalSizesCount = products.reduce(
    (acc, p) => acc + p.sizes.filter((s) => s.salon <= 1).length,
    0
  );

  return (
    <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-6 pb-16 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Catálogo
          </button>
          <span className="text-xs font-semibold text-on-surface-variant hidden sm:inline">
            Lotes de Confección &amp; Taller Textil Activo: Atelier Palermo / Corte Central
          </span>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
          Stock Sincronizado en Vivo PWA
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
            Unidades Activas en Red
          </div>
          <div className="text-3xl font-bold text-primary tabular-nums mt-1">
            {totalUnitsAll} <span className="text-sm font-normal text-outline">unid.</span>
          </div>
          <div className="text-xs text-secondary font-semibold mt-1">
            • {products.length} modelos en catálogo
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
            Curvas Inclusivas (T44-T56 / 3XL-5XL)
          </div>
          <div className="text-3xl font-bold text-secondary tabular-nums mt-1">88%</div>
          <div className="text-xs text-on-surface-variant mt-1">
            Cobertura en Percheros Palermo Soho
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-error flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Quiebres / Bajo Stock Salón
          </div>
          <div className="text-3xl font-bold text-error tabular-nums mt-1">
            {criticalSizesCount} <span className="text-sm font-normal">talles</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Reponer desde Depósito o Taller
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
            Ruedos &amp; Ajustes Express
          </div>
          <div className="text-3xl font-bold text-primary tabular-nums mt-1">98.4%</div>
          <div className="text-xs text-on-surface-variant mt-1">
            Tiempo promedio boutique: 15 min
          </div>
        </div>
      </div>

      {/* Product Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {products.map((p) => {
          const active = p.id === activeProduct?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProductId(p.id)}
              className={`whitespace-nowrap px-4 h-9 rounded-full text-xs font-bold transition-all shrink-0 ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {p.sku} • {p.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Size Curve Matrix */}
        {activeProduct && (
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-3">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="w-14 h-16 object-cover rounded-xl bg-surface-container"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                      {activeProduct.categoryLabel}
                    </span>
                    <span className="text-xs text-outline font-semibold tabular-nums">
                      SKU: {activeProduct.sku}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl text-primary mt-0.5">
                    {activeProduct.name}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-primary tabular-nums">
                  {formatARS(activeProduct.price)}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {activeProduct.sizes.reduce((a, s) => a + s.salon + s.deposito, 0)} unid. activas
                  en tienda
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/50">
                    <th className="py-2.5 pr-3">Talle</th>
                    <th className="py-2.5 px-3">Salón Mostrador</th>
                    <th className="py-2.5 px-3">Depósito Central</th>
                    <th className="py-2.5 px-3">Taller Textil</th>
                    <th className="py-2.5 px-3">Estado Curva</th>
                    <th className="py-2.5 pl-3 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {activeProduct.sizes.map((s) => {
                    const isCritical = s.salon <= 1;
                    const isOptimal = s.salon >= 3;
                    return (
                      <tr
                        key={s.size}
                        className={isCritical ? 'bg-error-container/25' : 'hover:bg-surface-container-low/50'}
                      >
                        <td className="py-3 pr-3 font-bold text-primary">
                          T.{s.size}
                          {s.isPlus && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[9px] uppercase">
                              Esp.
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-3 font-bold tabular-nums ${
                            isCritical ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {s.salon} un. {isCritical && '(BAJO)'}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-on-surface-variant">
                          {s.deposito} un.
                        </td>
                        <td className="py-3 px-3 tabular-nums text-on-surface-variant">
                          {s.taller} un.
                        </td>
                        <td className="py-3 px-3">
                          {isCritical ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-error text-white text-[10px] font-bold uppercase">
                              Crítico Salón
                            </span>
                          ) : isOptimal ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                              Óptimo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => onReplenishSize(activeProduct.id, s.size, 2)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary hover:bg-secondary text-white text-[11px] font-bold transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            +2 a Salón
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right: Batch Reception & Predictive Rebalance */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-xl text-primary">Recepción de Lote</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                Taller Cafferata
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Control de calidad textil &amp; curva de talles ingresantes:
            </p>

            {[
              { id: 'lote1', title: '24x Pantalón Palazzo Visón Arena', sub: 'Curva T46 a T54 verificada' },
              { id: 'lote2', title: '18x Camisa Oxford Relaxed 3XL-5XL', sub: 'Costuras y botones aprobados' },
              { id: 'lote3', title: '12x Remeras Salvia Heavy Cotton', sub: 'Control de planchado pendiente' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={batchChecked[item.id]}
                  onChange={(e) =>
                    setBatchChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))
                  }
                  className="mt-0.5 accent-secondary w-4 h-4"
                />
                <div className="text-xs">
                  <div className="font-bold text-primary">{item.title}</div>
                  <div className="text-[11px] text-on-surface-variant">{item.sub}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="bg-secondary-container/40 border border-secondary/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              Rebalanceo Omnicanal Predictivo
            </div>
            <p className="text-xs text-on-surface">
              <strong>Recomendación:</strong> Asignar inmediatamente 2 unidades de los talles con
              stock crítico directamente a Perchero Palermo Salón.
            </p>
            <button
              type="button"
              onClick={() => {
                if (activeProduct) {
                  activeProduct.sizes.forEach((s) => {
                    if (s.salon <= 1) onReplenishSize(activeProduct.id, s.size, 2);
                  });
                }
              }}
              className="w-full h-10 rounded-full bg-secondary hover:bg-secondary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Reponer Críticos del Modelo
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-secondary" />
                Ruedos &amp; Atelier In-Situ
              </h3>
              <span className="text-[11px] font-bold text-secondary">3 en cola</span>
            </div>
            <div className="text-xs space-y-1.5 text-on-surface-variant">
              <div className="flex justify-between">
                <span>#ORD-9021 • Palazzo Visón Arena</span>
                <span className="font-semibold text-secondary">En aguja (-3cm)</span>
              </div>
              <div className="flex justify-between">
                <span>#ORD-9024 • Chino T54 Negro</span>
                <span>En espera</span>
              </div>
              <div className="flex justify-between">
                <span>#ORD-9027 • Vestido Midi 50</span>
                <span>En espera</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

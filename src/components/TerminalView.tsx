import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  MessageCircle,
  Scissors,
  Sparkles,
  Store,
  Truck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { CartItem, FulfillmentMode } from '../types/store';
import { FALLBACK_IMAGE, WHATSAPP_NUMBER, formatARS } from '../data/products';

interface TerminalViewProps {
  cart: CartItem[];
  fulfillment: FulfillmentMode;
  setFulfillment: (f: FulfillmentMode) => void;
  onBackToCatalog: () => void;
  onCompleteSale: () => void;
}

type PaymentMethod = 'efectivo' | 'mercadopago' | 'tarjeta' | 'transferencia';

export const TerminalView: React.FC<TerminalViewProps> = ({
  cart,
  fulfillment,
  setFulfillment,
  onBackToCatalog,
  onCompleteSale,
}) => {
  const [customerName, setCustomerName] = useState('Mariana Costa');
  const [customerPhone, setCustomerPhone] = useState('+54 9 11 5829-4412');
  const [clubGoldDiscount, setClubGoldDiscount] = useState(true);
  const [expressHemming, setExpressHemming] = useState(true);
  const [fragranceService, setFragranceService] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [cashPaid, setCashPaid] = useState<string>('');
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [ticketId] = useState(() => `VNG-${Math.floor(1000 + Math.random() * 9000)}`);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = clubGoldDiscount ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal - discount);
  const installment = Math.round(total / 3);
  const cashNumeric = Number(cashPaid) || 0;
  const cashChange = Math.max(0, cashNumeric - total);

  const handleConfirm = () => {
    setSaleCompleted(true);
    onCompleteSale();
  };

  const whatsappTicketLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Comprobante Digital ${ticketId} - Vanguardia Moda & Tienda\nCliente: ${customerName}\nTotal abonado: ${formatARS(
      total
    )}\nModalidad: ${fulfillment === 'pickup' ? 'Retiro en Bolsa de Lienzo' : 'Envío Express'}\n¡Gracias por tu compra!`
  )}`;

  if (saleCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fade-slide">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">
            Ticket #{ticketId} Emitido
          </span>
          <h2 className="font-editorial text-3xl text-primary mt-3">¡Operación Confirmada!</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            La venta por <strong className="text-primary tabular-nums">{formatARS(total)}</strong> se
            registró correctamente y el stock omnicanal fue actualizado en tiempo real.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappTicketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-full bg-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/90"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar Ticket por WhatsApp
            </a>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="flex-1 h-12 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/90"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-6 pb-16">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
              Terminal Asistida • Palermo Soho
            </span>
            <span className="text-xs text-outline">Ticket #{ticketId}</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-primary">
            ¡Hola, {customerName.split(' ')[0]}! Revisá tu selección y confirmá tu compra.
          </h1>
        </div>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir Agregando Prendas
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-10 text-center">
          <p className="font-editorial text-2xl text-primary mb-2">
            No hay prendas en la orden activa
          </p>
          <p className="text-sm text-on-surface-variant mb-4">
            Agregá productos desde el Catálogo Omnicanal para simular el cobro en Terminal POS.
          </p>
          <button
            type="button"
            onClick={onBackToCatalog}
            className="px-6 h-11 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider"
          >
            Ir al Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Selected Items & Atelier Services */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-editorial text-xl text-primary">
                  Prendas Seleccionadas ({cart.reduce((a, b) => a + b.qty, 0)})
                </h2>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clubGoldDiscount}
                    onChange={(e) => setClubGoldDiscount(e.target.checked)}
                    className="accent-secondary w-4 h-4"
                  />
                  Aplicar Beneficio Club 10% OFF
                </label>
              </div>

              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/40"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-16 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-secondary">
                        SKU: {item.sku}
                      </div>
                      <h3 className="font-bold text-primary text-sm sm:text-base truncate">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-on-surface-variant">
                        <span className="px-2 py-0.5 rounded-full bg-white border border-outline-variant/50 font-semibold text-primary">
                          Talle {item.size}
                        </span>
                        <span>Color: {item.color}</span>
                        <span>• Cant: {item.qty}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {formatARS(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atelier Services */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-xl text-primary">
                  Servicios de Confección &amp; Salón
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                  Cortesía VIP
                </span>
              </div>

              <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-surface-container-low cursor-pointer">
                <div className="flex items-start gap-3">
                  <Scissors className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-primary">
                      Ajuste de Botamanga / Ruedo Express en 20 min
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Ruedo sastrero en atelier propio sin cargo adicional.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={expressHemming}
                  onChange={(e) => setExpressHemming(e.target.checked)}
                  className="accent-secondary w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-surface-container-low cursor-pointer">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-primary">
                      Aromatizar con Fragancia Firma Vanguardia &amp; Bolsa de Lienzo
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Notas de Higo Silvestre, Cedro y Té Verde sobre papel tisú.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={fragranceService}
                  onChange={(e) => setFragranceService(e.target.checked)}
                  className="accent-secondary w-5 h-5"
                />
              </label>
            </div>
          </div>

          {/* Right: Fulfillment, Payment & Checkout */}
          <div className="lg:col-span-5 space-y-5">
            {/* Delivery Choice */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-3">
              <h2 className="font-editorial text-xl text-primary">¿Cómo recibís tu compra hoy?</h2>

              <button
                type="button"
                onClick={() => setFulfillment('pickup')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  fulfillment === 'pickup'
                    ? 'bg-secondary-container/40 border-secondary'
                    : 'bg-surface-container-low border-transparent hover:border-outline-variant'
                }`}
              >
                <Store className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-primary">
                    Me lo llevo en Bolsa de Lienzo (Inmediato)
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Empaque boutique listo para retirar en mostrador Palermo Soho.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillment('express')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  fulfillment === 'express'
                    ? 'bg-secondary-container/40 border-secondary'
                    : 'bg-surface-container-low border-transparent hover:border-outline-variant'
                }`}
              >
                <Truck className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-primary">
                    Envío Express a Domicilio (Hoy 18 a 21 hs)
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Mensajería prioritaria con seguimiento en tiempo real.
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs font-semibold text-primary outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="WhatsApp para ticket"
                  className="h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs font-semibold text-primary outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-primary tabular-nums">
                    {formatARS(subtotal)}
                  </span>
                </div>
                {clubGoldDiscount && (
                  <div className="flex justify-between text-secondary font-semibold">
                    <span>Beneficio Club Gold (10%):</span>
                    <span className="tabular-nums">-{formatARS(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/40">
                  <span className="font-bold text-primary text-base">Total a Abonar</span>
                  <span className="text-3xl font-bold text-primary tabular-nums">
                    {formatARS(total)}
                  </span>
                </div>
                <div className="text-right text-xs font-semibold text-secondary">
                  3 cuotas sin interés de {formatARS(installment)}
                </div>
              </div>

              {/* Payment Method Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    { id: 'mercadopago', label: 'QR / MP', icon: QrCode },
                    { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                    { id: 'transferencia', label: 'Transf.', icon: Landmark },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-primary border-outline-variant/40 hover:border-primary/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'efectivo' && (
                <div className="p-3 rounded-xl bg-surface-container-low space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">Abona con ($):</span>
                    <input
                      type="number"
                      value={cashPaid}
                      onChange={(e) => setCashPaid(e.target.value)}
                      placeholder={String(total)}
                      className="w-32 h-9 px-3 rounded-lg bg-white border border-outline-variant text-right font-bold tabular-nums outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-secondary">
                    <span>Vuelto a entregar:</span>
                    <span className="tabular-nums">{formatARS(cashChange)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'transferencia' && (
                <div className="p-3 rounded-xl bg-surface-container-low text-xs space-y-1">
                  <div className="font-bold text-primary">Alias: VANGUARDIA.MODA.POS</div>
                  <div className="text-on-surface-variant tabular-nums">
                    CVU: 0000003100045678912345
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirmar Pedido y Pagar ({formatARS(total)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  X,
  Download,
  Smartphone,
  Share,
  MoreVertical,
  Monitor,
  ScanBarcode,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types/store';

interface InstallModalProps {
  open: boolean;
  onClose: () => void;
  canNativeInstall: boolean;
  onNativeInstall: () => void;
}

export const InstallPWAModal: React.FC<InstallModalProps> = ({
  open,
  onClose,
  canNativeInstall,
  onNativeInstall,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-slide max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Progressive Web App
            </span>
            <h3 className="font-editorial text-2xl text-primary mt-2">
              Instalar Vanguardia App
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Acceso directo en pantalla de inicio, experiencia pantalla completa y catálogo disponible incluso sin conexión.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {canNativeInstall && (
          <button
            type="button"
            onClick={onNativeInstall}
            className="w-full mb-5 h-12 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Instalar Ahora en Este Dispositivo
          </button>
        )}

        <div className="space-y-3 text-sm">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="font-bold text-primary flex items-center gap-2 mb-1.5">
              <Smartphone className="w-4 h-4 text-secondary" />
              iPhone / iPad (Safari)
            </div>
            <ol className="list-decimal list-inside space-y-1 text-on-surface-variant text-xs">
              <li>
                Tocá el botón <strong className="text-on-surface">Compartir</strong>{' '}
                <Share className="w-3 h-3 inline" /> en la barra inferior de Safari.
              </li>
              <li>Seleccioná <strong>"Agregar a pantalla de inicio"</strong>.</li>
              <li>Confirmá tocando <strong>"Agregar"</strong> arriba a la derecha.</li>
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="font-bold text-primary flex items-center gap-2 mb-1.5">
              <MoreVertical className="w-4 h-4 text-secondary" />
              Android (Chrome)
            </div>
            <ol className="list-decimal list-inside space-y-1 text-on-surface-variant text-xs">
              <li>Tocá el menú de tres puntos <strong>(⋮)</strong> arriba a la derecha.</li>
              <li>Seleccioná <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
            <div className="font-bold text-primary flex items-center gap-2 mb-1.5">
              <Monitor className="w-4 h-4 text-secondary" />
              PC / Notebook (Chrome o Edge)
            </div>
            <p className="text-on-surface-variant text-xs">
              Hacé clic en el ícono de instalar en la barra de direcciones (arriba a la derecha) para abrir Vanguardia en ventana independiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QRModalProps {
  open: boolean;
  onClose: () => void;
}

export const MobileQRModal: React.FC<QRModalProps> = ({ open, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  if (!open) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://app-dress.vercel.app';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-fade-slide">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Probar en Celular
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-editorial text-2xl text-primary mb-1">Escaneá el Catálogo</h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Apuntá la cámara de tu teléfono para abrir e instalar la PWA en tu móvil.
        </p>
        <div className="inline-block p-3 bg-white rounded-2xl border border-outline-variant/50 mb-4">
          <img src={qrSrc} alt="Código QR para abrir en celular" className="w-44 h-44 mx-auto" />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Enlace Copiado' : 'Copiar Enlace Directo'}
        </button>
      </div>
    </div>
  );
};

interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<ScannerModalProps> = ({
  open,
  onClose,
  products,
  onSelectProduct,
}) => {
  if (!open) return null;

  const quickSamples = products.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-primary rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-slide">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-secondary" />
            <h3 className="font-editorial text-xl text-primary">Escáner Óptico PWA</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative h-36 rounded-xl bg-primary text-white flex flex-col items-center justify-center mb-4 overflow-hidden">
          <div className="w-4/5 h-0.5 bg-secondary-fixed animate-pulse shadow-[0_0_12px_#baeed9]" />
          <p className="text-xs text-inverse-on-surface/80 mt-4">
            Visor de cámara listo • Simular lectura EAN-13
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Simular escaneo rápido de etiqueta:
        </p>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {quickSamples.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelectProduct(p);
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-secondary-container/40 border border-outline-variant/40 text-left transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-primary">{p.name}</div>
                <div className="text-[11px] text-outline tabular-nums">
                  EAN: {p.barcode} • SKU: {p.sku}
                </div>
              </div>
              <span className="text-xs font-bold text-secondary">Abrir</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

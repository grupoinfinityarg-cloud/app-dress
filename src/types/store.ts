export type CategoryId =
  | 'all'
  | 'femenino'
  | 'masculino'
  | 'calzado'
  | 'accesorios'
  | 'bebe'
  | 'especiales';

export type AppViewMode = 'catalogo' | 'ficha' | 'terminal' | 'inventario';

export type FulfillmentMode = 'pickup' | 'express';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSizeStock {
  size: string;
  salon: number;
  deposito: number;
  taller: number;
  isPlus?: boolean;
}

export interface ProductMeasurement {
  segment: string;
  rest: string;
  expanded: string;
  tolerance: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  subtitle: string;
  category: Exclude<CategoryId, 'all' | 'especiales'>;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  description: string;
  fabricNote: string;
  image: string;
  badge?: string;
  badgeVariant?: 'dark' | 'emerald' | 'alert' | 'neutral';
  isPlusSize: boolean;
  isNewDrop?: boolean;
  colors: ProductColor[];
  sizes: ProductSizeStock[];
  measurements?: ProductMeasurement[];
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  image: string;
  color: string;
  colorHex: string;
  size: string;
  qty: number;
  maxStock: number;
  hemmingRequested?: boolean;
}

export interface OrderRecord {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  fulfillment: FulfillmentMode;
  paymentMethod: 'efectivo' | 'mercadopago' | 'tarjeta' | 'transferencia';
  total: number;
  itemsCount: number;
}

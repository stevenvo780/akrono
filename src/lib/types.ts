// Tipos del dominio akrono

export type Locale = "es" | "en";

export interface Category {
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
}

export interface Product {
  slug: string;
  name_es: string;
  name_en: string;
  category: string;
  description_es: string;
  description_en: string;
  story_es: string;
  story_en: string;
  price_cop: number;
  price_usd: number;
  stock: number;
  production_time_days: number;
  materials_es: string[];
  materials_en: string[];
  weight_grams: number;
  featured: boolean;
}

export type ProductionStatus = "pendiente" | "en_proceso" | "terminado";

// Estado mutable de un producto en el taller (producción/inventario)
export interface ProductState {
  slug: string;
  stock: number;
  production_status: ProductionStatus;
  in_production: number; // unidades actualmente en producción
  updated_at: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  qty: number;
  price_cop: number;
  price_usd: number;
}

export type OrderStatus =
  | "nuevo"
  | "pagado"
  | "en_produccion"
  | "empacado"
  | "enviado"
  | "entregado"
  | "cancelado";

export type ShipmentScope = "nacional" | "internacional";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  created_at: string;
  status: OrderStatus;
  currency: "COP" | "USD";
  scope: ShipmentScope;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: Customer;
  history: { at: string; status: OrderStatus; note?: string }[];
}

export type ShipmentStatus =
  | "preparando"
  | "en_transito"
  | "en_aduana"
  | "en_reparto"
  | "entregado";

export interface Shipment {
  id: string;
  order_id: string;
  scope: ShipmentScope;
  carrier: string;
  tracking: string;
  status: ShipmentStatus;
  destination: string;
  created_at: string;
  updated_at: string;
}

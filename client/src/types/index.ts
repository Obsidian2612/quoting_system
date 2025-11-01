export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  engine?: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  prices: Price[];
}

export interface Price {
  id: number;
  serviceId: number;
  price: number;
  supplierId: number;
  date: string;
  supplier: Supplier;
}

export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string;
}

export interface QuoteItem {
  serviceId: number;
  price: number;
  service?: Service;
}

export interface Quote {
  id?: number;
  vehicleId: number;
  vehicle?: Vehicle;
  date?: string;
  totalPrice: number;
  items: QuoteItem[];
}
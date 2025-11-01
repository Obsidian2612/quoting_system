import axios from 'axios';
import { Vehicle, Service, Quote, Supplier } from '../types';

const API_URL = 'http://localhost:4000/api';

export const api = {
  // Vehicle endpoints
  getVehicles: async () => {
    const response = await axios.get<Vehicle[]>(`${API_URL}/vehicles`);
    return response.data;
  },

  createVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
    const response = await axios.post<Vehicle>(`${API_URL}/vehicles`, vehicle);
    return response.data;
  },

  // Service endpoints
  getServices: async () => {
    const response = await axios.get<Service[]>(`${API_URL}/services`);
    return response.data;
  },

  createService: async (service: Omit<Service, 'id'>) => {
    const response = await axios.post<Service>(`${API_URL}/services`, service);
    return response.data;
  },

  createServicePrice: async (serviceId: number, price: number, supplierId: number) => {
    const response = await axios.post(`${API_URL}/services/${serviceId}/prices`, {
      price,
      supplierId
    });
    return response.data;
  },

  // Quote endpoints
  createQuote: async (quote: Omit<Quote, 'id' | 'date'>) => {
    const response = await axios.post<Quote>(`${API_URL}/quotes`, quote);
    return response.data;
  },

  getQuotes: async () => {
    const response = await axios.get<Quote[]>(`${API_URL}/quotes`);
    return response.data;
  },

  // Supplier endpoints
  getSuppliers: async () => {
    const response = await axios.get<Supplier[]>(`${API_URL}/suppliers`);
    return response.data;
  },

  createSupplier: async (supplier: Omit<Supplier, 'id'>) => {
    const response = await axios.post<Supplier>(`${API_URL}/suppliers`, supplier);
    return response.data;
  }
};
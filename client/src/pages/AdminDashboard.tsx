import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service, Supplier, Quote } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'services' | 'suppliers' | 'quotes'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState('');
  const [newService, setNewService] = useState({ name: '', category: '', prices: [] });
  const [newSupplier, setNewSupplier] = useState({ name: '', contactInfo: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      const [servicesData, suppliersData, quotesData] = await Promise.all([
        api.getServices(),
        api.getSuppliers(),
        api.getQuotes()
      ]);
      setServices(servicesData);
      setSuppliers(suppliersData);
      setQuotes(quotesData);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createService(newService);
      setNewService({ name: '', category: '', prices: [] });
      fetchData();
    } catch (err) {
      setError('Failed to create service');
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupplier(newSupplier);
      setNewSupplier({ name: '', contactInfo: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create supplier');
    }
  };

  const handlePriceUpdate = async (serviceId: number, price: number, supplierId: number) => {
    try {
      await api.createServicePrice(serviceId, price, supplierId);
      fetchData();
    } catch (err) {
      setError('Failed to update price');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Suppliers
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Quotes History
            </button>
          </nav>
        </div>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Service</h2>
            <form onSubmit={handleServiceSubmit} className="max-w-md space-y-4">
              <div>
                <label className="label" htmlFor="serviceName">
                  Service Name
                </label>
                <input
                  type="text"
                  id="serviceName"
                  className="input"
                  value={newService.name}
                  onChange={e => setNewService({ ...newService, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="serviceCategory">
                  Category
                </label>
                <input
                  type="text"
                  id="serviceCategory"
                  className="input"
                  value={newService.category}
                  onChange={e => setNewService({ ...newService, category: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Service
              </button>
            </form>
          </div>

          <h2 className="text-2xl font-bold mb-4">Services List</h2>
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.category}</p>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Price History</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Supplier</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.prices.map(price => (
                        <tr key={price.id}>
                          <td className="py-1">${price.price.toFixed(2)}</td>
                          <td className="py-1">{price.supplier.name}</td>
                          <td className="py-1">
                            {new Date(price.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {suppliers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Update Price</h4>
                    <div className="flex gap-4">
                      <select
                        className="input"
                        onChange={e => {
                          const price = prompt('Enter new price:');
                          if (price) {
                            handlePriceUpdate(
                              service.id,
                              parseFloat(price),
                              parseInt(e.target.value)
                            );
                          }
                        }}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Supplier</h2>
            <form onSubmit={handleSupplierSubmit} className="max-w-md space-y-4">
              <div>
                <label className="label" htmlFor="supplierName">
                  Supplier Name
                </label>
                <input
                  type="text"
                  id="supplierName"
                  className="input"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="contactInfo">
                  Contact Information
                </label>
                <textarea
                  id="contactInfo"
                  className="input"
                  value={newSupplier.contactInfo}
                  onChange={e => setNewSupplier({ ...newSupplier, contactInfo: e.target.value })}
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Supplier
              </button>
            </form>
          </div>

          <h2 className="text-2xl font-bold mb-4">Suppliers List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                {supplier.contactInfo && (
                  <p className="text-gray-600 mt-2">{supplier.contactInfo}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Quote History</h2>
          <div className="space-y-4">
            {quotes.map(quote => (
              <div key={quote.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Quote #{quote.id}
                    </h3>
                    <p className="text-gray-600">
                      {quote.vehicle &&
                        `${quote.vehicle.year} ${quote.vehicle.make} ${quote.vehicle.model}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      ${quote.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(quote.date || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Services</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2">Service</th>
                        <th className="pb-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map(item => (
                        <tr key={item.serviceId}>
                          <td className="py-1">{item.service?.name}</td>
                          <td className="py-1 text-right">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
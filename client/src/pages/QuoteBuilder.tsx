import React, { useState, useEffect } from 'react';
import { Vehicle, Service, Quote, QuoteItem } from '../types';
import { api } from '../services/api';
import html2pdf from 'html2pdf.js';

const QuoteBuilder: React.FC = () => {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<QuoteItem[]>([]);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});
  const [brandOther, setBrandOther] = useState('');
  const [useOtherBrand, setUseOtherBrand] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, servicesData] = await Promise.all([
          api.getVehicles(),
          api.getServices()
        ]);
        setVehicles(vehiclesData);
        setServices(servicesData);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setStep(2);
  };

  const handleNewVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vehicle = await api.createVehicle(newVehicle as Omit<Vehicle, 'id'>);
      setVehicles([...vehicles, vehicle]);
      setSelectedVehicle(vehicle);
      setStep(2);
    } catch (err) {
      setError('Failed to create vehicle');
    }
  };

  const handleServiceSelect = (service: Service) => {
    const latestPrice = service.prices[0]?.price || 0;
    setSelectedServices([
      ...selectedServices,
      { serviceId: service.id, price: latestPrice, service }
    ]);
  };

  const handleServiceRemove = (serviceId: number) => {
    setSelectedServices(selectedServices.filter(item => item.serviceId !== serviceId));
  };

  const handlePriceUpdate = (serviceId: number, price: number) => {
    setSelectedServices(
      selectedServices.map(item =>
        item.serviceId === serviceId ? { ...item, price } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmitQuote = async () => {
    if (!selectedVehicle) return;

    const quote: Omit<Quote, 'id' | 'date'> = {
      vehicleId: selectedVehicle.id,
      totalPrice: calculateTotal(),
      items: selectedServices.map(({ serviceId, price }) => ({ serviceId, price }))
    };

    try {
      await api.createQuote(quote);
      generatePDF();
    } catch (err) {
      setError('Failed to save quote');
    }
  };

  const generatePDF = () => {
    const element = document.getElementById('quote-summary');
    if (!element) return;

    const opt: import('html2pdf.js').Options = {
      margin: 1,
      filename: 'quote.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Quote</h2>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
              >
                Back
              </button>
            )}
            {step < 3 && selectedVehicle && selectedServices.length > 0 && (
              <button
                onClick={() => setStep(step + 1)}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Vehicle Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Vehicle</h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {vehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                >
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.engine && ` - ${vehicle.engine}`}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Add New Vehicle</h4>
              <form onSubmit={handleNewVehicleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="make">
                    Make
                  </label>
                  {/* Dropdown of major brands with an "Other" option */}
                  <select
                    id="make"
                    className="input"
                    value={useOtherBrand ? 'Other' : (newVehicle.make || '')}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'Other') {
                        setUseOtherBrand(true);
                        setNewVehicle({ ...newVehicle, make: '' });
                      } else {
                        setUseOtherBrand(false);
                        setBrandOther('');
                        setNewVehicle({ ...newVehicle, make: v });
                      }
                    }}
                    required
                  >
                    <option value="">Select brand</option>
                    {/* common major brands list */}
                    <option value="Toyota">Toyota</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Honda">Honda</option>
                    <option value="Nissan">Nissan</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Audi">Audi</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Other">Other</option>
                  </select>

                  {useOtherBrand && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Enter brand"
                        className="input"
                        value={brandOther}
                        onChange={e => {
                          setBrandOther(e.target.value);
                          setNewVehicle({ ...newVehicle, make: e.target.value });
                        }}
                        required
                      />
                    </div>
                  )}

                  {/* Autofill using configured LLM */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={async () => {
                        const llmUrl = localStorage.getItem('LLM_URL') || '';
                        const llmEnabled = localStorage.getItem('LLM_ENABLED') === 'true';
                        if (!llmUrl || !llmEnabled) {
                          setError('LLM not configured or not enabled. Set it in Admin > Settings.');
                          return;
                        }

                        // Build a simple prompt; you can refine later
                        const prompt = `Given the context: "I have a vehicle with limited info. Provide make, model, year (4-digit), and engine if possible. If unknown, return empty strings." Return JSON with keys make, model, year, engine.`;

                        try {
                          const res = await fetch(llmUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt })
                          });

                          if (!res.ok) {
                            throw new Error('LLM request failed');
                          }

                          const data = await res.json();
                          // Expect either { make, model, year, engine } or text with JSON
                          let parsed = data;
                          if (typeof data === 'string') {
                            try {
                              parsed = JSON.parse(data);
                            } catch (e) {
                              // ignore
                            }
                          }

                          if (parsed.make) {
                            setNewVehicle({
                              ...newVehicle,
                              make: parsed.make || newVehicle.make,
                              model: parsed.model || newVehicle.model,
                              year: parsed.year ? parseInt(parsed.year) : newVehicle.year,
                              engine: parsed.engine || newVehicle.engine
                            });
                            setUseOtherBrand(false);
                            setBrandOther('');
                            setError('');
                          } else {
                            setError('LLM did not return vehicle data');
                          }
                        } catch (err) {
                          setError('Failed to call LLM for autofill');
                        }
                      }}
                    >
                      Autofill with AI
                    </button>

                    <div className="text-sm text-gray-600">(Requires Admin &gt; Settings LLM URL)</div>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="model">
                    Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    className="input"
                    value={newVehicle.model || ''}
                    onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="year">
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    className="input"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={newVehicle.year || ''}
                    onChange={e => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="engine">
                    Engine (optional)
                  </label>
                  <input
                    type="text"
                    id="engine"
                    className="input"
                    value={newVehicle.engine || ''}
                    onChange={e => setNewVehicle({ ...newVehicle, engine: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Add Vehicle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                  disabled={selectedServices.some(item => item.serviceId === service.id)}
                >
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.category}</div>
                  <div className="mt-2">
                    Latest Price: ${service.prices[0]?.price.toFixed(2) || 'N/A'}
                  </div>
                </button>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Selected Services</h4>
                <div className="space-y-4">
                  {selectedServices.map(item => (
                    <div key={item.serviceId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-grow">
                        <div className="font-semibold">{item.service?.name}</div>
                        <div className="text-sm text-gray-600">{item.service?.category}</div>
                      </div>
                      <input
                        type="number"
                        className="input w-32"
                        value={item.price}
                        onChange={e => handlePriceUpdate(item.serviceId, parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleServiceRemove(item.serviceId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Quote Summary */}
        {step === 3 && (
          <div>
            <div id="quote-summary" className="bg-white p-8 border rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Quote Summary</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Vehicle Information</h4>
                <p>
                  {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                  {selectedVehicle?.engine && ` - ${selectedVehicle.engine}`}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Services</h4>
                <div className="space-y-2">
                  {selectedServices.map(item => (
                    <div key={item.serviceId} className="flex justify-between">
                      <span>{item.service?.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={generatePDF} className="btn btn-secondary">
                Download PDF
              </button>
              <button onClick={handleSubmitQuote} className="btn btn-primary">
                Save Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteBuilder;
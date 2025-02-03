import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';

interface Address {
  id: string;
  postcode: string;
  building_number: string;
  street_address: string;
  town: string;
  full_address: string;
  created_at: string;
}

interface AddressFormData {
  postcode: string;
  building_number: string;
  street_address: string;
  town: string;
}

const ResidentialAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initialFormData: AddressFormData = {
    postcode: '',
    building_number: '',
    street_address: '',
    town: ''
  };
  
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('residential_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      setError('Failed to fetch addresses');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fullAddress = `${formData.building_number} ${formData.street_address}, ${formData.postcode}`;
      
      if (editingId) {
        const { error } = await supabase
          .from('residential_addresses')
          .update({
            ...formData,
            full_address: fullAddress,
            postcode: formData.postcode.toUpperCase()
          })
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('residential_addresses')
          .insert([{
            ...formData,
            full_address: fullAddress,
            postcode: formData.postcode.toUpperCase()
          }]);
        
        if (error) throw error;
      }
      
      setFormData(initialFormData);
      setIsAddModalOpen(false);
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      setError('Failed to save address');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const { error } = await supabase
          .from('residential_addresses')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchAddresses();
      } catch (err) {
        setError('Failed to delete address');
        console.error('Error:', err);
      }
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      postcode: address.postcode,
      building_number: address.building_number,
      street_address: address.street_address,
      town: address.town
    });
    setEditingId(address.id);
    setIsAddModalOpen(true);
  };

  const filteredAddresses = addresses.filter(address =>
    address.full_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.town.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Residential Addresses</h1>
            <button
              onClick={() => {
                setFormData(initialFormData);
                setEditingId(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Address
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Addresses List */}
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : filteredAddresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No addresses found</div>
          ) : (
            <div className="grid gap-4">
              {filteredAddresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{address.full_address}</h3>
                      <p className="text-gray-600 text-sm mt-1">{address.town}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Added: {new Date(address.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building Number/Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.building_number}
                      onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Town
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Check size={20} />
                      {editingId ? 'Save Changes' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentialAddresses;
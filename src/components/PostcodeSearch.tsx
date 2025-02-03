import React, { useState, useEffect, FC, ChangeEvent } from 'react';
import { Search, AlertCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostcodeSearchProps {
  apiKey?: string;
  onApiUsage?: (endpoint: string, status: string) => void;
}

interface AddressSummary {
  Id: string;
  Type: 'residential' | 'google_place';
  BuildingNumber: string;
  StreetAddress: string;
  Town: string;
  Postcode: string;
  Address: string;
  CreatedAt?: string;
}

interface SearchEndResponse {
  SearchEnd: {
    Summaries: AddressSummary[];
  };
}

interface ResidentialAddress {
  buildingNumber: string;
  streetAddress: string;
  town: string;
  fullAddress: string;
}

interface PostcodeSuggestion {
  postcode: string;
  address: string;
}

const PostcodeSearch: FC<PostcodeSearchProps> = ({ 
  apiKey = 'demo_key', 
  onApiUsage 
}) => {
  const [postcode, setPostcode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressSummary | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<PostcodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newAddress, setNewAddress] = useState<ResidentialAddress>({
    buildingNumber: '',
    streetAddress: '',
    town: '',
    fullAddress: ''
  });

  // Function to fetch postcode suggestions
  const fetchSuggestions = async (input: string) => {
    if (!input || input.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://product-soft.webuildtrades.com/post-code-lookup/api/suggestions/${encodeURIComponent(input)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (postcode) {
        const newSuggestions = await fetchSuggestions(postcode);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [postcode, apiKey]);

  const handlePostcodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPostcode(value);
    setError('');
  };

  const handleSuggestionClick = (suggestion: PostcodeSuggestion) => {
    setPostcode(suggestion.postcode);
    setShowSuggestions(false);
    searchPostcode(suggestion.postcode);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = addresses.find(addr => addr.Id === e.target.value);
    setSelectedAddress(selected || null);
  };

  const updateFullAddress = (currentAddress: ResidentialAddress) => {
    return `${currentAddress.buildingNumber} ${currentAddress.streetAddress}, ${postcode}`;
  };

  const handleAddressSubmit = async () => {
    if (!postcode) {
      toast.error('Please search for a postcode first');
      return;
    }

    if (!newAddress.buildingNumber || !newAddress.streetAddress || !newAddress.town) {
      toast.error('Please provide building number/name, street address, and town');
      return;
    }

    try {
      const response = await fetch(
        `https://product-soft.webuildtrades.com/post-code-lookup/api/residential-address`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            postcode,
            buildingNumber: newAddress.buildingNumber,
            streetAddress: newAddress.streetAddress,
            town: newAddress.town,
            fullAddress: updateFullAddress(newAddress)
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit address');
      }

      const data = await response.json();
      
      const newAddressData: AddressSummary = {
        ...data.address,
        Type: 'residential',
        BuildingNumber: data.address.buildingNumber,
        StreetAddress: data.address.streetAddress
      };
      
      setAddresses(prev => [...prev, newAddressData]);
      
      toast.success('Address added successfully');
      setShowAddressForm(false);
      setNewAddress({
        buildingNumber: '',
        streetAddress: '',
        town: '',
        fullAddress: ''
      });
    } catch (error) {
      toast.error('Failed to add address');
      console.error('Error submitting address:', error);
    }
  };

  const searchPostcode = async (selectedPostcode?: string) => {
    const postcodeToSearch = selectedPostcode || postcode;
    if (!postcodeToSearch) {
      setError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setError('');
    setAddresses([]);
    setShowAddressForm(false);
    setSelectedAddress(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/${encodeURIComponent(postcodeToSearch)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please sign up for full access.');
        }
        throw new Error(response.status === 404 ? 'Postcode not found' : 'Error fetching postcode data');
      }

      const data = await response.json() as SearchEndResponse;
      onApiUsage?.('postcode-search', 'success');

      const summaries = data.SearchEnd.Summaries;
      setAddresses(summaries);

      if (summaries.length > 0) {
        toast.success(`Found ${summaries.length} addresses`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error searching postcode';
      setError(errorMessage);
      onApiUsage?.('postcode-search', 'error');
      toast.error(errorMessage);
      console.error('Postcode search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      searchPostcode();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.postcode-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Search className="h-6 w-6 text-blue-600" />
            Postcode Search
          </h2>
        </div>
  
        {apiKey === 'demo_key' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-600" />
              <p className="text-yellow-700">
                You are using a demo version. Sign up for full access and higher limits.
              </p>
            </div>
          </div>
        )}
  
        <div className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1 postcode-input-container">
                <input
                  type="text"
                  value={postcode}
                  onChange={handlePostcodeChange}
                  onKeyPress={handleKeyPress}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Enter postcode... (e.g., EC1A 1BB)"
                  className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestionClick(suggestion);
                        }}
                      >
                        <MapPin size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium">{suggestion.postcode}</div>
                          <div className="text-sm text-gray-500">{suggestion.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => searchPostcode()}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
              >
                {loading ? 'Searching...' : (
                  <>
                    <Search size={20} />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
  
          {error && (
            <div className="text-red-600 p-3 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}
  
          {addresses.length > 0 && (
            <div className="space-y-6">
              <select
                value={selectedAddress?.Id || ''}
                onChange={handleAddressChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an address...</option>
                {addresses.map((address) => (
                  <option key={address.Id} value={address.Id}>
                    {address.BuildingNumber} {address.StreetAddress}, {address.Town}
                  </option>
                ))}
              </select>
  
              <div className="grid gap-6 md:grid-cols-1">
                {/* Postcode Details Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                      <Search className="h-5 w-5 text-blue-600" />
                      Postcode Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Postcode:</span> 
                      {addresses[0]?.Postcode}
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Town:</span> 
                      {addresses[0]?.Town}
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Total places found:</span> 
                      {addresses.length}
                    </p>
                  </div>
                </div>
  
                {/* Selected Address Details Card */}
                {selectedAddress && (
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <Search className="h-5 w-5 text-green-600" />
                        Selected Address Details
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Building Number/Name:</span>
                        {selectedAddress.BuildingNumber}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Street Address:</span>
                        {selectedAddress.StreetAddress}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Town:</span>
                        {selectedAddress.Town}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Full Address:</span>
                        {selectedAddress.Address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
  
              <div className="mt-4">
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                >
                  <Search size={16} />
                  Can't find your address? Add it here
                </button>
              </div>
  
              {showAddressForm && (
                <div className="mt-4 p-6 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    Add Your Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newAddress.buildingNumber}
                        onChange={(e) => setNewAddress(prev => {
                          const updated = { 
                            ...prev, 
                            buildingNumber: e.target.value
                          };
                          return {
                            ...updated,
                            fullAddress: updateFullAddress(updated)
                          };
                        })}
                        placeholder="Building/House Number or Name"
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={newAddress.streetAddress}
                        onChange={(e) => setNewAddress(prev => {
                          const updated = { 
                            ...prev, 
                            streetAddress: e.target.value
                          };
                          return {
                            ...updated,
                            fullAddress: updateFullAddress(updated)
                          };
                        })}
                        placeholder="Street Name (e.g., High Street)"
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={newAddress.town}
                        onChange={(e) => setNewAddress(prev => ({
                          ...prev,
                          town: e.target.value
                        }))}
                        placeholder="Town"
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddressSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                      >
                        Add Address
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostcodeSearch;
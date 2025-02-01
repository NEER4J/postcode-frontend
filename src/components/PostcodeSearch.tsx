import React, { useState, FC, ChangeEvent } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostcodeSearchProps {
  apiKey?: string;
  onApiUsage?: (endpoint: string, status: string) => void;
}

interface AddressSummary {
  Id: number;
  StreetAddress: string;
  Town: string;
  Postcode: string;
  Address: string;
}

interface SearchEndResponse {
  SearchEnd: {
    Summaries: AddressSummary[];
  };
}

const PostcodeSearch: FC<PostcodeSearchProps> = ({ 
  apiKey = 'demo_key', 
  onApiUsage 
}) => {
  const [postcode, setPostcode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const handlePostcodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value.toUpperCase());
  };

  const handleAddressChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(e.target.value);
  };

  const searchPostcode = async () => {
    if (!postcode) {
      setError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setError('');
    setAddresses([]);

    try {
      const response = await fetch(
        `https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/${encodeURIComponent(postcode)}`,
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Postcode Search</h2>

      {apiKey === 'demo_key' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-yellow-600" />
            <p className="text-yellow-700">
              You are using a demo version. Sign up for full access and higher limits.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={postcode}
            onChange={handlePostcodeChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter postcode... (e.g., EC1A 1BB)"
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={searchPostcode}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : (
              <>
                <Search size={20} />
                Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-600 p-2 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="space-y-4">
            <select
              value={selectedAddress}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select an address...</option>
              {addresses.map((address) => (
                <option key={address.Id} value={address.Address}>
                  {address.StreetAddress} - {address.Address}
                </option>
              ))}
            </select>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Location Details</h3>
              <p>Postcode: {addresses[0]?.Postcode}</p>
              <p>Town: {addresses[0]?.Town}</p>
              <p>Total places found: {addresses.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostcodeSearch;
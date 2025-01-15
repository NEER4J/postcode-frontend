import React, { useState, useEffect, FC, ChangeEvent, useRef } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import toast from 'react-hot-toast';

interface PostcodeSearchProps {
  apiKey?: string; // Make apiKey optional
  onApiUsage?: (endpoint: string, status: string) => void;
}

interface Address {
  name: string;
  fullAddress: string;
  location: google.maps.LatLng;
  types: string[];
}

interface PostcodeData {
  postcode: string;
  latitude: number;
  longitude: number;
  addresses: Address[];
}

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  admin_ward: string;
}

interface PostcodeApiResponse {
  status: number;
  result: PostcodeResult;
}

const PostcodeSearch: FC<PostcodeSearchProps> = ({ apiKey = 'demo_key', onApiUsage }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [postcode, setPostcode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [postcodeData, setPostcodeData] = useState<PostcodeData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initializeMap = async (): Promise<void> => {
      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        const initialMap = new google.maps.Map(mapRef.current, {
          center: { lat: 51.5074, lng: -0.1278 }, // Default to London
          zoom: 10,
        });
        setMap(initialMap);
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load Google Maps');
        onApiUsage?.('map-initialization', 'error');
      }
    };

    if (!isMapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [isMapLoaded, onApiUsage]);

  const clearMarkers = (): void => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const handlePostcodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPostcode(e.target.value.toUpperCase());
  };

  const handleAddressChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedAddress(e.target.value);
  };

  const searchPostcode = async (): Promise<void> => {
    if (!map) {
      setError('Map is not initialized yet. Please try again.');
      return;
    }

    if (!postcode) {
      setError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setError('');
    setPostcodeData(null);
    clearMarkers();

    try {
      const response = await fetch(`https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/${encodeURIComponent(postcode)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please sign up for full access.');
        }
        throw new Error(response.status === 404 ? 'Postcode not found' : 'Error fetching postcode data');
      }

      const data = await response.json() as PostcodeApiResponse;
      onApiUsage?.('postcode-search', 'success');

      const { result } = data;
      const location = { 
        lat: result.latitude, 
        lng: result.longitude 
      };

      map.setCenter(location);
      map.setZoom(16);

      // Create a marker for the postcode location
      const postcodeMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: result.postcode,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });
      setMarkers(prev => [...prev, postcodeMarker]);

      const placesService = new google.maps.places.PlacesService(map);

      const searchRequest: google.maps.places.PlaceSearchRequest = {
        location,
        radius: 500,
        type: 'establishment'
      };

      placesService.nearbySearch(
        searchRequest,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const addresses: Address[] = results
              .filter(place => place.name && place.geometry?.location && place.types)
              .map(place => ({
                name: place.name!,
                fullAddress: `${place.name}, ${place.vicinity || ''}, ${result.postcode}`,
                location: place.geometry!.location!,
                types: place.types!
              }));

            const newMarkers = addresses.map(address => 
              new google.maps.Marker({
                position: address.location,
                map: map,
                title: address.name,
                icon: {
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
              })
            );
            setMarkers(prev => [...prev, ...newMarkers]);

            setPostcodeData({
              postcode: result.postcode,
              latitude: result.latitude,
              longitude: result.longitude,
              addresses
            });

            toast.success('Postcode found successfully');
          } else {
            console.error('Places service error:', status);
            setError('Error fetching nearby places');
            onApiUsage?.('places-search', 'error');
          }
        }
      );
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
    if (e.key === 'Enter' && !loading && isMapLoaded) {
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
            disabled={loading || !isMapLoaded}
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

        {postcodeData && (
          <div className="space-y-4">
            <select
              value={selectedAddress}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select an address...</option>
              {postcodeData.addresses.map((address, index) => (
                <option key={index} value={address.fullAddress}>
                  {address.name} - {address.fullAddress}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Location Details</h3>
                <p>Postcode: {postcodeData.postcode}</p>
                <p>Latitude: {postcodeData.latitude}</p>
                <p>Longitude: {postcodeData.longitude}</p>
                <p>Total places found: {postcodeData.addresses.length}</p>
              </div>
              <div 
                ref={mapRef}
                className="h-96 bg-gray-100 rounded-lg"
              ></div>
            </div>
          </div>
        )}

        {!postcodeData && (
          <div 
            ref={mapRef}
            className="h-96 bg-gray-100 rounded-lg"
          ></div>
        )}
      </div>
    </div>
  );
};

export default PostcodeSearch;
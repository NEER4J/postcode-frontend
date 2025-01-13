import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import PostcodeSearch from '../components/PostcodeSearch';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <MapPin size={48} className="text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          UK Postcode Lookup Service
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Fast, reliable postcode lookup with integrated mapping. Perfect for businesses and developers.
        </p>
      </div>

   

      <PostcodeSearch />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Accurate Data</h3>
          <p className="text-gray-600">
            Access precise location data powered by the official Postcodes.io API.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Interactive Maps</h3>
          <p className="text-gray-600">
            Visualize locations with integrated Google Maps support.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Developer Friendly</h3>
          <p className="text-gray-600">
            Get your API key and integrate our service into your applications.
          </p>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Code, Terminal } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              To use our API, you'll need an API key. You can generate your API key from the dashboard
              after signing up for an account.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-medium mb-2">Authentication Header:</p>
              <code className="block bg-gray-800 text-white p-3 rounded">
                Authorization: Bearer your_api_key_here
              </code>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal size={20} className="text-blue-600" />
                  <h3 className="text-xl font-medium">Postcode Lookup</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  Retrieve detailed information about a UK postcode, including nearby places.
                </p>
                <div className="bg-gray-100 p-3 rounded">
                  <p className="font-medium">GET /api/postcodes/{'{postcode}'}</p>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Example Response:</h4>
                  <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
{`{
  "status": 200,
  "result": {
    "postcode": "SW1A 1AA",
    "latitude": 51.501009,
    "longitude": -0.141588,
    "admin_district": "Westminster",
    "admin_ward": "St James's",
    "addresses": [
      {
        "name": "10 Downing Street",
        "fullAddress": "10 Downing Street, London, SW1A 1AA",
        "location": {
          "lat": 51.5033635,
          "lng": -0.1276248
        },
        "types": ["point_of_interest", "establishment"]
      }
    ]
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code size={20} className="text-blue-600" />
                  <h3 className="text-xl font-medium">Code Examples</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">JavaScript/Node.js:</h4>
                    <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
{`const response = await fetch(
  'http://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/SW1A1AA',
  {
    headers: {
      'Authorization': 'Bearer your_api_key_here'
    }
  }
);
const data = await response.json();`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Python:</h4>
                    <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer your_api_key_here'
}

response = requests.get(
    'http://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/SW1A1AA',
    headers=headers
)
data = response.json()`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">
                Free tier accounts are limited to 100 requests per day.
                For higher limits, please contact our support team.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
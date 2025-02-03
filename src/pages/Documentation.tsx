import React, { useState } from 'react';
import { Code, Terminal, Key, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// TabButton and CodeBlock components remain the same...
const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const CodeBlock = ({ language, children }) => (
  <div className="relative group">
    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => navigator.clipboard.writeText(children)}
        className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-800 rounded hover:bg-gray-700"
      >
        Copy
      </button>
    </div>
    <pre className={`language-${language} bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto`}>
      <code>{children}</code>
    </pre>
  </div>
);

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('javascript');

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <Helmet>
        <title>Documentation - PostCode API</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              API Documentation
            </h1>
            <p className="text-lg text-gray-600">
              Complete guide to integrating with the UK Postcode Lookup API
            </p>
          </div>

          {/* Authentication Section - remains the same... */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Key className="text-blue-600" size={24} />
              <h2 className="text-2xl font-semibold">Authentication</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              All API requests require authentication using an API key. Generate your API key from the dashboard after creating an account.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">API Key Header Format:</p>
              <CodeBlock language="bash">
                Authorization: Bearer your_api_key_here
              </CodeBlock>
            </div>
          </section>

          {/* Endpoints Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="text-blue-600" size={24} />
              <h2 className="text-2xl font-semibold">Endpoints</h2>
            </div>

            <div className="space-y-8">
              {/* GET Postcode Lookup */}
              <div>
                <h3 className="text-lg font-medium mb-2">1. Postcode Lookup</h3>
                <p className="text-gray-600 mb-4">
                  Retrieve both Google Places establishments and residential addresses for a UK postcode.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">GET</span>
                    <code>/post-code-lookup/api/postcodes/{'{postcode}'}</code>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Response Format:</h4>
                    <CodeBlock language="json">
{`{
  "SearchEnd": {
    "Summaries": [
      {
        "Id": "gp_ChIJx-3-UfCWcEgRkv5LTOysqn0",
        "Type": "google_place",
        "BuildingNumber": "Theory Recruitment",
        "StreetAddress": "19 Hereward Rise",
        "Town": "Dudley",
        "Postcode": "B62 8AN",
        "Address": "19 Hereward Rise, Halesowen, B62 8AN"
      },
      {
        "Id": "e04b386f-738f-4194-a1ea-d7f3898d7f28",
        "Type": "residential",
        "BuildingNumber": "We Build Trades Office ff1",
        "StreetAddress": "19 Hereward Rise",
        "Town": "Halesowen",
        "Postcode": "B628AN",
        "Address": "We Build Trades Office ff1 19 Hereward Rise, B628AN",
        "CreatedAt": "2025-02-03T11:57:50.5177+00:00"
      }
    ]
  }
}`}
                    </CodeBlock>
                  </div>
                </div>
              </div>

              {/* POST Residential Address */}
              <div>
                <h3 className="text-lg font-medium mb-2">2. Add Residential Address</h3>
                <p className="text-gray-600 mb-4">
                  Add a new residential address to the database for a specific postcode.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">POST</span>
                    <code>/post-code-lookup/api/residential-address</code>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Request Format:</h4>
                    <CodeBlock language="json">
{`{
  "postcode": "B628AN",
  "buildingNumber": "We Build Trades Office ff1",
  "streetAddress": "19 Hereward Rise",
  "town": "Halesowen",
  "fullAddress": "We Build Trades Office ff1 19 Hereward Rise, B628AN"
}`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Response Format:</h4>
                    <CodeBlock language="json">
{`{
  "address": {
    "id": "e04b386f-738f-4194-a1ea-d7f3898d7f28",
    "type": "residential",
    "buildingNumber": "We Build Trades Office ff1",
    "streetAddress": "19 Hereward Rise",
    "town": "Halesowen",
    "postcode": "B628AN",
    "fullAddress": "We Build Trades Office ff1 19 Hereward Rise, B628AN",
    "createdAt": "2025-02-03T11:57:50.5177+00:00"
  }
}`}
                    </CodeBlock>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Code Examples Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Code className="text-blue-600" size={24} />
              <h2 className="text-2xl font-semibold">Code Examples</h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <TabButton 
                  active={activeTab === 'javascript'} 
                  onClick={() => setActiveTab('javascript')}
                >
                  JavaScript
                </TabButton>
                <TabButton 
                  active={activeTab === 'python'} 
                  onClick={() => setActiveTab('python')}
                >
                  Python
                </TabButton>
                <TabButton 
                  active={activeTab === 'curl'} 
                  onClick={() => setActiveTab('curl')}
                >
                  cURL
                </TabButton>
              </div>

              {activeTab === 'javascript' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Get Addresses:</h4>
                    <CodeBlock language="javascript">
{`// Using fetch
const apiKey = 'your_api_key_here';
const postcode = 'B628AN';

const response = await fetch(
  \`https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/\${postcode}\`,
  {
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Add Residential Address:</h4>
                    <CodeBlock language="javascript">
{`const response = await fetch(
  'https://product-soft.webuildtrades.com/post-code-lookup/api/residential-address',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      postcode: 'B628AN',
      buildingNumber: 'We Build Trades Office ff1',
      streetAddress: '19 Hereward Rise',
      town: 'Halesowen',
      fullAddress: 'We Build Trades Office ff1 19 Hereward Rise, B628AN'
    })
  }
);

const data = await response.json();`}
                    </CodeBlock>
                  </div>
                </div>
              )}

              {activeTab === 'python' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Get Addresses:</h4>
                    <CodeBlock language="python">
{`import requests

api_key = 'your_api_key_here'
postcode = 'B628AN'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get(
    f'https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/{postcode}',
    headers=headers
)

data = response.json()`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Add Residential Address:</h4>
                    <CodeBlock language="python">
{`payload = {
    'postcode': 'B628AN',
    'buildingNumber': 'We Build Trades Office ff1',
    'streetAddress': '19 Hereward Rise',
    'town': 'Halesowen',
    'fullAddress': 'We Build Trades Office ff1 19 Hereward Rise, B628AN'
}

response = requests.post(
    'https://product-soft.webuildtrades.com/post-code-lookup/api/residential-address',
    headers=headers,
    json=payload
)

data = response.json()`}
                    </CodeBlock>
                  </div>
                </div>
              )}

              {activeTab === 'curl' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Get Addresses:</h4>
                    <CodeBlock language="bash">
{`curl -X GET \\
  'https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/B628AN' \\
  -H 'Authorization: Bearer your_api_key_here' \\
  -H 'Content-Type: application/json'`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Add Residential Address:</h4>
                    <CodeBlock language="bash">
{`curl -X POST \\
  'https://product-soft.webuildtrades.com/post-code-lookup/api/residential-address' \\
  -H 'Authorization: Bearer your_api_key_here' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "postcode": "B628AN",
    "buildingNumber": "We Build Trades Office ff1",
    "streetAddress": "19 Hereward Rise",
    "town": "Halesowen",
    "fullAddress": "We Build Trades Office ff1 19 Hereward Rise, B628AN"
  }'`}
                    </CodeBlock>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
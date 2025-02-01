import React, { useState } from 'react';
import { Code, Terminal, Key, Clock, AlertCircle, ChevronRight } from 'lucide-react';

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

          {/* Authentication Section */}
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

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Postcode Lookup</h3>
                <p className="text-gray-600 mb-4">
                  Retrieve detailed information about a UK postcode including nearby establishments.
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
        "Id": "12345",
        "StreetAddress": "10 Downing Street",
        "Town": "Westminster",
        "Postcode": "SW1A 1AA",
        "Address": "10 Downing Street, Westminster, London SW1A 1AA",
        "Longitude": -0.1276248,
        "Latitude": 51.5033635
      }
    ]
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
                <CodeBlock language="javascript">
{`// Using fetch
const apiKey = 'your_api_key_here';
const postcode = 'SW1A1AA';

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
              )}

              {activeTab === 'python' && (
                <CodeBlock language="python">
{`import requests

api_key = 'your_api_key_here'
postcode = 'SW1A1AA'

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
              )}

              {activeTab === 'curl' && (
                <CodeBlock language="bash">
{`curl -X GET \\
  'https://product-soft.webuildtrades.com/post-code-lookup/api/postcodes/SW1A1AA' \\
  -H 'Authorization: Bearer your_api_key_here' \\
  -H 'Content-Type: application/json'`}
                </CodeBlock>
              )}
            </div>
          </section>

          {/* Rate Limits Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hidden">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-blue-600" size={24} />
              <h2 className="text-2xl font-semibold">Rate Limits</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Free Tier</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-blue-700">
                    <ChevronRight size={16} />
                    <span>5 requests per 15 minutes</span>
                  </li>
                  <li className="flex items-center gap-2 text-blue-700">
                    <ChevronRight size={16} />
                    <span>Requires demo API key</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h3 className="text-lg font-medium text-purple-900 mb-2">Premium Tier</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-purple-700">
                    <ChevronRight size={16} />
                    <span>100 requests per day</span>
                  </li>
                  <li className="flex items-center gap-2 text-purple-700">
                    <ChevronRight size={16} />
                    <span>Custom API key provided</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex gap-2">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <p className="text-yellow-700">
                  For higher rate limits or custom plans, please contact our support team.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  Rocket, 
  Zap, 
  Code, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Globe,
  Database,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PostcodeSearch from '../components/PostcodeSearch';


const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-blue-50 rounded-xl">
        <Icon className="text-blue-600" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ number, label }) => (
  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

export default function Home() {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>PostCode API - Fast & Reliable UK Address Lookup</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="description" content="Lightning-fast UK postcode lookup with integrated mapping and location data. Built for developers and businesses." />
      </Helmet>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Rocket size={16} />
                Powerful Postcode API
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Address <br />
                <span className="text-blue-600">Lookup</span> Experience
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Lightning-fast UK postcode lookup with integrated mapping and location data. Built for developers and businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/documentation" 
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  View Documentation
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <PostcodeSearch />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="<100ms" label="Response Time" />
            <StatCard number="1M+" label="API Calls" />
            <StatCard number="200+" label="Happy Users" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Address Lookup
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive suite of features designed for developers and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Globe}
              title="Real-Time Lookup"
              description="Lightning-fast postcode validation and address lookup powered by official data sources."
            />
            <FeatureCard
              icon={Database}
              title="Rich Data"
              description="Access comprehensive location data including latitude, longitude, and local establishments."
            />
            <FeatureCard
              icon={Code}
              title="Developer-First"
              description="Simple REST API with comprehensive documentation and examples in multiple languages."
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Ready"
              description="Bank-grade security with rate limiting and domain restrictions for your API keys."
            />
            <FeatureCard
              icon={Zap}
              title="High Performance"
              description="Sub-100ms response times with 99.9% uptime guarantee for your critical applications."
            />
            <FeatureCard
              icon={Building2}
              title="Business Ready"
              description="Perfect for e-commerce, delivery services, and address verification needs."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Address Lookup?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of developers and businesses using our API for reliable address validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors font-medium"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/documentation" 
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-400 transition-colors font-medium"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import the Footer at the top of the file:
// import Footer from '../components/Footer';
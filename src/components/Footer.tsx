import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin,
  Mail
} from 'lucide-react';

const FooterSection = ({ title, children }) => (
  <div className="flex flex-col gap-4">
    <h3 className="font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

const FooterLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-gray-600 hover:text-blue-600 transition-colors"
  >
    {children}
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <MapPin className="text-blue-600" size={24} />
                <span className="font-semibold text-xl text-gray-900">UK Postcode Lookup</span>
              </Link>
              <p className="text-gray-600 mb-6 max-w-md">
                Fast, reliable postcode lookup API service for businesses and developers. 
                Get accurate location data instantly.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/*  
            <FooterSection title="Product">
              <FooterLink to="#features">Features</FooterLink>
              <FooterLink to="/documentation">Documentation</FooterLink>
            </FooterSection>
*/}
           

            {/* Resources Links */}
            <FooterSection title="Resources">
              <FooterLink to="/documentation">Documentation</FooterLink>
              <FooterLink to="/support">Support</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
            </FooterSection>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-gray-200 pt-8 mb-8 hidden">
            <div className="max-w-md">
              <h3 className="font-semibold text-gray-900 mb-4">
                Subscribe to our newsletter
              </h3>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              © {new Date().getFullYear()} UK Postcode Lookup. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm hidden">
              <FooterLink to="/terms">Terms</FooterLink>
              <FooterLink to="/privacy">Privacy</FooterLink>
              <FooterLink to="/cookies">Cookies</FooterLink>
              <FooterLink to="/sitemap">Sitemap</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
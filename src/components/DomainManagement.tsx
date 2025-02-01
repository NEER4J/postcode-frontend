// components/DomainManagement.tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  allowed_domains?: string[];
  [key: string]: any; // for other profile properties
}

interface DomainManagementProps {
  profile: Profile;
  onUpdate: () => void;
}

const DomainManagement: React.FC<DomainManagementProps> = ({ profile, onUpdate }) => {
  const [newDomain, setNewDomain] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const validateDomain = (domain: string): boolean => {
    try {
      // Remove protocol if present
      let cleanDomain = domain.toLowerCase();
      if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
        cleanDomain = cleanDomain.split('//')[1];
      }
      
      // Remove trailing slash if present
      cleanDomain = cleanDomain.replace(/\/$/, '');

      // Special case for localhost with optional port
      if (cleanDomain === 'localhost' || /^localhost:\d+$/.test(cleanDomain)) {
        return true;
      }

      // Regular domain validation for other cases
      const domainRegex = /^(?:localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/;
      return domainRegex.test(cleanDomain);
    } catch (error) {
      return false;
    }
  };

  const cleanDomain = (domain: string): string => {
    let cleanDomain = domain.toLowerCase().trim();
    
    // Remove protocol if present
    if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
      cleanDomain = cleanDomain.split('//')[1];
    }
    
    // Remove trailing slash if present
    return cleanDomain.replace(/\/$/, '');
  };

  const addDomain = async (): Promise<void> => {
    if (!newDomain) return;

    try {
      const domain = cleanDomain(newDomain);
      
      if (!validateDomain(domain)) {
        toast.error('Please enter a valid domain name');
        return;
      }

      const currentDomains = profile.allowed_domains || [];
      
      if (currentDomains.includes(domain)) {
        toast.error('Domain already exists');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          allowed_domains: [...currentDomains, domain]
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Domain added successfully');
      onUpdate();
      setNewDomain('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Error adding domain');
    }
  };

  const removeDomain = async (domainToRemove: string): Promise<void> => {
    try {
      const currentDomains = profile.allowed_domains || [];
      const updatedDomains = currentDomains.filter(d => d !== domainToRemove);

      const { error } = await supabase
        .from('profiles')
        .update({ allowed_domains: updatedDomains })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Domain removed successfully');
      onUpdate();
    } catch (error) {
      console.error('Error removing domain:', error);
      toast.error('Error removing domain');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addDomain();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Allowed Domains</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Add domains that are allowed to make API requests with your key.</p>
        <p>Leave empty to allow all domains.</p>
      </div>

      <div className="space-y-2">
        {(profile.allowed_domains || []).map((domain) => (
          <div 
            key={domain} 
            className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
          >
            <span className="font-mono text-sm">{domain}</span>
            <button
              onClick={() => removeDomain(domain)}
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label={`Remove ${domain}`}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter domain (e.g., example.com, localhost:5173)"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            onClick={addDomain}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={!newDomain}
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={18} />
          Add Domain
        </button>
      )}
    </div>
  );
};

export default DomainManagement;
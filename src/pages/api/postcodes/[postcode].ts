// src/pages/api/postcodes/[postcode].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  const { postcode } = req.query;

  // Validate API key
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  try {
    // Verify API key in database
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (dbError || !profile) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Forward request to postcodes.io
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Log API usage
    await supabase.from('api_usage').insert([
      {
        user_id: profile.id,
        endpoint: 'postcode-search',
        status: 'success',
        timestamp: new Date().toISOString()
      }
    ]);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Postcode API error:', error);
    
    // Log failed attempt if we have a valid profile
    if (profile?.id) {
      await supabase.from('api_usage').insert([
        {
          user_id: profile.id,
          endpoint: 'postcode-search',
          status: 'error',
          timestamp: new Date().toISOString()
        }
      ]);
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
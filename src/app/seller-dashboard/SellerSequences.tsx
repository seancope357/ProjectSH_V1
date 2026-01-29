'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Sequence {
  id: string;
  title: string;
  description: string;
  price: number;
  // Add other relevant fields for a sequence
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellerSequences() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSequences = async () => {
      try {
        // In a real application, you would filter by the current seller's ID
        const { data, error } = await supabase
          .from('sequences') // Assuming you have a 'sequences' table
          .select('*');

        if (error) {
          throw error;
        }

        setSequences(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSequences();
  }, []);

  if (loading) {
    return <p>Loading sequences...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Your Uploaded Sequences</h2>
      {sequences.length === 0 ? (
        <p>You haven&apos;t uploaded any sequences yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="border p-4 rounded-md">
              <h3 className="font-bold text-lg">{sequence.title}</h3>
              <p className="text-gray-600">{sequence.description}</p>
              <p className="text-green-600 font-semibold">${sequence.price}</p>
              {/* Add more sequence details here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
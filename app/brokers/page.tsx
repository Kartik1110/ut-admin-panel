'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Broker {
  id: string;
  name: string;
  email: string;
  w_number: string;
  updatedAt: string;
  country_code: string;
  company: {
    id: string;
    name: string;
  } | null; 
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const fetchBrokers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/brokers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBrokers(response.data.data.brokers || []);
      console.log("Fetched Brokers:", response.data.data.brokers);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch brokers'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  },[] );
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Broker List</h1>

      {loading && <p>Loading brokers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && brokers.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className='border p-2'>Country code</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Broker id</th>
              <th className="border p-2">Company</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker) => (
              <tr key={broker.id}>
                <td className="border p-2">{broker.name}</td>
                <td className="border p-2">{broker.email}</td>
                <td className="border p-2">{broker.country_code}</td>
                <td className="border p-2">{broker.w_number}</td>
                <td className="border p-2">{broker.id}</td>
                <td className="border p-2"> {broker.company?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
      )}
      <div className="flex justify-between mt-4 items-center">
   
    </div>
  </div>

   
  );
}

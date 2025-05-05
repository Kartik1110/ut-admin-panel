'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1//brokers`,
        {
          params: {
            page,
            page_size: pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBrokers(response.data.data.brokers);
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
  }, [page]);

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
              <th className="border p-2">Phone</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker) => (
              <tr key={broker.id}>
                <td className="border p-2">{broker.name}</td>
                <td className="border p-2">{broker.email}</td>
                <td className="border p-2">{broker.phone}</td>
                <td className="border p-2">{broker.status}</td>
                <td className="border p-2">{new Date(broker.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

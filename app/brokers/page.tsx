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
 //break
  // const fetchAllBrokers = async () => {
  //   try {
  //     setLoading(true);
  //     setError('');
  //     const token = localStorage.getItem('token');
  //     const allBrokers: Broker[] = [];
  //     let currentPage = 1;
  //     let totalPages = 1;
  
  //     do {
  //       const response = await axios.post(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/brokers`,
  //         {
  //           page: currentPage,
  //           page_size: 50, // You can increase this to reduce API calls
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  
  //       const data = response.data.data;
  //       allBrokers.push(...data.brokers);
  //       totalPages = data.pagination.total_pages;
  //       currentPage++;
  //     } while (currentPage <= totalPages);
  
  //     setBrokers(allBrokers);
  //   } catch (err: any) {
  //     setError(
  //       err.response?.data?.message || err.message || 'Failed to fetch brokers'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
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
    {/* <div>
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="mx-2">Page {page} of {totalPages}</span>
      <button
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div> */}

    <div>
      {/* <label>
        Rows per page:{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page
          }}
          className="ml-2 px-2 py-1 border rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </label> */}
    </div>
  </div>

    </div>
  );
}

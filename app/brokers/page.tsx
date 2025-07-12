'use client';

import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Dialog, Transition } from '@headlessui/react';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

interface Broker {
  id: string;
  name: string;
  email: string;
  info: string;
  y_o_e: number;
  languages: string[];
  is_certified: boolean;
  profile_pic: string;
  country_code: string;
  w_number: string;
  ig_link: string;
  linkedin_link: string;
  designation: string;
  company_id: string;
  user_id: string;
  type: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  } | null;
  listings?: Listing[];
}

interface Listing {
  id: string;
  title: string;
  description: string;
  image: string;
  min_price?: number;
  max_price?: number;
  sq_ft?: number;
  type: string; 
  category: string; 
  looking_for: boolean;
  rental_frequency?: string;
  no_of_bedrooms?: string;
  no_of_bathrooms?: string;
  furnished?: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  image_urls: string[];
  project_age?: number;
  payment_plan?: string;
  sale_type?: string;
  broker_id: string;
  created_at: string; 
  admin_status?: string;
}

type SortKey = 'name' | 'email' | 'listings';
type SortDirection = 'asc' | 'desc';

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [filteredBrokers, setFilteredBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10000);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/brokers/?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { brokers, pagination } = response.data.data;
      setBrokers(brokers || []);
      setTotalPages(pagination?.total_pages || 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
    setError(
      err.response?.data?.message || err.message || 'Failed to fetch brokers'
    );
  } else {
    setError('Failed to fetch brokers');
  }

    } finally {
      setLoading(false);
    }
}, [page, pageSize]);

useEffect(() => {
  fetchBrokers();
}, [fetchBrokers]);


useEffect(() => {
  filterBrokers();
}, [searchTerm, brokers]);

  const filterBrokers = () => {
    const term = searchTerm.toLowerCase();
    const filtered = brokers.filter((broker) => {
      return (
        (broker.name || '').toLowerCase().includes(term) ||
        (broker.email || '').toLowerCase().includes(term) ||
        (broker.country_code || '').toLowerCase().includes(term) ||
        (broker.w_number || '').toLowerCase().includes(term) ||
        (broker.id || '').toLowerCase().includes(term) ||
        (broker.company?.name || '').toLowerCase().includes(term)
      );
    });
    setFilteredBrokers(filtered);
  };

  const openDialog = (broker: Broker) => {
    setSelectedBroker(broker);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedBroker(null);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedBrokers = [...filteredBrokers].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;

 let valA: string | number = key === 'listings' ? a.listings?.length || 0 : (a[key] as string);
let valB: string | number = key === 'listings' ? b.listings?.length || 0 : (b[key] as string);


    if (key === 'listings') {
      valA = a.listings?.length || 0;
      valB = b.listings?.length || 0;
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortArrow = (key: SortKey) => {
    if (sortConfig?.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const downloadCSV = () => {
  const headers = [
    'Name',
    'Email',
    'Country Code',
    'Phone',
    'Broker ID',
    'Company Name',
  ];

  const rows = sortedBrokers.map((broker) => [
    broker.name,
    broker.email,
    broker.country_code,
    broker.w_number,
    broker.id,
    broker.company?.name || 'N/A',
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'brokers.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6">Broker List</h1>

        <button
          onClick={downloadCSV}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download CSV
        </button>


        <input
          type="text"
          placeholder="Search:  Name / Email / Phone / BrokerId / Company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-3/4 "
        />

        {loading && <p className="text-gray-600">Loading brokers...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && filteredBrokers.length === 0 && (
          <p className="text-gray-600">No brokers found.</p>
        )}

        {!loading && filteredBrokers.length > 0 && (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">S. No.</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('name')}>
                    Name {renderSortArrow('name')}
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('email')}>
                    Email {renderSortArrow('email')}
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Country Code</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Broker ID</th>
                  {/* <th className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('listings')}>
                    Listings {renderSortArrow('listings')}
                  </th> */}
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Company</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBrokers.map((broker, index) => (
                  <tr key={broker.id}>
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">{broker.name}</td>
                    <td className="px-4 py-3 text-sm">{broker.email}</td>
                    <td className="px-4 py-3 text-sm">{broker.country_code}</td>
                    <td className="px-4 py-3 text-sm">{broker.w_number}</td>
                    <td className="px-4 py-3 text-sm">{broker.id}</td>
                    {/* <td className="px-4 py-3 text-sm">{broker.listings?.length || 0}</td> */}
                    <td className="px-4 py-3 text-sm">{broker.company?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDialog(broker)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between mt-6 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Broker Details Modal */}
        <Transition appear show={isDialogOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeDialog}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-30" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Broker Details
                    </Dialog.Title>
                    {selectedBroker && (
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Name:</strong> {selectedBroker.name}</p>
                        <p><strong>Email:</strong> {selectedBroker.email}</p>
                        <p><strong>Info:</strong> {selectedBroker.info}</p>
                        <p><strong>Years of Experience:</strong> {selectedBroker.y_o_e}</p>
                        <p><strong>Languages:</strong> {selectedBroker.languages.join(', ')}</p>
                        <p><strong>Certified:</strong> {selectedBroker.is_certified ? 'Yes' : 'No'}</p>
                        <p><strong>Phone:</strong> {selectedBroker.w_number}</p>
                        <p><strong>Country Code:</strong> {selectedBroker.country_code}</p>
                      </div>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </ProtectedRoute>
  );
}

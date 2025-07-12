'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  data: {
    token: string;
    brokerId: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      password: string;
      createdAt: string;
      updatedAt: string;
      country_code: string | null;
      w_number: string | null;
      appleAccessToken: string | null;
      appleId: string | null;
      appleRefreshToken: string | null;
      googleAccessToken: string | null;
      googleId: string | null;
      googleRefreshToken: string | null;
      fcm_token: string | null;
    };
  };
  message: string;
  status: boolean;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('🚀 Sending login request...', { email, password });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🧾 Response status:', res.status);

        let result: LoginResponse | null = null;
        try {
          result = await res.json();
          console.log('✅ Parsed response JSON:', result);
        } catch (jsonErr) {
          console.error('❌ Failed to parse response as JSON:', jsonErr);
          throw new Error('Invalid JSON from server');
        }


      if (!res.ok) {
        setError(result?.message || 'Login failed');
        return;
      }
      if (!result || !res.ok) {
        setError(result?.message || 'Login failed');
        return;
      }

        const { token, user } = result.data;

      if (!user || user.role !== 'ADMIN') {
        setError('Access denied. Admins only.');
        return;
      }

      // Store token and redirect
      localStorage.setItem('token', token);
      router.push('/listings');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full p-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full p-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

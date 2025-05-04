// 'use client';

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const loginSchema = z.object({
//   email: z.string().email({ message: "Invalid email" }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
// });

// type LoginForm = z.infer<typeof loginSchema>;

// export default function SignIn() {
//   const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//   });

//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState("");
//   const router = useRouter();

//   const onSubmit = async (data: LoginForm) => {
//     setLoading(true);
//     setServerError("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/v1/auth/login", data);
//       const { token, user } = res.data.data;

//       if (user.role !== "admin") {
//         setServerError("Access denied: Only admins can log in.");
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("token", token); // Save token or use context
//       router.push("/dashboard"); // Redirect to admin dashboard
//     } catch (err: any) {
//       setServerError(err?.response?.data?.error || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Admin Sign In</h1>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               {...register("email")}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//             />
//             {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               {...register("password")}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//             />
//             {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
//           </div>

//           {serverError && <p className="text-sm text-red-600">{serverError}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50"
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SignIn() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, 
        data
      );
      
      const { token, user } = res.data.data;

      if (user.role !== "admin") {
        setServerError("Access denied: Only admins can log in.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token); // Save token to localStorage
      router.push("/"); // Redirect to admin dashboard
      getAuthenticatedData(); // Fetch protected data
    } catch (err: any) {
      setServerError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Add the logic to include the bearer token in the request headers for further API calls if needed
  const getAuthenticatedData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setServerError("You must be logged in.");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/protected", 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data); // Handle the response data as needed
    } catch (err: any) {
      setServerError("Failed to fetch authenticated data");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

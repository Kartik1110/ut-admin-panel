"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
  User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

// Import interfaces from types folder
import { 
  ApiResponse, 
  FormattedListing, 
} from "@/types/interfaces";

import UrbantapLogo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LogoutButton from '@/components/LogoutButton';

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<FormattedListing | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("All");
  const itemsPerPage = 5;

  const queryClient = useQueryClient();

  // Fetch listings query
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["listings", currentPage],
    queryFn: async () => {

      const token = localStorage.getItem("token"); // ✅ Get token dynamically
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/listings`, {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      return response.json() as Promise<ApiResponse>;
    },
  });

  // Format the listings data
  const listings: FormattedListing[] =
    apiResponse?.data.listings.map((item) => ({
      id: item.listing.id,
      name: item.broker.name,
      email: `${item.broker.name.toLowerCase().replace(" ", ".")}@example.com`, // Simulating email since it's not in the API
      phone: `${item.broker.country_code}${item.broker.w_number}`,
      status: item.listing.admin_status,
      created_at: item.listing.created_at,
      type: item.listing.type,
      details: item.listing.description,
      company: item.company.name,
      price_range: `${item.listing.min_price} - ${item.listing.max_price}`,
      location: `${item.listing.city}, ${item.listing.address}`,
      // Include all other fields from the API
      title: item.listing.title,
      description: item.listing.description,
      image: item.listing.image,
      min_price: item.listing.min_price,
      max_price: item.listing.max_price,
      sq_ft: item.listing.sq_ft,
      category: item.listing.category,
      looking_for: item.listing.looking_for,
      rental_frequency: item.listing.rental_frequency,
      no_of_bedrooms: item.listing.no_of_bedrooms,
      no_of_bathrooms: item.listing.no_of_bathrooms,
      furnished: item.listing.furnished,
      city: item.listing.city,
      address: item.listing.address,
      amenities: item.listing.amenities,
      image_urls: item.listing.image_urls,
      project_age: item.listing.project_age,
      payment_plan: item.listing.payment_plan,
      sale_type: item.listing.sale_type,
    })) || [];

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem("token"); // ✅ Get token dynamically
      if (!token) {
        throw new Error("Authorization token not found");
      }
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/listings/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", currentPage] });


    },
  });

  // Handle accept action
  const handleAccept = (id: string) => {
    updateStatusMutation.mutate({ id, status: "Approved" });
  };

  // Handle reject action
  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "Rejected" });
  };

  // Handle view details
  const handleViewDetails = (item: FormattedListing) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  // Filter data based on search term and type filter
  const filteredData = listings.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate pagination
  const totalItems = apiResponse?.data.pagination.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ProtectedRoute>

    <div className="flex min-h-screen w-full flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <UrbantapLogo />
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem> <LogoutButton /></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or status..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broker Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.price_range}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "Approved"
                                ? "success"
                                : item.status === "Rejected"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "Pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => handleAccept(item.id)}
                                  disabled={updateStatusMutation.isPending} 
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                  onClick={() => handleReject(item.id)}
                                  disabled={updateStatusMutation.isPending} 
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(item)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {totalItems} entries
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.title || "Property Details"}
            </DialogTitle>
            <DialogDescription>
              Complete information about this property listing
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Property Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Details</h3>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Title:</span>
                    <span className="col-span-2">{selectedItem.title}</span>
                  </div>

                  <div className="grid grid-cols-3 items-start gap-2">
                    <span className="font-medium">Description:</span>
                    <span className="col-span-2">
                      {selectedItem.description}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className="col-span-2">{selectedItem.type}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Category:</span>
                    <span className="col-span-2">
                      {selectedItem.category.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Price Range:</span>
                    <span className="col-span-2">
                      {selectedItem.price_range}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Area:</span>
                    <span className="col-span-2">
                      {selectedItem.sq_ft} sq ft
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Bedrooms:</span>
                    <span className="col-span-2">
                    {selectedItem.no_of_bedrooms? selectedItem.no_of_bedrooms.replace("_", " "): "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Bathrooms:</span>
                    <span className="col-span-2">
                    {selectedItem.no_of_bathrooms? selectedItem.no_of_bathrooms.replace("_", " "): "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Furnished:</span>
                    <span className="col-span-2">{selectedItem.furnished}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span className="col-span-2">{selectedItem.location}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Project Age:</span>
                    <span className="col-span-2">
                      {selectedItem.project_age} years
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Payment Plan:</span>
                    <span className="col-span-2">
                    {selectedItem.payment_plan? selectedItem.payment_plan.replace("_", " "): "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Sale Type:</span>
                    <span className="col-span-2">{selectedItem.sale_type}</span>
                  </div>
                </div>

                {/* Broker & Status Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Broker Information</h3>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Broker:</span>
                    <span className="col-span-2">{selectedItem.name}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Company:</span>
                    <span className="col-span-2">{selectedItem.company}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="col-span-2">{selectedItem.email}</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <span className="col-span-2">{selectedItem.phone}</span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">Listing Status</h3>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="col-span-2">
                      <Badge
                        variant={
                          selectedItem.status === "Approved"
                            ? "success"
                            : selectedItem.status === "Rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {selectedItem.status}
                      </Badge>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="font-medium">Created:</span>
                    <span className="col-span-2">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images Section */}
              {selectedItem.image_urls.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-lg font-semibold">Images</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {selectedItem.image_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-video overflow-hidden rounded-md"
                      >
                        <Image
                          src={url}
                          alt={`Property image ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>

  );
}

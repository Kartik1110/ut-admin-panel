// API Response Interfaces
export interface Broker {
  id: string;
  name: string;
  profile_pic: string;
  country_code: string;
  w_number: string;
}

export interface Company {
  name: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  image: string;
  min_price: number;
  max_price: number;
  sq_ft: number;
  type: string;
  category: string;
  looking_for: boolean;
  rental_frequency: string | null;
  no_of_bedrooms: string;
  no_of_bathrooms: string;
  furnished: string;
  city: string;
  address: string;
  amenities: string[];
  image_urls: string[];
  project_age: number;
  payment_plan: string;
  sale_type: string;
  broker_id: string;
  created_at: string;
  admin_status: string;
}

export interface ListingData {
  listing: Listing;
  broker: Broker;
  company: Company;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    listings: ListingData[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    };
  };
}

// Formatted Data Interface for UI
export interface FormattedListing {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  type: string;
  details: string;
  company: string;
  price_range: string;
  location: string;
  // Additional fields from the API for the dialog
  title: string;
  description: string;
  image: string;
  min_price: number;
  max_price: number;
  sq_ft: number;
  category: string;
  looking_for: boolean;
  rental_frequency: string | null;
  no_of_bedrooms: string;
  no_of_bathrooms: string;
  furnished: string;
  city: string;
  address: string;
  amenities: string[];
  image_urls: string[];
  project_age: number;
  payment_plan: string;
  sale_type: string;
} 
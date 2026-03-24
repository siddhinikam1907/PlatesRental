export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const CUSTOMER_API = `${API_BASE_URL}/customer`;
export const RENTAL_API = `${API_BASE_URL}/rental`;
export const PLATE_API = `${API_BASE_URL}/plates`;
export const ADMIN_API_END_POINT = `${API_BASE_URL}/admin`;
export const DASHBOARD_API = `${API_BASE_URL}/dashboard`;
export const MESSAGE_API = `${API_BASE_URL}/message`;

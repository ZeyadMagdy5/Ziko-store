import { getUserKey } from './utils';

// Use environment variable for base URL, with valid fallback
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bags-shop.runasp.net';
export const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bags-shop.runasp.net';

// Debug logging to help identify configuration issues
console.log("API Configuration:", {
  BASE_URL,
  MODE: import.meta.env.MODE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
});

function getHeaders() {
  const token = getUserKey();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-user-key': token
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    console.error("API Error Response:", text);

    // Try to parse JSON error
    let errorMessage;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.title || `API request failed: ${response.status}`;
    } catch (e) {
      // If not JSON, use status
      errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    // If we get HTML (likely 404/SPA fallback) or plain text, throw a helpful error
    const text = await response.text();
    console.error("API Expected JSON but got:", contentType, text.substring(0, 100));
    throw new Error(`API Error: Expected JSON response but received ${contentType || 'unknown type'}. Path: ${response.url}`);
  }
}

export async function fetchUserProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/products?${query}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserCollections(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/collections?${query}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserDiscounts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/discounts?${query}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserProductById(id) {
  const response = await fetch(`${BASE_URL}/api/user/products/${id}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserCollectionById(id) {
  const response = await fetch(`${BASE_URL}/api/user/collections/${id}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserDiscountById(id) {
  const response = await fetch(`${BASE_URL}/api/user/discounts/${id}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export function resolveImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return "/images/bag-1.png"; // Fallback placeholder

  // Force HTTPS for any http URL (including Cloudinary)
  if (imagePath.startsWith('http:')) {
    return imagePath.replace('http:', 'https:');
  }

  if (imagePath.startsWith('https') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Remove leading slash if present 
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${IMAGE_BASE_URL}/${cleanPath}`;
}

export async function createUserOrder(orderData) {
  const userKey = getUserKey();
  const payload = {
    ...orderData, // Contains name, address, phone, items
    userkey: userKey // Ensure userkey is sent in body as per schema
  };

  const response = await fetch(`${BASE_URL}/api/user/orders`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function createUserPayment(paymentData) {
  const response = await fetch(`${BASE_URL}/api/user/payments`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
}

export async function fetchUserOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  // Headers now include Authorization/user-key so history should work
  const response = await fetch(`${BASE_URL}/api/user/orders?${query}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

export async function fetchUserOrderById(id) {
  const response = await fetch(`${BASE_URL}/api/user/orders/${id}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  return handleResponse(response);
}

// Direct API connection as requested
export const BASE_URL = 'https://bags-shop.runasp.net';
export const IMAGE_BASE_URL = 'https://bags-shop.runasp.net';
export const API_TOKEN = 'f9ps2BlK0h4QcY8r3uLDjkggwoJGamvWn';

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_TOKEN
  };
  return headers;
}


async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    console.error("API Error Response:", text);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchUserProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/products?${query}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchUserCollections(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/collections?${query}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchUserDiscounts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/api/user/discounts?${query}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchUserProductById(id) {
  const response = await fetch(`${BASE_URL}/api/user/products/${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchUserCollectionById(id) {
  const response = await fetch(`${BASE_URL}/api/user/collections/${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function fetchUserDiscountById(id) {
  const response = await fetch(`${BASE_URL}/api/user/discounts/${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}






export function resolveImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return "/images/bag-1.png"; // Fallback placeholder
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Remove leading slash if present 
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${IMAGE_BASE_URL}/${cleanPath}`;
}




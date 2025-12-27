// Direct API connection as requested, using relative path for proxy support
export const BASE_URL = 'https://bags-shop.runasp.net';
export const IMAGE_BASE_URL = 'https://bags-shop.runasp.net';


function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
  return response.json();
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
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Remove leading slash if present 
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${IMAGE_BASE_URL}/${cleanPath}`;
}



export async function createUserOrder(orderData) {
  const response = await fetch(`${BASE_URL}/api/user/orders`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(orderData)
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

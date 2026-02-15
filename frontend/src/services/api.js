const API_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Only add body if it exists and method is not GET
    if (options.body && options.method !== 'GET') {
      config.body = options.body;
    }

    console.log('Fetching:', url, config);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.log('API Error Response:', data);
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request('/products/featured');
  }

  async getProductsByCategory(category) {
    return this.request(`/products/category/${category}`);
  }

  async createProduct(data, token) {
    return this.request('/products', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id, data, token) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id, token) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async deleteProductImage(imageId, token) {
    return this.request(`/products/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Inquiries
  async createInquiry(data) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInquiries(token, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inquiries${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateInquiryStatus(id, status, token) {
    return this.request(`/inquiries/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  }

  // Seller Profile
  async getSellerProfile() {
    return this.request('/seller/profile');
  }

  async updateSellerProfile(data, token) {
    return this.request('/seller/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  // Admin
  async login(email, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async uploadProductImages(productId, files, token) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const url = `${this.baseUrl}/admin/products/${productId}/images`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  async deleteProductImage(imageId, token) {
    return this.request(`/admin/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateImageOrder(images, token) {
    return this.request('/admin/images/order', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ images }),
    });
  }
}

export const api = new ApiService();
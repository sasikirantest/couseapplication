// Enhanced API client with comprehensive error handling and retry logic
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: string;
  email: string;
  role: string;
  has_access: boolean;
  progress?: any;
  created_at: string;
  updated_at?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  order_num: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at?: string;
}

// Enhanced error class for better error handling
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function for API requests with comprehensive retry logic
async function apiRequest(endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[API] Request (attempt ${attempt}/${retries}): ${config.method || 'GET'} ${url}`);
      
      if (config.body) {
        console.log(`[API] Request body:`, JSON.parse(config.body as string));
      }
      
      const response = await fetch(url, config);
      
      console.log(`[API] Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (parseError) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
        } else {
          const errorText = await response.text();
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error(`[API] Error (${response.status}):`, errorData);
        
        const apiError = new APIError(
          errorData.error || `HTTP error! status: ${response.status}`,
          response.status,
          endpoint,
          errorData.details
        );
        
        // Don't retry on client errors (4xx), only on server errors (5xx) and network issues
        if (response.status >= 400 && response.status < 500) {
          throw apiError;
        }
        
        lastError = apiError;
        
        if (attempt === retries) {
          throw apiError;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000);
        console.log(`[API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      const data = await response.json();
      console.log(`[API] Success:`, data);
      return data;
      
    } catch (error: any) {
      console.error(`[API] Request failed (attempt ${attempt}/${retries}):`, error);
      lastError = error;
      
      // Don't retry on network errors if it's the last attempt
      if (attempt === retries) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError(
          'Failed to connect to backend server. Please ensure the backend is running.',
          0,
          endpoint,
          error
        );
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000);
      console.log(`[API] Network error, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new APIError('Unknown error occurred', 0, endpoint);
}

// ==================== USER OPERATIONS ====================

export async function createUser(uid: string, email: string, role: string = 'student'): Promise<User> {
  try {
    console.log(`[API] Creating user: ${email} (${uid})`);
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ id: uid, email, role }),
    });
  } catch (error) {
    console.error(`[API] Failed to create user:`, error);
    throw error;
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  try {
    console.log(`[API] Fetching user: ${uid}`);
    return await apiRequest(`/users/${uid}`);
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] User not found: ${uid}`);
      return null;
    }
    console.error(`[API] Failed to fetch user:`, error);
    throw error;
  }
}

export async function updateUserAccess(uid: string, hasAccess: boolean): Promise<User | null> {
  try {
    console.log(`[API] Updating user access: ${uid} -> ${hasAccess}`);
    return await apiRequest(`/users/${uid}/access`, {
      method: 'PATCH',
      body: JSON.stringify({ hasAccess }),
    });
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] User not found for access update: ${uid}`);
      return null;
    }
    console.error(`[API] Failed to update user access:`, error);
    throw error;
  }
}

export async function updateUserProgress(uid: string, progress: any): Promise<User | null> {
  try {
    console.log(`[API] Updating user progress: ${uid}`, progress);
    return await apiRequest(`/users/${uid}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] User not found for progress update: ${uid}`);
      return null;
    }
    console.error(`[API] Failed to update user progress:`, error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    console.log(`[API] Fetching all users`);
    return await apiRequest('/users');
  } catch (error) {
    console.error(`[API] Failed to fetch all users:`, error);
    throw error;
  }
}

// ==================== MODULE OPERATIONS ====================

export async function createModule(moduleData: any): Promise<Module> {
  try {
    console.log(`[API] Creating module:`, moduleData.title);
    return await apiRequest('/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  } catch (error) {
    console.error(`[API] Failed to create module:`, error);
    throw error;
  }
}

export async function getAllModules(): Promise<Module[]> {
  try {
    console.log(`[API] Fetching all modules`);
    return await apiRequest('/modules');
  } catch (error) {
    console.error(`[API] Failed to fetch all modules:`, error);
    throw error;
  }
}

export async function getPublishedModules(): Promise<Module[]> {
  try {
    console.log(`[API] Fetching published modules`);
    return await apiRequest('/modules/published');
  } catch (error) {
    console.error(`[API] Failed to fetch published modules:`, error);
    throw error;
  }
}

export async function updateModule(id: string, moduleData: any): Promise<Module | null> {
  try {
    console.log(`[API] Updating module: ${id}`);
    return await apiRequest(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] Module not found for update: ${id}`);
      return null;
    }
    console.error(`[API] Failed to update module:`, error);
    throw error;
  }
}

export async function deleteModule(id: string): Promise<Module | null> {
  try {
    console.log(`[API] Deleting module: ${id}`);
    return await apiRequest(`/modules/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] Module not found for deletion: ${id}`);
      return null;
    }
    console.error(`[API] Failed to delete module:`, error);
    throw error;
  }
}

// ==================== PAYMENT OPERATIONS ====================

export async function createPayment(userId: string, amount: number, status: string = 'pending'): Promise<Payment> {
  try {
    console.log(`[API] Creating payment: ${userId} -> ₹${amount}`);
    return await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, status }),
    });
  } catch (error) {
    console.error(`[API] Failed to create payment:`, error);
    throw error;
  }
}

export async function updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string): Promise<Payment | null> {
  try {
    console.log(`[API] Updating payment status: ${id} -> ${status}`);
    return await apiRequest(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, razorpayPaymentId }),
    });
  } catch (error: any) {
    if (error instanceof APIError && error.status === 404) {
      console.log(`[API] Payment not found for status update: ${id}`);
      return null;
    }
    console.error(`[API] Failed to update payment status:`, error);
    throw error;
  }
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  try {
    console.log(`[API] Fetching user payments: ${userId}`);
    return await apiRequest(`/payments/user/${userId}`);
  } catch (error) {
    console.error(`[API] Failed to fetch user payments:`, error);
    throw error;
  }
}

export async function getAllPayments(): Promise<Payment[]> {
  try {
    console.log(`[API] Fetching all payments`);
    return await apiRequest('/payments');
  } catch (error) {
    console.error(`[API] Failed to fetch all payments:`, error);
    throw error;
  }
}

// ==================== HEALTH CHECK ====================

export async function checkHealth(): Promise<any> {
  try {
    console.log(`[API] Checking backend health`);
    return await apiRequest('/health');
  } catch (error) {
    console.error(`[API] Health check failed:`, error);
    throw error;
  }
}
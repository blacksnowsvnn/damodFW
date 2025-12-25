const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || '/backend';
  // Đảm bảo luôn có /api/v1 ở cuối và không bị lặp lại
  const base = envUrl.replace(/\/$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Nếu không có Content-Type và body không phải FormData, mặc định là application/json
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Thêm Authorization token nếu có
  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Nếu không phải JSON, lấy text
      const text = await response.text().catch(() => '');
      throw new Error(text || `Lỗi hệ thống (${response.status})`);
    }

    let errorMessage = 'Có lỗi xảy ra';
    
    if (errorData.detail) {
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Xử lý lỗi validation từ FastAPI (Pydantic)
        errorMessage = errorData.detail
          .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
      } else if (typeof errorData.detail === 'object') {
        errorMessage = JSON.stringify(errorData.detail);
      }
    }
    
    // Nếu gặp lỗi xác thực hoặc không tìm thấy user (có thể do DB reset), xóa token
    if (response.status === 401 || (response.status === 404 && errorMessage === 'User not found')) {
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/install')) {
        window.location.href = '/login';
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    window.dispatchEvent(new Event('storage'));
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('storage'));
  }
}

import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Authenticate user with credentials
   */
  async login({ email, password, rememberMe }) {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    return response.data;
  },

  /**
   * Get authenticated user profile via protected endpoint
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authService;


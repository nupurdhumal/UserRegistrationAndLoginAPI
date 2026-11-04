import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if directed with a registration success message
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear location state to prevent re-showing on page reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!emailRegex.test(value.trim())) return 'Please enter a valid corporate email address';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (apiError) setApiError(null);

    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Redirect to target path or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <ShieldCheck size={22} />
        </div>
        <span className="auth-brand-name">PulseAuth</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">
            Welcome back! Please enter your corporate credentials to continue.
          </p>
        </div>

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
            style={{ marginBottom: '20px' }}
          />
        )}

        {apiError && (
          <Alert
            type="error"
            message={apiError}
            onClose={() => setApiError(null)}
            style={{ marginBottom: '20px' }}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="sarah.jenkins@company.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            required
            disabled={isSubmitting}
            icon={Mail}
            autoComplete="email"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            required
            disabled={isSubmitting}
            icon={Lock}
            autoComplete="current-password"
          />

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>Remember me for 7 days</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account yet? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


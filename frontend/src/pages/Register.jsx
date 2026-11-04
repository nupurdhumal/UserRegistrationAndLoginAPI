import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = (field, value, allValues = formData) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (value.trim().length > 60) return 'Full name cannot exceed 60 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!emailRegex.test(value.trim())) return 'Please enter a valid corporate email address';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allValues.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (apiError) setApiError(null);

    // Validate on change if field has already been touched
    if (touched[name]) {
      const error = validateField(name, value, newFormData);
      setErrors((prev) => ({ ...prev, [name]: error }));

      // Also re-validate confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword) {
        const confirmErr = validateField('confirmPassword', newFormData.confirmPassword, newFormData);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Check all fields for submission
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field], formData);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      // Redirect to login with flash success message
      navigate('/login', {
        replace: true,
        state: {
          successMessage: res.message || 'Account successfully created. Please sign in to continue.'
        }
      });
    } catch (err) {
      setApiError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password requirements state
  const isMinLength = formData.password.length >= 8;
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Enter your professional details to establish your enterprise credentials.
          </p>
        </div>

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
            label="Full Name"
            name="name"
            placeholder="e.g. Sarah Jenkins"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ''}
            required
            disabled={isSubmitting}
            icon={User}
            autoComplete="name"
          />

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
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            required
            disabled={isSubmitting}
            icon={Lock}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            required
            disabled={isSubmitting}
            icon={Lock}
            autoComplete="new-password"
          />

          {/* Real-time Password Requirements Checklist */}
          {formData.password && (
            <div className="password-requirements" aria-live="polite">
              <div className={`requirement-item ${isMinLength ? 'met' : ''}`}>
                <Check size={14} color={isMinLength ? '#079455' : '#98A2B3'} />
                <span>Minimum 8 characters length</span>
              </div>
              {formData.confirmPassword && (
                <div className={`requirement-item ${passwordsMatch ? 'met' : ''}`}>
                  <Check size={14} color={passwordsMatch ? '#079455' : '#98A2B3'} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="alert-icon" size={18} />;
      case 'warning':
        return <AlertTriangle className="alert-icon" size={18} />;
      case 'error':
      default:
        return <AlertCircle className="alert-icon" size={18} />;
    }
  };

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      {renderIcon()}
      <div className="alert-content">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;


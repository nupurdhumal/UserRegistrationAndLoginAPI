import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="auth-brand-logo" style={{ width: '32px', height: '32px' }}>
          <ShieldCheck size={20} />
        </div>
        <span className="navbar-brand-name">PulseAuth</span>
      </div>

      <div className="navbar-actions">
        {user && (
          <div className="user-badge">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <span className="user-display-name">{user.name}</span>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="navbar-logout-btn"
          title="Sign out of your session"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;


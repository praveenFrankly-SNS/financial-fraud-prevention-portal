import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, CreditCard, Send, List, Users, Settings,
  HelpCircle, FlaskConical, Shield
} from 'lucide-react';
import { NOTIFICATIONS } from '../data/transactions';

const unread = NOTIFICATIONS.filter(n => !n.read).length;

const NAV_MAIN = [
  { to: '/',             icon: Home,       label: 'Home' },
  { to: '/pay',          icon: CreditCard, label: 'Make Payment' },
  { to: '/send',         icon: Send,       label: 'Send Money' },
  { to: '/transactions', icon: List,       label: 'Transactions', badge: 0 },
  { to: '/simulation',   icon: FlaskConical, label: 'Simulation Mode' },
];

const NAV_OTHER = [
  { to: '/help',     icon: HelpCircle, label: 'Help & Support' },
  { to: '/settings', icon: Settings,   label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Shield size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-brand-name">Bank Portal</div>
          <div className="sidebar-brand-sub">Savings •••• 4821</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label">Main</div>
          {NAV_MAIN.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon size={17} />
              {label}
              {badge != null && badge > 0 && (
                <span className="sidebar-badge">{badge}</span>
              )}
              {badge == null && unread > 0 && label === 'Notifications' && (
                <span className="sidebar-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label">Support</div>
          {NAV_OTHER.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Security card */}
      <div className="sidebar-security-card">
        <div className="sidebar-security-card-icon">
          <Shield size={14} color="#60a5fa" />
        </div>
        <h4>Bank with confidence</h4>
        <p>Every transaction is monitored for your safety, 24/7.</p>
        <a href="#">Learn more →</a>
      </div>

      {/* Dev mode button */}
      <button
        className="sidebar-dev-mode-btn"
        onClick={() => navigate('/simulation')}
        title="Ctrl+Shift+D"
      >
        <FlaskConical size={15} />
        Developer Mode
      </button>
    </aside>
  );
}

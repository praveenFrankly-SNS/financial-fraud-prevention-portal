import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { NOTIFICATIONS } from '../data/transactions';

const BREADCRUMBS: Record<string, string[]> = {
  '/':            [],
  '/pay':         ['Payments', 'Make a Payment'],
  '/send':        ['Payments', 'Send Money'],
  '/transactions':['Transactions'],
  '/beneficiaries':['Beneficiaries'],
  '/simulation':  ['Settings', 'Developer Mode'],
  '/help':        ['Help & Support'],
  '/settings':    ['Settings'],
  '/processing':  ['Payments', 'Processing'],
};

const unread = NOTIFICATIONS.filter(n => !n.read).length;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = BREADCRUMBS[location.pathname] ?? [];

  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="header-breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <span className="header-breadcrumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'header-breadcrumb-current' : ''}>
              {c}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-icon-btn" title="Search">
          <Search size={17} />
        </button>

        <button className="header-icon-btn" title="Notifications">
          <Bell size={17} />
          {unread > 0 && <span className="header-notif-dot" />}
        </button>

        <button
          className="header-profile"
          onClick={() => navigate('/settings')}
        >
          <div className="header-avatar">PK</div>
          <span className="header-profile-name">Praveen Kumar</span>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </header>
  );
}

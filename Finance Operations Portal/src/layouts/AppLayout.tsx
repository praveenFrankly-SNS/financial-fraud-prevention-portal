import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, ShieldAlert, Users, Search,
  BarChart3, Activity, Bell, Settings, FileText, ChevronLeft,
  ChevronRight, HelpCircle,
} from 'lucide-react';

const navItems = [
  { section: 'OVERVIEW', items: [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
  ]},
  { section: 'OPERATIONS', items: [
    { to: '/transactions', icon: CreditCard, label: 'Transaction Operations' },
    { to: '/rule-violations', icon: ShieldAlert, label: 'Rule Violations' },
    { to: '/hitl-queue', icon: Users, label: 'HITL Review Queue', badge: 24 },
  ]},
  { section: 'INVESTIGATION', items: [
    { to: '/investigation/TX-5843', icon: Search, label: 'Investigations' },
  ]},
  { section: 'ANALYTICS', items: [
    { to: '/analytics', icon: BarChart3, label: 'Fraud Analytics' },
  ]},
];

const bottomItems = [
  { to: '/system-health', icon: Activity, label: 'System Health' },
  { to: '/alerts', icon: Bell, label: 'Alerts & Notifications' },
  { to: '/audit', icon: FileText, label: 'Audit Trail' },
  { to: '/config', icon: Settings, label: 'Configuration' },
];

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/transactions': 'Transaction Operations',
  '/rule-violations': 'Rule Violations',
  '/hitl-queue': 'HITL Review Queue',
  '/analytics': 'Fraud Analytics',
};

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Finance Operations Portal';

  const isInvestigation = location.pathname.startsWith('/investigation');

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🧠</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h2>Finance Ops Portal</h2>
              <span>Fraud Prevention</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              {!collapsed && <div className="sidebar-section-label">{section}</div>}
              {items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive || (isInvestigation && label === 'Investigations') ? 'active' : ''}`
                  }
                >
                  <Icon className="nav-icon" size={16} />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && badge && (
                    <span className="sidebar-nav-badge">{badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          <hr className="sidebar-divider" />

          {bottomItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="nav-icon" size={16} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <div className="sidebar-user" style={{ marginTop: 8 }}>
              <div className="sidebar-user-avatar">AD</div>
              <div className="sidebar-user-info">
                <h4>Ananya Davis</h4>
                <span>Fraud Analyst</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="app-header">
          <div className="header-breadcrumb">
            <span>Finance Ops Portal</span>
            {pageTitle !== 'Overview' && (
              <>
                <span style={{ color: 'var(--color-border)' }}>/</span>
                <span className="current">{pageTitle}</span>
              </>
            )}
          </div>

          <div className="header-right">
            {/* Notifications */}
            <button className="notification-btn">
              <Bell size={16} />
              <span className="notification-count">12</span>
            </button>

            {/* Help */}
            <button className="notification-btn">
              <HelpCircle size={16} />
            </button>

            {/* Avatar */}
            <div className="header-avatar">AD</div>
          </div>
        </header>

        {/* Content */}
        <main className="app-content">
          <Outlet />
        </main>

        {/* Status bar */}
        <div className="status-bar">
          <div className="status-bar-left">
            <span className="live-dot" style={{ width: 6, height: 6, background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }} />
            All Systems Operational
          </div>
          <span>Last updated: 10:42:31 AM</span>
          <span>© 2025 Finance Ops Portal &nbsp; v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

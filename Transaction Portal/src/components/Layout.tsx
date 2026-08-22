import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Layout({ children, fullWidth = false }: Props) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content" style={fullWidth ? { maxWidth: '100%' } : undefined}>
          {children}
        </main>
      </div>
    </div>
  );
}

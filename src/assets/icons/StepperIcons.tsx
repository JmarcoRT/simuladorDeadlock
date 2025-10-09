import React from 'react';

export const IcResources: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="8" height="6" rx="1.5" stroke="currentColor" />
    <rect x="13" y="4" width="8" height="6" rx="1.5" stroke="currentColor" />
    <rect x="3" y="14" width="8" height="6" rx="1.5" stroke="currentColor" />
    <path d="M13 17h8" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

export const IcEye: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" />
  </svg>
);

export const IcGear: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="currentColor"/>
    <path d="M4 12h2m12 0h2M12 4v2m0 12v2M6.2 6.2l1.4 1.4m8.8 8.8 1.4 1.4m0-11.6-1.4 1.4M7.6 16.4 6.2 17.8" stroke="currentColor"/>
  </svg>
);

export const IcCheckView: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
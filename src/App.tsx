import React from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/AppRouter';

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
export default App;
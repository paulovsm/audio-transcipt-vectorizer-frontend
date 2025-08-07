import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainDashboard } from './components/MainDashboard';
import './index.css';

// Criar uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainDashboard />
    </QueryClientProvider>
  );
}

export default App;

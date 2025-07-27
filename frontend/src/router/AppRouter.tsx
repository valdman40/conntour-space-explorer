import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SearchPage, HistoryPage, HistoryDetailPage } from '../pages';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Default route redirects to search */}
          <Route path="/" element={<Navigate to="/search" replace />} />
          
          {/* Search page route */}
          <Route path="/search" element={<SearchPage />} />
    
          
          {/* History routes */}
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:historyId" element={<HistoryDetailPage />} />
          
          {/* Catch all route - redirect to search */}
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

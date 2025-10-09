import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { Step1Define } from '../features/simulator/pages/Step1Define';
import { Step2Visualize } from '../features/simulator/pages/Step2Visualize';
import { Step3Algorithm } from '../features/simulator/pages/Step3Algorithm';
import { Step4Solution } from '../features/simulator/pages/Step4Solution';
import { HelpPage } from '../pages/HelpPage';

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/step/1" replace />} />
        <Route path="step/1" element={<Step1Define />} />
        <Route path="step/2" element={<Step2Visualize />} />
        <Route path="step/3" element={<Step3Algorithm />} />
        <Route path="step/4" element={<Step4Solution />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
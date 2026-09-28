import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import GenerationPage from './pages/GenerationPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<GenerationPage />} />
          <Route path="editor" element={<EditorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

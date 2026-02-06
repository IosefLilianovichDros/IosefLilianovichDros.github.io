import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import About from './pages/About';
import Tags from './pages/Tags';
import Portfolio from './pages/Portfolio';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
};

export default App;
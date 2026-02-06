import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';
import { getAllPosts, PostContent } from '../services/markdownService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [posts, setPosts] = useState<PostContent[]>([]);

  useEffect(() => {
    getAllPosts().then(setPosts);
    // 确保页面始终处于浅色模式
    document.documentElement.classList.remove('dark');
  }, []);

  const navLinks = [
    { path: '/', label: '日志' },
    { path: '/tags', label: '分类' },
    { path: '/portfolio', label: '持仓' },
    { path: '/about', label: '关于' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 md:py-20 relative">
        <header className="mb-20 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link to="/" className="text-xl font-serif font-bold tracking-tighter hover:opacity-50 transition-opacity">
            Minimal.Log
          </Link>
          <nav className="flex items-center space-x-6 md:space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={`text-[11px] tracking-[0.2em] uppercase transition-colors ${
                  location.pathname === link.path ? 'text-black font-bold' : 'text-zinc-300 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <main>{children}</main>

        <footer className="mt-32 pt-10 border-t border-zinc-100 text-[10px] tracking-[0.3em] text-zinc-300 uppercase font-mono text-center">
          &copy; {new Date().getFullYear()}
        </footer>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="fixed bottom-8 right-8 w-12 h-12 flex items-center justify-center bg-black text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Search size={18} />
        </button>

        {isSearchOpen && <SearchModal posts={posts} onClose={() => setIsSearchOpen(false)} />}
      </div>
    </div>
  );
};

export default Layout;
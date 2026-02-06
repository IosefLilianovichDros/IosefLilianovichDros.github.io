import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Tag, BookOpen } from 'lucide-react';
import { PostContent } from '../services/markdownService';

interface SearchModalProps {
  posts: PostContent[];
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ posts, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredPosts = query.trim() === '' 
    ? [] 
    : posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-4 border-b border-zinc-200">
          <Search className="text-zinc-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文章标题、内容、标签..."
            className="flex-grow bg-transparent outline-none text-zinc-800 placeholder-zinc-400 text-lg"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-12 text-center text-zinc-400 space-y-2">
              <Search className="mx-auto opacity-20" size={48} />
              <p className="font-serif italic">输入关键字开始全局深度搜索</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {filteredPosts.map(post => {
                const inContent = post.content.toLowerCase().includes(query.toLowerCase()) && 
                                 !post.title.toLowerCase().includes(query.toLowerCase()) &&
                                 !post.description.toLowerCase().includes(query.toLowerCase());
                return (
                  <Link
                    key={post.id}
                    to={`/article/${post.id}`}
                    onClick={onClose}
                    className="block p-5 hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-serif font-bold text-zinc-800 group-hover:text-black leading-tight">
                        {post.title}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest shrink-0 ml-4">
                        {post.date}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    {inContent && (
                      <div className="mt-2 text-xs text-zinc-400 italic flex items-center">
                        <BookOpen size={12} className="mr-1" /> 内容中包含匹配项
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[9px] font-mono text-zinc-300 uppercase tracking-widest">
                      {post.tags.map(tag => (
                        <span key={tag} className="flex items-center"><Tag size={10} className="mr-1" />{tag}</span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-400">
              <p className="font-serif italic">没有找到匹配的文章 "{query}"</p>
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

export default SearchModal;

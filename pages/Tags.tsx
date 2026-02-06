import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAllPosts, PostMetadata } from '../services/markdownService';
import { Hash } from 'lucide-react';

const Tags: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const allTags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagsMap).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(post => post.tags.includes(activeTag));
  }, [activeTag, posts]);

  if (loading) return <div className="py-24 text-center font-serif italic text-zinc-400">Loading...</div>;

  return (
    <div className="space-y-16 animate-page">
      <header className="space-y-4">
        <h1 className="text-3xl font-serif font-bold">分类索引</h1>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/tags"
            className={`px-3 py-1 text-xs font-mono border transition-all ${
              !activeTag ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
            }`}
          >
            ALL ({posts.length})
          </Link>
          {allTags.map(([tag, count]) => (
            <Link
              key={tag}
              to={`/tags?tag=${tag}`}
              className={`px-3 py-1 text-xs font-mono border transition-all flex items-center ${
                activeTag === tag ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
              }`}
            >
              <Hash size={10} className="mr-1" /> {tag.toUpperCase()} ({count})
            </Link>
          ))}
        </div>
      </header>

      <div className="space-y-12 pt-8 border-t border-zinc-50">
        {filteredPosts.map(post => (
          <div key={post.id} className="group flex flex-col md:flex-row md:items-baseline">
            <span className="text-[10px] font-mono text-zinc-300 w-32 shrink-0 mb-1 md:mb-0">
              {post.date}
            </span>
            <div className="flex flex-col">
              <Link 
                to={`/article/${post.id}`}
                className="text-lg font-serif border-b border-transparent group-hover:border-zinc-200 transition-all font-bold"
              >
                {post.title}
              </Link>
              <div className="flex gap-2 mt-1">
                {post.tags.map(t => <span key={t} className="text-[9px] text-zinc-400">#{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tags;
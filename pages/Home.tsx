import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, PostContent } from '../services/markdownService';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<PostContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-16 py-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-50 w-2/3 rounded-sm" />
            <div className="h-4 bg-zinc-50 w-full rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-page">
      <div className="space-y-20 md:space-y-24">
        {posts.map(post => (
          <article key={post.id} className="group">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight leading-tight flex-1">
                  <Link 
                    to={`/article/${post.id}`} 
                    className="hover:text-zinc-400 transition-colors duration-500 ease-in-out underline-offset-[12px] decoration-zinc-100 group-hover:underline"
                  >
                    {post.title}
                  </Link>
                </h2>
                <time className="text-[10px] font-mono text-zinc-300 uppercase tracking-[0.3em] shrink-0">
                  {post.date}
                </time>
              </div>
              <p className="text-zinc-500 font-light leading-relaxed max-w-2xl text-base md:text-lg">
                {post.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-mono text-zinc-300 uppercase tracking-widest pt-1">
                <span className="text-zinc-400 font-medium">{post.readingTime}</span>
                <span className="text-zinc-100">/</span>
                <div className="flex gap-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="hover:text-black transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { fetchPostContent, PostContent } from '../services/markdownService';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPostContent(id).then(data => {
      setPost(data);
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [id]);

  if (loading) return <div className="py-24 text-center font-mono text-[10px] text-zinc-300 tracking-[0.3em]">LOADING...</div>;
  if (!post || post.id === '404') return <div className="py-32 text-center"><Link to="/" className="text-[10px] border-b border-black pb-1 uppercase tracking-widest">404 / Back to Index</Link></div>;

  return (
    <article className="animate-page relative">
      <header className="mb-12 pb-10 border-b border-zinc-50">
        <h1 className="text-3xl md:text-4xl font-serif font-bold leading-snug mb-6 tracking-tight text-black">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-zinc-500 text-base md:text-lg leading-relaxed border-l border-zinc-200 pl-6 py-1 italic font-light">
            {post.description}
          </p>
        )}
        <div className="mt-8 flex items-center gap-4 text-[10px] font-mono text-zinc-300 uppercase tracking-[0.2em]">
          <time>{post.date}</time>
          <span>/</span>
          <span>{post.readingTime}</span>
        </div>
      </header>

      <div className="prose prose-zinc max-w-none 
        prose-headings:text-black prose-headings:font-serif prose-headings:tracking-tight
        prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6 prose-h1:font-bold
        prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-bold
        prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-bold
        prose-p:text-zinc-800 prose-p:leading-relaxed prose-p:text-[17px]
        prose-blockquote:border-l-zinc-200 prose-blockquote:italic prose-blockquote:text-zinc-500
        prose-code:text-black prose-code:font-mono prose-code:bg-zinc-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-img:rounded-lg prose-img:shadow-sm
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-24 pt-10 border-t border-zinc-100 flex justify-between items-center">
        <Link to="/" className="text-[11px] tracking-[0.1em] font-medium text-zinc-400 hover:text-black transition-colors flex items-center gap-1">
          ⬅ 返回主页
        </Link>
        <button 
          onClick={() => window.scrollTo({top:0, behavior:'smooth'})} 
          className="text-[11px] tracking-[0.1em] font-medium text-zinc-400 hover:text-black transition-colors flex items-center gap-1"
        >
          ⬆ 回到顶部
        </button>
      </footer>
    </article>
  );
};

export default Article;
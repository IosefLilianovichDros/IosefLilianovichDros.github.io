import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { fetchPostContent, PostContent } from '../services/markdownService';

const About: React.FC = () => {
  const [post, setPost] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostContent('about').then(data => {
      setPost(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="py-24 text-center font-mono text-[10px] text-zinc-300 tracking-[0.3em]">
      LOADING...
    </div>
  );

  return (
    <div className="animate-page">
      <div className="prose prose-zinc max-w-none 
        prose-headings:text-black prose-headings:font-bold
        prose-p:text-zinc-800 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-[17px]
        prose-blockquote:border-l-zinc-100 prose-blockquote:italic prose-blockquote:text-zinc-500
        prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
        prose-code:text-black prose-code:font-mono prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      ">
        {post && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default About;
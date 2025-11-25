'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Markdown Renderer Component
 * Renders markdown content with beautiful, consistent styling.
 * 
 * Why this exists: Single source of truth for markdown rendering across the app.
 * Backend returns markdown, frontend renders it beautifully.
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-zinc max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headers with Manjha styling
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-[#18181b] border-b-4 border-black pb-2 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-[#18181b] border-b-2 border-[#d4d4d8] pb-1 mb-3 mt-6">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-[#27272a] mb-2 mt-4">
            {children}
          </h3>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="text-[#3f3f46] leading-relaxed mb-4">
            {children}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-4 text-[#3f3f46]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-4 text-[#3f3f46]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-[#3f3f46]">{children}</li>
        ),

        // Code blocks - styled boxes
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-[#f4f4f5] text-[#18181b] px-1.5 py-0.5 rounded text-sm font-mono border border-[#e4e4e7]">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-[#18181b] text-[#e4e4e7] p-4 rounded-lg text-sm font-mono overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-4">{children}</pre>
        ),

        // Tables - Manjha style
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#18181b] text-white">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-white">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-[#e4e4e7]">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left font-semibold text-sm">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-[#3f3f46]">{children}</td>
        ),

        // Blockquotes - Key insights style
        blockquote: ({ children }) => (
          <blockquote className="bg-[#d4c4e1]/30 border-l-4 border-[#d4c4e1] rounded-r-lg p-4 my-4 text-[#27272a]">
            {children}
          </blockquote>
        ),

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-bold text-[#18181b]">{children}</strong>
        ),

        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-[#387ED1] hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="border-t-2 border-[#d4d4d8] my-6" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}


"use client";

import { marked } from "marked";
import { useEffect, useState } from "react";

interface PreviewProps {
  content: string;
}

export default function Preview({ content }: PreviewProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    // Parse markdown to HTML
    const parseMarkdown = async () => {
      const parsed = await marked.parse(content);
      setHtml(parsed);
    };

    parseMarkdown();
  }, [content]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-white">
        {content ? (
          <div
            className="prose prose-sm max-w-none text-black
              prose-headings:font-bold prose-headings:text-black
              prose-h1:text-3xl prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
              prose-p:text-black prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-black
              prose-pre:bg-gray-900 prose-pre:text-gray-100
              prose-ul:list-disc prose-ul:ml-6
              prose-ol:list-decimal prose-ol:ml-6
              prose-li:text-black
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-black
              prose-img:rounded-lg prose-img:shadow-md
              prose-table:border-collapse
              prose-th:bg-gray-100 prose-th:p-2 prose-th:border prose-th:border-gray-300 prose-th:text-black
              prose-td:p-2 prose-td:border prose-td:border-gray-300 prose-td:text-black
              prose-strong:text-black
              [&_*]:text-black [&_a]:text-blue-600 [&_pre]:text-gray-100"
            style={{ color: "#000000" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Preview will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
}

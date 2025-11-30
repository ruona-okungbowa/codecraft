"use client";

interface SimplePreviewProps {
  content: string;
}

export default function SimplePreview({ content }: SimplePreviewProps) {
  if (!content) {
    return (
      <div className="text-gray-400 text-center py-8">
        <p className="text-lg mb-2">No content yet</p>
        <p className="text-sm">
          Click &quot;Generate README&quot; to create your documentation
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm prose-slate max-w-none">
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto whitespace-pre-wrap text-xs">
        <code>{content}</code>
      </pre>
    </div>
  );
}

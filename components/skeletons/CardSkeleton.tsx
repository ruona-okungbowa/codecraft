export default function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

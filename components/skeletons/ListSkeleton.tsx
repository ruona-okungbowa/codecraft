export default function ListSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

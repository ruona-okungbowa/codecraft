export const ProjectCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="flex items-center justify-between border-y border-gray-200 py-3 my-3">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
      <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

export const DashboardScoreSkeleton = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm animate-pulse">
    <div className="flex items-center gap-8">
      <div className="w-48 h-48 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

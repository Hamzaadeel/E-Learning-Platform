export function Loader() {
  return (
    <div className="text-center py-12">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white"></div>
        </div>
      </div>
      <p className="mt-4 text-gray-600 text-lg font-medium">Loading...</p>
    </div>
  );
}

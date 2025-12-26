export default function UserLoading() {
  return (
    <main className="p-6">
      <div className="animate-pulse space-y-4 max-w-md">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </main>
  );
}
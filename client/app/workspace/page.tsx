export default function WorkspacePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold mb-2 text-slate-800">Welcome to Nigris Workspace</h2>
        <p className="text-slate-500 text-sm mb-6">
          Select a collection from the sidebar to view its database, or create a new collection to get started.
        </p>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-ci-blue flex items-center justify-center z-50">
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-white rounded-full bounce-dot-1" />
        <div className="w-5 h-5 bg-white rounded-full bounce-dot-2" />
        <div className="w-5 h-5 bg-white rounded-full bounce-dot-3" />
      </div>
    </div>
  );
}

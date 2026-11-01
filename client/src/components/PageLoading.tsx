export function PageLoading({ label = '加载中…' }: { label?: string }) {
  return (
    <div className="container-page flex flex-col items-center justify-center gap-3 py-24 text-sm text-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-accent" />
      {label}
    </div>
  );
}

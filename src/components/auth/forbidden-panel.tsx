type ForbiddenPanelProps = {
  title?: string;
  message?: string;
};

export function ForbiddenPanel({
  title = "Access denied",
  message = "You do not have permission to view this page.",
}: ForbiddenPanelProps) {
  return (
    <div className="larssh-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="larssh-card max-w-lg rounded-2xl p-8">
        <p className="text-gold text-sm font-medium tracking-wide uppercase">
          403 Unauthorized
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

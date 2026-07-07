export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08),transparent_55%)] p-6 dark:bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_55%)]">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

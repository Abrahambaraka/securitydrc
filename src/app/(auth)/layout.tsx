export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-foreground p-4">
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}

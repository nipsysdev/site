interface StaticOutputProps {
  children: React.ReactNode;
}

export default function StaticOutput({ children }: StaticOutputProps) {
  return (
    <div aria-hidden="true" className="sr-only">
      {children}
    </div>
  );
}

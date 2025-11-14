// src/components/ui/card.tsx
export function Card({ children, className }: any) {
  return (
    <div className={`rounded-xl shadow bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }: any) {
  return <div>{children}</div>;
}

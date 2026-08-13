import React from 'react';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 flex flex-col relative w-full max-w-md mx-auto bg-emerald-900 shadow-2xl overflow-x-hidden min-h-screen border-x border-emerald-800/20">
      {children}
    </div>
  );
}

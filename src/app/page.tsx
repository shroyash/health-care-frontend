// app/page.tsx
'use client';

export default function Home() {
  // Remove the useEffect redirect entirely
  // Let middleware handle the redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
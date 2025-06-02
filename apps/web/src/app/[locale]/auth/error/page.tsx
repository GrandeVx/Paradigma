// Per mostrare eventuali errori durante il processo

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-2 text-gray-600">An error occurred during authentication.</p>
      </div>
    </div>
  );
}

export default function EmailConfirmed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Email Confermata con Successo!
        </h1>
        <p className="mt-4 text-gray-600">
          Grazie per aver verificato il tuo indirizzo email. Ora puoi accedere
          all'app con le tue credenziali.
        </p>
      </div>
    </div>
  );
}

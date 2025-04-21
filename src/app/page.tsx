'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a TimeTracker</h1>
        <p className="text-xl">
          Sistema de seguimiento de tiempo para empleados
        </p>
        <div className="mt-8">
          <a href="/auth/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </main>
  );
}

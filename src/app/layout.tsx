export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>TimeTracker - MAGNETIC PLACE</title>
        <meta name="description" content="Aplicación de seguimiento de tiempo para MAGNETIC PLACE" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">TimeTracker</h1>
                <span className="ml-2 text-sm bg-blue-500 px-2 py-1 rounded">MAGNETIC PLACE</span>
              </div>
              <nav>
                <ul className="flex space-x-6">
                  <li><a href="/" className="hover:underline">Inicio</a></li>
                  <li><a href="/admin/employees" className="hover:underline">Empleados</a></li>
                  <li><a href="/reports" className="hover:underline">Informes</a></li>
                </ul>
              </nav>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-gray-100 border-t">
            <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
              &copy; {new Date() .getFullYear()} TimeTracker - MAGNETIC PLACE. Todos los derechos reservados.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define las rutas válidas en tu aplicación
const validRoutes = ["/", "/app"]; // Agrega aquí todas las rutas que existen en tu aplicación

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica si la ruta solicitada es válida
  if (!validRoutes.includes(pathname)) {
    // Redirige a la página principal si la ruta no es válida
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Permite que la solicitud continúe si la ruta es válida
  return NextResponse.next();
}

// Configura el middleware para que se ejecute en todas las rutas
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
import { NextRequest, NextResponse } from 'next/server';

// Rotas que não requerem autenticação
const PUBLIC_ROUTES = ['/login', '/'];

// Rotas que requerem autenticação
const PROTECTED_ROUTES = ['/agenda', '/pacientes', '/laudos', '/relatorios', '/medicos'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verifica se a rota é pública
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Verifica se a rota é protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Verifica se o usuário tem o token de autenticação
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      // Redireciona para login se não houver token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

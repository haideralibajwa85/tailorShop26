import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

const ROUTE_ROLE_MAP: Record<string, Array<'superadmin' | 'admin' | 'tailor' | 'customer'>> = {
  '/customer': ['customer'],
  '/tailor': ['tailor'],
  '/admin': ['admin'],
  '/superadmin': ['superadmin'],
};

const matchRoute = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.delete(name)
          response.cookies.delete(name)
        },
      },
    },
  );

  const authResult = await supabase.auth.getSession();
  const { session } = authResult.data;

  const { pathname } = request.nextUrl;

  console.log('Session from getSession():', session);
  console.log('Session user ID:', session?.user?.id);
  console.log('Session user email:', session?.user?.email);
  
  if (session) {
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);
  }

  // Simple check: if no session and not public route, redirect to login
  if (!session && !PUBLIC_ROUTES.some((route) => matchRoute(pathname, route))) {
    console.log('No session - redirecting to login');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists and trying to access auth pages, redirect to dashboard
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    console.log('Session exists on auth page - redirecting to dashboard');
    return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
  }

  console.log('Middleware: allowing access');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


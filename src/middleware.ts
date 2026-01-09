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
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Check for standard name and the alternative name provided by the user
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Middleware: Supabase environment variables are missing. Mismatch?');
      return response;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      },
    );

    // Use getUser() for better security than getSession()
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Middleware Error during getUser:', error.message);
    }

    const { pathname } = request.nextUrl;

    // Simple check: if no user and not public route, redirect to login
    if (!user && !PUBLIC_ROUTES.some((route) => matchRoute(pathname, route))) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user exists and trying to access auth pages, redirect to dashboard
    if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (e: any) {
    console.error('Middleware Critical Failure:', e.message);
    return response; // Fail open to avoid blocking all traffic if middleware crashes
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


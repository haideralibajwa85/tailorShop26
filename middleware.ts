import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

const ROUTE_ROLE_MAP: Record<string, Array<'superadmin' | 'admin' | 'tailor' | 'customer' | 'stitcher'>> = {
  '/customer': ['customer'],
  '/tailor': ['tailor'],
  '/stitcher': ['stitcher'],
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
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as any);
          });
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  console.log('Middleware - Path:', pathname);

  if (PUBLIC_ROUTES.some((route) => matchRoute(pathname, route))) {
    console.log('Middleware - Public route, allowing access');
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('Middleware - User:', user ? 'exists' : 'none');
  if (user) {
    console.log('Middleware - User ID:', user.id);
    console.log('Middleware - User Email:', user.email);
  }

  if (!user) {
    console.log('Middleware - Redirecting to login (no user)');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const routeEntry = Object.entries(ROUTE_ROLE_MAP).find(([prefix]) => matchRoute(pathname, prefix));

  if (!routeEntry) {
    console.log('Middleware - No route entry found, allowing access');
    return response;
  }

  const [, allowedRoles] = routeEntry;
  console.log('Middleware - Allowed roles for this route:', allowedRoles);

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Middleware - User profile from DB:', profile);

  if (!profile?.role || !allowedRoles.includes(profile.role as typeof allowedRoles[number])) {
    console.log('Middleware - Access denied, redirecting to home');
    console.log('Middleware - Profile role:', profile?.role);
    console.log('Middleware - Allowed roles:', allowedRoles);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('Middleware - Access granted');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
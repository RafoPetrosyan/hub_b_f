import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET as string;

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/sign-up'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isSignUpStep = pathname.startsWith('/sign-up/step-');

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 🔐 If it's a sign-up step → require token with accessToken
  if (isSignUpStep) {
    const token = await getToken({ req, secret });

    if (!token || !(token as any).accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  }

  // Allow other public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 🔐 All other routes → require login
  const token = await getToken({ req, secret });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userData = (token as any).userData;

  if (!userData || !userData.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 🚦 Onboarding redirect
  if (!userData.onboarding_completed) {
    const onboardingStep = userData.onboarding_current_step ?? 1;
    return NextResponse.redirect(new URL(`/sign-up/step-${onboardingStep}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

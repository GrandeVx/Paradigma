import { betterFetch } from "@better-fetch/fetch";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Define Session type locally since we don't have access to the auth lib here
type Session = {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  sessionId: string;
  expiresAt: Date;
} | null;

// List of supported locales
export const locales = ["en", "it"];
export const defaultLocale = "en";

// Get the preferred locale from request headers
function getLocale(request: NextRequest) {
  // Check if there's a locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameLocale) return pathnameLocale;

  // Check the accept-language header
  const acceptedLanguage = request.headers
    .get("accept-language")
    ?.split(",")[0];
  if (acceptedLanguage) {
    const locale = locales.find((locale) =>
      acceptedLanguage.toLowerCase().startsWith(locale),
    );
    if (locale) return locale;
  }

  return defaultLocale;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip ALL API routes from locale and auth handling
  if (pathname.startsWith("/api/")) {
    // Log API requests for debugging
    if (req.method === "POST" && pathname.includes("/trpc/")) {
      console.log(`🔄 [Middleware] POST request to: ${pathname} from ${req.headers.get("user-agent")?.substring(0, 50) || 'unknown'}`);
    }
    if (req.method === "OPTIONS" && pathname.includes("/trpc/")) {
      console.log(`🔄 [Middleware] OPTIONS request to: ${pathname} from ${req.headers.get("origin") || 'unknown origin'}`);
    }
    return NextResponse.next();
  }

  // First, handle locale redirection
  // Skip locale check for other static files
  const shouldCheckLocale = ![
    "/_next/",
    "/images/",
    "/favicon.ico",
    "/sitemap.xml",
  ].some((prefix) => pathname.startsWith(prefix));

  if (shouldCheckLocale) {
    // Check if the pathname already has a locale
    const pathnameIsMissingLocale = locales.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(req);
      // Redirect to the same URL but with locale prefix
      return NextResponse.redirect(
        new URL(`/${locale}${pathname === "/" ? "" : pathname}`, req.url),
      );
    }
  }

  // Extract locale from the URL for auth redirects
  const locale = getLocale(req);

  // Function to check if a path is under the marketing route group
  const isMarketingRoute = (path: string) => {
    // Check if the path is the root or within the (marketing) group
    return path === "/" || path === `/${locale}`;
  };

  // Check if the request is for a public route
  const publicRoutes = ["/login", "/sign-up", "/forgot-password", "/sign-in", "/sign-in/verify", "/terms", "/privacy-policy"];
  const isPublicRoute = publicRoutes.some((route) => {
    // Handle both localized and non-localized paths
    return pathname === route || pathname === `/${locale}${route}` || pathname.endsWith(route);
  }) || isMarketingRoute(pathname);

  // Debug logging for verify route
  if (pathname.includes("verify")) {
    console.log(`🔍 [Middleware] Verify route detected:`, {
      pathname,
      locale,
      isPublicRoute,
      matchedRoute: publicRoutes.find(route => pathname === route || pathname === `/${locale}${route}` || pathname.endsWith(route))
    });
  }

  // Skip auth check for public routes and API routes (already handled above)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Get session using Better Auth
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: req.nextUrl.origin,
      headers: {
        cookie: req.headers.get("cookie") || "", // Forward the cookies
      },
    });

    if (!session && !isPublicRoute) {
      // Redirect to login if not authenticated and trying to access a protected route
      console.log("[Middleware] Not authenticated, redirecting to login");
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
    }

    if (session && isPublicRoute && !isMarketingRoute(pathname)) {
      // Don't redirect from verification page - user might be completing auth flow
      const isVerifyRoute = pathname.includes("/verify") || pathname.includes("/sign-in/verify");
      
      console.log(`🔄 [Middleware] Session found on public route:`, {
        pathname,
        isVerifyRoute,
        isMarketingRoute: isMarketingRoute(pathname),
        userId: session?.user?.id
      });
      
      if (!isVerifyRoute) {
        console.log(`➡️ [Middleware] Redirecting authenticated user from ${pathname} to dashboard`);
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      } else {
        console.log(`✋ [Middleware] Allowing access to verify route: ${pathname}`);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth error:", error);
    // On auth error, redirect to login
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public file extensions (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

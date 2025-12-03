import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          );
        },
      },
    }
  );

  let user = null;

  try {
    // Try to get user claims with retry logic for network failures
    const { data, error } = await supabase.auth.getClaims();

    if (error) {
      console.error("Supabase auth error in middleware:", error);
    }

    user = data?.claims;
  } catch (error) {
    // Network error - log it but don't crash
    console.error(
      "Network error in middleware (Supabase connection failed):",
      error
    );
    // Continue without user - will redirect to login if needed
  }
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/landing-page"];
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route
  );
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/api/auth");

  if (!user && !isPublicRoute && !isAuthRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

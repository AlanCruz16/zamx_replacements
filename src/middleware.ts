import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Create route matchers for different types of routes
const isPublicRoute = createRouteMatcher(['/'])
const isAuthRoute = createRouteMatcher(['/sign-in/(.*)', '/sign-up/(.*)'])
const isProfileRoute = createRouteMatcher(['/profile'])
const isFormRoute = createRouteMatcher(['/form'])

export default clerkMiddleware(async (auth, req) => {
    // Allow public routes and auth routes
    if (isPublicRoute(req) || isAuthRoute(req)) {
        return;
    }

    // Protect all non-public routes
    await auth.protect();

    // If user is signed in but hasn't completed profile, redirect to profile page
    // except if they're already on the profile page
    if (!isProfileRoute(req) && isFormRoute(req)) {
        // Here you would add logic to check if profile is completed
        // For now, we'll just let them through
        return;
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
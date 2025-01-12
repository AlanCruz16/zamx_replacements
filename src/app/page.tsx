import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <ClerkProvider>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Spare Parts Service</h1>
        <div className="space-x-4">
          <SignedOut>
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Register</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <a href="/form">
              <Button variant="default">Go to Form</Button>
            </a>
          </SignedIn>
        </div>
      </div>
    </ClerkProvider>
  );
}

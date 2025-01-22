import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Spare Parts Service</h1>
        <p className="text-lg text-gray-600 mb-8">
          Get quick quotations for the spare parts you need
        </p>

        <div className="space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline">Register</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <a href="/profile">
              <Button variant="default">Continue to Profile</Button>
            </a>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Fan,
  Clock,
  Truck,
  BadgeCheck,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: <Fan className="w-12 h-12 text-blue-500" />,
    title: "Original Parts",
    description: "Genuine ZIEHL-ABEGG spare parts ensuring optimal performance and reliability"
  },
  {
    icon: <Clock className="w-12 h-12 text-blue-500" />,
    title: "Quick Response",
    description: "Fast quotations and efficient processing of your spare part requests"
  },
  {
    icon: <Truck className="w-12 h-12 text-blue-500" />,
    title: "Global Delivery",
    description: "Worldwide shipping and logistics solutions for your requirements"
  },
  {
    icon: <BadgeCheck className="w-12 h-12 text-blue-500" />,
    title: "Quality Assured",
    description: "All parts meet strict quality standards and come with warranty"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Spare Parts</span>
              <span className="block text-blue-600">Quotation Service</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Get quick quotations for your ZIEHL-ABEGG spare parts. Fast, reliable, and hassle-free service for all your replacement needs.
            </p>

            {/* Authentication Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              <SignedOut>
                <SignInButton>
                  <Button size="lg" variant="default" className="gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="lg" variant="outline">
                    Register
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <a href="/form">
                  <Button size="lg" variant="default" className="gap-2">
                    Request Quotation <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our Service?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We provide comprehensive solutions for all your spare parts needs
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative group bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">Request your quotation today</span>
            </h2>
            <div className="mt-8">
              <SignedOut>
                <SignUpButton>
                  <Button
                    size="lg"
                    variant="default"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Create Account
                  </Button>
                </SignUpButton>
                <p className="mt-3 text-blue-200 text-sm">
                  Already have an account?{" "}
                  <SignInButton>
                    <button className="text-white underline hover:text-blue-100">
                      Sign in
                    </button>
                  </SignInButton>
                </p>
              </SignedOut>

              <SignedIn>
                <a href="/form">
                  <Button
                    size="lg"
                    variant="default"
                    className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 ZIEHL-ABEGG Spare Parts Service. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
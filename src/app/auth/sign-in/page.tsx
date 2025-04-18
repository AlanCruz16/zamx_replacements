import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and password to sign in
                    </p>
                </div>
                <SignInForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href="/auth/sign-up"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Don't have an account? Sign up
                    </Link>
                    <br />
                    <Link
                        href="/auth/forgot-password"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Forgot your password?
                    </Link>
                </p>
            </div>
        </div>
    )
}

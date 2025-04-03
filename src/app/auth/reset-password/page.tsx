import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm' // We will create this component next

export default function ResetPasswordPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Set a new password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>
                <ResetPasswordForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href="/auth/sign-in"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}

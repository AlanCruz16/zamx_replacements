'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client' // Use browser client

// Schema for password validation
const formSchema = z.object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error applies to the confirmPassword field
});

type FormData = z.infer<typeof formSchema>

export function ResetPasswordForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    // Supabase handles the session automatically based on the URL fragment
    // when the user lands on this page from the password reset email.
    // We just need to call updateUser with the new password.

    async function onSubmit(values: FormData) {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password,
            })

            if (error) {
                // Handle specific errors if needed, e.g., weak password policy
                throw error
            }

            toast.success('Password updated successfully!', {
                description: 'You can now sign in with your new password.',
            })
            router.push('/auth/sign-in') // Redirect to sign-in page
        } catch (error: any) {
            console.error('Password Update Error:', error)
            // Check for specific Supabase error codes if necessary
            if (error.message.includes('Password should be at least 6 characters')) {
                toast.error('Password Update Failed', {
                    description: 'Password is too weak. Please use a stronger password.',
                })
            } else if (error.message.includes('token has expired')) {
                toast.error('Password Update Failed', {
                    description: 'The password reset link has expired. Please request a new one.',
                })
            }
            else {
                toast.error('Password Update Failed', {
                    description: error.message || 'An unexpected error occurred. Please try again.',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Set New Password'}
                </Button>
            </form>
        </Form>
    )
}

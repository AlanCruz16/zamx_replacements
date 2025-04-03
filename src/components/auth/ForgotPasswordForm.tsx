'use client'

import * as React from 'react'
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

const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
})

type FormData = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const supabase = createClient()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: FormData) {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`, // URL where users confirm password reset
            })

            if (error) {
                throw error
            }

            toast.success('Password reset email sent!', {
                description: 'Please check your inbox for instructions to reset your password.',
            })
            form.reset() // Clear the form on success
        } catch (error: any) {
            console.error('Password Reset Error:', error)
            toast.error('Failed to send reset email', {
                description: error.message || 'Please try again later.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="you@example.com"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </form>
        </Form>
    )
}

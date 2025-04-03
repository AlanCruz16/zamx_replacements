'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSupabase } from '@/hooks/use-supabase'
import { signUpSchema, type SignUpFormValues } from '@/lib/validations/auth'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SignUpForm() {
    const router = useRouter()
    const { supabase } = useSupabase()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
            password: '',
            fullName: '',
            companyName: '',
        },
    })

    async function onSubmit(data: SignUpFormValues) {
        setIsLoading(true)

        try {
            // 1. Sign up the user
            const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })

            if (signUpError) throw signUpError

            // 2. Create the profile record
            if (signUpData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: signUpData.user.id,
                        full_name: data.fullName,
                        company_name: data.companyName,
                    })

                if (profileError) throw profileError
            }

            toast.success('Account created successfully!')
            router.refresh()
            router.push('/quotation')
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
            console.error(error)
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
                                    type="email"
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your full name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your company name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>
        </Form>
    )
}
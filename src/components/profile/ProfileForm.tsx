'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
import { useState } from 'react'
// We will define the server action later
import { updateProfile } from '@/app/profile/actions' // Uncommented server action import
import type { Database } from '@/types/database' // Assuming you have types generated

type Profile = Database['public']['Tables']['profiles']['Row']

// Define the validation schema using Zod
const profileFormSchema = z.object({
    full_name: z.string().min(2, {
        message: 'Full name must be at least 2 characters.',
    }),
    company_name: z.string().optional(), // Making company name optional for now
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
    userId: string
    profile: Profile | null // Allow null if profile doesn't exist yet
}

export function ProfileForm({ userId, profile }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    // Set default values from existing profile or empty strings
    const defaultValues: Partial<ProfileFormValues> = {
        full_name: profile?.full_name ?? '',
        company_name: profile?.company_name ?? '',
    }

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
        mode: 'onChange',
    })

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        setMessage(null)
        console.log('Form submitted with data:', data)
        // TODO: Implement server action call
        try {
            await updateProfile(userId, data); // Call the server action
            // No success message needed here as redirect happens on success
            // Redirect is handled by the server action itself
        } catch (error) {
            console.error("Failed to update profile:", error);
            // Display a generic error message, or potentially parse specific errors
            setMessage(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false); // Ensure loading state is reset
        }
        // Remove temporary lines
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
                {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
            </form>
        </Form>
    )
}

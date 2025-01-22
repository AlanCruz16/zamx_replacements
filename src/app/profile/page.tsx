"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            companyName: "",
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to save profile");
            }

            toast.success("Profile saved successfully");
            router.push("/form"); // Redirect to the product form
        } catch (error) {
            toast.error("Failed to save profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your full name" {...field} />
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
                                        <Input placeholder="Enter your company name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Profile"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
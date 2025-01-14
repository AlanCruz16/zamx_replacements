"use client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // You'll need to install this package

const formSchema = z.object({
    articleNumber: z.string().min(1, "Article number is required"),
    model: z.string().min(1, "Model is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    deliveryPlace: z.string().min(1, "Delivery place is required"),
    comments: z.string().optional(),
});

export default function FormPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            articleNumber: "",
            model: "",
            quantity: 0,
            deliveryPlace: "",
            comments: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit form");
            }

            // Show success message
            toast.success("Form submitted successfully");

            // Reset form
            form.reset();

            // Redirect to success page
            router.push("/success");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-8">Quotation Request Form</h1>

            {/* Information Section */}
            <div className="max-w-2xl mx-auto text-justify space-y-6 mb-12">
                <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                        How to Find Your Product Information
                    </h2>

                    <div className="space-y-4 text-gray-600">
                        <p>
                            The <span className="text-amber-500 font-bold">Article Number</span> of a ZIEHL-ABEGG product
                            is necessary to identify the correct replacement. It's typically a 6-digit number that starts
                            with 1 or 2.
                        </p>

                        <p>
                            The <span className="text-blue-500 font-bold">Model Description</span> of the fan type is needed
                            to confirm that the supplied part number matches the design of the requested unit.
                        </p>

                        <p>
                            If the part number is not available, the <span className="text-pink-500 font-bold">Serial Number</span> will
                            help us identify the unit. The serial number is typically 8 digits long and is also engraved
                            on the motor stator.
                        </p>
                    </div>

                    {/* Example Image */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 mb-2">Reference Image:</p>
                        <img
                            src="/plate-example.jpg"
                            alt="Data plate example"
                            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        />
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
                    <FormField
                        control={form.control}
                        name="articleNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Article Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter article number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter model" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Enter quantity"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deliveryPlace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Delivery Place</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter delivery place" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Comments (Optional)</FormLabel>
                                <FormControl>
                                    <textarea
                                        {...field}
                                        placeholder="Enter any additional information or special requirements"
                                        className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
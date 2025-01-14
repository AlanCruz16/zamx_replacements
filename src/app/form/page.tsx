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
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productSchema = z.object({
    articleNumber: z.string().min(1, "Article number is required"),
    model: z.string().min(1, "Model is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    deliveryPlace: z.string().min(1, "Delivery place is required"),
    comments: z.string().optional(),
    image: z
        .any()
        .optional()
        .refine((files) => {
            if (!files) return true;
            if (!(files instanceof FileList)) return false;
            if (files.length === 0) return true;
            const file = files[0];
            return file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, "Image must be less than 5MB and in JPG, PNG, or WebP format.")
});

const formSchema = z.object({
    product1: productSchema,
    product2: productSchema.optional(),
});

export default function FormPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSecondProduct, setShowSecondProduct] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product1: {
                articleNumber: "",
                model: "",
                quantity: 0,
                deliveryPlace: "",
                comments: "",
            },
        },
    });

    const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {

            const formData = new FormData();

            // Add product1 data and image
            const product1Data = { ...values.product1 };
            delete product1Data.image;
            formData.append('product1', JSON.stringify(product1Data));
            if (values.product1.image?.[0]) {
                formData.append('product1Image', values.product1.image[0]);
            }

            // Add product2 data and image if exists
            if (values.product2) {
                const product2Data = { ...values.product2 };
                delete product2Data.image;
                formData.append('product2', JSON.stringify(product2Data));
                if (values.product2.image?.[0]) {
                    formData.append('product2Image', values.product2.image[0]);
                }
            }
            const response = await fetch("/api/send", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit form");
            }

            toast.success("Form submitted successfully");
            form.reset();
            setShowSecondProduct(false);
            router.push("/success");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }, [form, router]);

    const ProductFields = useCallback(({ prefix }: { prefix: "product1" | "product2" }) => (
        <div className="space-y-6">
            {prefix === "product2" && (
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Second Product</h2>
                </div>
            )}
            <FormField
                control={form.control}
                name={`${prefix}.articleNumber`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Article Number (Part Number)</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter 6-digit article number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`${prefix}.model`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Model (Description)</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter model description" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`${prefix}.quantity`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Enter quantity"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`${prefix}.deliveryPlace`}
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
                name={`${prefix}.comments`}
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
            {/* New image upload field */}
            <FormField
                control={form.control}
                name={`${prefix}.image`}
                render={({ field }) => {
                    const value = field.value as FileList | null;
                    return (
                        <FormItem>
                            <FormLabel>Product Image (Optional)</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            field.onChange(e.target.files);
                                        }}
                                        className="hidden"
                                        id={`${prefix}-image-input`}
                                        ref={field.ref}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            document.getElementById(`${prefix}-image-input`)?.click();
                                        }}
                                        className="w-32"
                                    >
                                        Choose File
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {value && value.length > 0
                                            ? value[0].name
                                            : "no file selected"}
                                    </span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />


        </div>
    ), [form.control]);

    const handleAddSecondProduct = useCallback(() => {
        setShowSecondProduct(true);
        form.setValue('product2', {
            articleNumber: "",
            model: "",
            quantity: 0,
            deliveryPlace: "",
            comments: "",
        });
    }, [form]);

    const handleRemoveSecondProduct = useCallback(() => {
        setShowSecondProduct(false);
        form.setValue('product2', undefined);
    }, [form]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 space-y-8">
                <h1 className="text-3xl font-bold text-center">Quotation Request Form</h1>

                {/* Information Section */}
                <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
                    <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            How to Find Your Product Information
                        </h2>

                        <div className="space-y-4 text-gray-600">
                            <p>
                                The <span className="text-amber-500 font-bold">part number</span> of a ZIEHL-ABEGG product
                                is necessary to identify the correct replacement. It's typically a 6-digit number that starts
                                with 1 or 2.
                            </p>

                            <p>
                                The <span className="text-blue-500 font-bold">description</span> of the fan type is needed
                                to confirm that the supplied part number matches the design of the requested unit.
                            </p>

                            <p>
                                If the part number is not available, the <span className="text-pink-500 font-bold">serial number</span> will
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

                {/* Form Section */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <ProductFields prefix="product1" />

                        {!showSecondProduct ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleAddSecondProduct}
                            >
                                + Add Second Product
                            </Button>
                        ) : (
                            <>
                                <ProductFields prefix="product2" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleRemoveSecondProduct}
                                >
                                    - Remove Second Product
                                </Button>
                            </>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
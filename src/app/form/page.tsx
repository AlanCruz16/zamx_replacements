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
import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserCircle, Package, Info } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const userSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    companyName: z.string().min(1, "Company name is required"),
});

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
    user: userSchema,
    product1: productSchema,
    product2: productSchema.optional(),
});

// Memoized UserDetailsFields component
const UserDetailsFields = memo(({ control }: { control: any }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
            <UserCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={control}
                name="user.fullName"
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
                control={control}
                name="user.companyName"
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
        </div>
    </div>
));

UserDetailsFields.displayName = 'UserDetailsFields';

// Memoized ProductFields component
const ProductFields = memo(({ prefix, control }: { prefix: "product1" | "product2", control: any }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
            <Package className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">
                {prefix === "product1" ? "First Product" : "Second Product"}
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={control}
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
                control={control}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={control}
                name={`${prefix}.quantity`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Enter quantity"
                                {...field}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? '' : parseInt(value) || 0);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
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
        </div>

        <FormField
            control={control}
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

        <FormField
            control={control}
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
));

ProductFields.displayName = 'ProductFields';

// Information section component
const InformationSection = memo(() => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
            <Info className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">How to Find Your Product Information</h2>
        </div>

        <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
                <div className="space-y-3 text-gray-600">
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
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Reference Image:</p>
                <img
                    src="/plate-example.jpg"
                    alt="Data plate example"
                    className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                />
            </div>
        </div>
    </div>
));

InformationSection.displayName = 'InformationSection';

export default function FormPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSecondProduct, setShowSecondProduct] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user: {
                fullName: "",
                companyName: "",
            },
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
            formData.append('user', JSON.stringify(values.user));

            const product1Data = { ...values.product1 };
            delete product1Data.image;
            formData.append('product1', JSON.stringify(product1Data));
            if (values.product1.image?.[0]) {
                formData.append('product1Image', values.product1.image[0]);
            }

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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Quotation Request Form</h1>
                        <p className="mt-2 text-gray-600">Fill in the details below to request a quotation for your spare parts</p>
                    </div>

                    <InformationSection />

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <UserDetailsFields control={form.control} />

                                <div className="border-t pt-8">
                                    <ProductFields prefix="product1" control={form.control} />
                                </div>

                                {!showSecondProduct ? (
                                    <div className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleAddSecondProduct}
                                        >
                                            + Add Second Product
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="border-t pt-8">
                                            <ProductFields prefix="product2" control={form.control} />
                                        </div>
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

                                <Button
                                    type="submit"
                                    className="w-full py-6"
                                    disabled={isSubmitting}
                                    size="lg"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
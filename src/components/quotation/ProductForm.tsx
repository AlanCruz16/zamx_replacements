'use client'

import { Package } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { QuotationFormValues } from '@/lib/validations/quotation'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ProductFormProps {
    form: UseFormReturn<QuotationFormValues>
    prefix: "product1" | "product2"
    index: number
}

export function ProductForm({ form, prefix, index }: ProductFormProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">
                    {index === 0 ? "First Product" : "Second Product"}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

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
    )
}
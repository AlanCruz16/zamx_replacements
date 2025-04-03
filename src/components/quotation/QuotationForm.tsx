'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ProductForm } from './ProductForm'
import { quotationFormSchema, type QuotationFormValues } from '@/lib/validations/quotation'

interface QuotationFormProps {
    userId: string
}

export function QuotationForm({ userId }: QuotationFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSecondProduct, setShowSecondProduct] = useState(false)

    const form = useForm<QuotationFormValues>({
        resolver: zodResolver(quotationFormSchema),
        defaultValues: {
            product1: {
                articleNumber: "",
                model: "",
                quantity: 0,
                deliveryPlace: "",
                comments: "",
            },
        },
    })

    const onSubmit = async (values: QuotationFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            // Add first product
            const product1Data = { ...values.product1, userId }
            delete product1Data.image
            formData.append('product1', JSON.stringify(product1Data))
            if (values.product1.image?.[0]) {
                formData.append('product1Image', values.product1.image[0])
            }

            // Add second product if exists
            if (values.product2) {
                const product2Data = { ...values.product2, userId }
                delete product2Data.image
                formData.append('product2', JSON.stringify(product2Data))
                if (values.product2.image?.[0]) {
                    formData.append('product2Image', values.product2.image[0])
                }
            }

            const response = await fetch('/api/quotation', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to submit quotation')
            }

            toast.success('Quotation submitted successfully')
            form.reset()
            setShowSecondProduct(false)
            router.push('/quotation/success')
        } catch (error) {
            toast.error('Failed to submit quotation')
            console.error('Quotation submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="border-t pt-8">
                    <ProductForm prefix="product1" index={0} form={form} />
                </div>

                {!showSecondProduct ? (
                    <div className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setShowSecondProduct(true)
                                form.setValue('product2', {
                                    articleNumber: "",
                                    model: "",
                                    quantity: 0,
                                    deliveryPlace: "",
                                    comments: "",
                                })
                            }}
                        >
                            + Add Second Product
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="border-t pt-8">
                            <ProductForm prefix="product2" index={1} form={form} />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setShowSecondProduct(false)
                                form.setValue('product2', undefined)
                            }}
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
    )
}
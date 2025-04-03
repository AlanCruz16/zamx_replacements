import * as z from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

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
            if (!files) return true
            if (!(files instanceof FileList)) return false
            if (files.length === 0) return true
            const file = files[0]
            return file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type)
        }, "Image must be less than 5MB and in JPG, PNG, or WebP format.")
})

export const quotationFormSchema = z.object({
    product1: productSchema,
    product2: productSchema.optional(),
})

export type QuotationFormValues = z.infer<typeof quotationFormSchema>
export type ProductFormValues = z.infer<typeof productSchema>
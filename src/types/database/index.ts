export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    company_name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    company_name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    company_name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            quotation_requests: {
                Row: {
                    id: string
                    user_id: string
                    article_number: string
                    model: string
                    quantity: number
                    delivery_place: string
                    comments?: string | null
                    image_url?: string | null
                    status: 'pending' | 'processing' | 'completed' | 'cancelled'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    article_number: string
                    model: string
                    quantity: number
                    delivery_place: string
                    comments?: string | null
                    image_url?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    article_number?: string
                    model?: string
                    quantity?: number
                    delivery_place?: string
                    comments?: string | null
                    image_url?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
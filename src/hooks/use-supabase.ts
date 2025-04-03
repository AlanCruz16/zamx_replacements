import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { type SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const useSupabase = () => {
    const [supabase] = useState<SupabaseClient<Database>>(() => createClient())

    return { supabase }
}
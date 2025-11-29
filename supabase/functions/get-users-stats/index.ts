import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Fetch all profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nick, name, role, created_at')

        if (profilesError) throw profilesError

        // 2. Fetch all users from Auth (to get emails and last_sign_in)
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

        if (usersError) throw usersError

        // 3. Fetch resource counts per contributor
        // Note: .rpc() would be better for performance, but let's use a simple group by query if possible,
        // or just fetch all resources (lightweight select) and count in memory if dataset is small.
        // For scalability, let's try to use a raw query via rpc if we had one, but we don't.
        // Let's use a select with count.

        // Actually, we can use the `resources` table to count.
        const { data: resources, error: resourcesError } = await supabase
            .from('resources')
            .select('contributor_id')

        if (resourcesError) throw resourcesError

        const resourceCounts = resources.reduce((acc, curr) => {
            acc[curr.contributor_id] = (acc[curr.contributor_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 4. Merge data
        const stats = profiles.map(profile => {
            const authUser = users.find(u => u.id === profile.id);
            return {
                id: profile.id,
                nick: profile.nick || authUser?.user_metadata?.nickname || 'N/A',
                name: profile.name || authUser?.user_metadata?.full_name || 'N/A',
                email: authUser?.email || 'N/A',
                role: profile.role,
                avatar_url: authUser?.user_metadata?.avatar_url,
                resource_count: resourceCounts[profile.id] || 0,
                last_sign_in_at: authUser?.last_sign_in_at,
                created_at: profile.created_at
            };
        });

        // Sort by resource count desc
        stats.sort((a, b) => b.resource_count - a.resource_count);

        return new Response(JSON.stringify({ stats }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

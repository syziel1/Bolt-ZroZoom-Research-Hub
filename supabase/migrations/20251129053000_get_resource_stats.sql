-- Function to get resource statistics by type
CREATE OR REPLACE FUNCTION get_resource_stats()
RETURNS TABLE (
    type text,
    count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.type,
        COUNT(*)::bigint
    FROM 
        resources r
    GROUP BY 
        r.type
    ORDER BY 
        count DESC;
END;
$$;

-- Grant access to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION get_resource_stats() TO anon, authenticated, service_role;

COMMENT ON FUNCTION get_resource_stats() IS 'Returns the count of resources grouped by their type (e.g., youtube, wikipedia)';

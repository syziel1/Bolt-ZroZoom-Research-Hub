-- Migration: Add atomic swap functions for order indices
-- Purpose: Replace client-side rollback with true database-level transactions
-- Security: Configured with SET search_path = '' to prevent search path injection

-- ============================================
-- Function: swap_topics_order
-- Description: Atomically swaps order_index between two topics
-- ============================================
CREATE OR REPLACE FUNCTION swap_topics_order(
    topic1_id uuid,
    topic2_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    topic1_order integer;
    topic2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO topic1_order FROM public.topics WHERE id = topic1_id;
    SELECT order_index INTO topic2_order FROM public.topics WHERE id = topic2_id;
    
    -- Check if topics exist
    IF topic1_order IS NULL OR topic2_order IS NULL THEN
        RAISE EXCEPTION 'One or both topics not found';
    END IF;
    
    -- Perform atomic swap using a transaction
    -- Step 1: Set first topic to temporary value to avoid unique constraint conflicts
    UPDATE public.topics SET order_index = -1 WHERE id = topic1_id;
    
    -- Step 2: Set second topic to first topic's original order
    UPDATE public.topics SET order_index = topic1_order WHERE id = topic2_id;
    
    -- Step 3: Set first topic to second topic's original order
    UPDATE public.topics SET order_index = topic2_order WHERE id = topic1_id;
    
    -- Transaction commits automatically if no errors
END;
$$;

-- ============================================
-- Function: swap_subjects_order
-- Description: Atomically swaps order_index between two subjects
-- ============================================
CREATE OR REPLACE FUNCTION swap_subjects_order(
    subject1_id uuid,
    subject2_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    subject1_order integer;
    subject2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO subject1_order FROM public.subjects WHERE id = subject1_id;
    SELECT order_index INTO subject2_order FROM public.subjects WHERE id = subject2_id;
    
    -- Check if subjects exist
    IF subject1_order IS NULL OR subject2_order IS NULL THEN
        RAISE EXCEPTION 'One or both subjects not found';
    END IF;
    
    -- Perform atomic swap
    UPDATE public.subjects SET order_index = -1 WHERE id = subject1_id;
    UPDATE public.subjects SET order_index = subject1_order WHERE id = subject2_id;
    UPDATE public.subjects SET order_index = subject2_order WHERE id = subject1_id;
END;
$$;

-- ============================================
-- Function: swap_levels_order
-- Description: Atomically swaps order_index between two levels
-- ============================================
CREATE OR REPLACE FUNCTION swap_levels_order(
    level1_id uuid,
    level2_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    level1_order integer;
    level2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO level1_order FROM public.levels WHERE id = level1_id;
    SELECT order_index INTO level2_order FROM public.levels WHERE id = level2_id;
    
    -- Check if levels exist
    IF level1_order IS NULL OR level2_order IS NULL THEN
        RAISE EXCEPTION 'One or both levels not found';
    END IF;
    
    -- Perform atomic swap
    UPDATE public.levels SET order_index = -1 WHERE id = level1_id;
    UPDATE public.levels SET order_index = level1_order WHERE id = level2_id;
    UPDATE public.levels SET order_index = level2_order WHERE id = level1_id;
END;
$$;

-- ============================================
-- Grant execute permissions
-- ============================================
-- Grant to authenticated users (adjust based on your security requirements)
GRANT EXECUTE ON FUNCTION swap_topics_order(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION swap_subjects_order(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION swap_levels_order(uuid, uuid) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION swap_topics_order IS 'Atomically swaps order_index between two topics, eliminating race conditions';
COMMENT ON FUNCTION swap_subjects_order IS 'Atomically swaps order_index between two subjects, eliminating race conditions';
COMMENT ON FUNCTION swap_levels_order IS 'Atomically swaps order_index between two levels, eliminating race conditions';

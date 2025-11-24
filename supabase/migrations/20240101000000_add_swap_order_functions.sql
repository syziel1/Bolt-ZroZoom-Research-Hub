-- Migration: Add atomic swap order functions for levels, subjects, and topics
-- These functions ensure atomicity when swapping order_index values between two items

-- Function to swap order_index between two levels
CREATE OR REPLACE FUNCTION swap_levels_order(
  level1_id UUID,
  level1_new_order INTEGER,
  level2_id UUID,
  level2_new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Update the first level
  UPDATE levels SET order_index = level1_new_order WHERE id = level1_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Level with id % not found', level1_id;
  END IF;

  -- Update the second level
  UPDATE levels SET order_index = level2_new_order WHERE id = level2_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Level with id % not found', level2_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to swap order_index between two subjects
CREATE OR REPLACE FUNCTION swap_subjects_order(
  subject1_id UUID,
  subject1_new_order INTEGER,
  subject2_id UUID,
  subject2_new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Update the first subject
  UPDATE subjects SET order_index = subject1_new_order WHERE id = subject1_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Subject with id % not found', subject1_id;
  END IF;

  -- Update the second subject
  UPDATE subjects SET order_index = subject2_new_order WHERE id = subject2_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Subject with id % not found', subject2_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to swap order_index between two topics
CREATE OR REPLACE FUNCTION swap_topics_order(
  topic1_id UUID,
  topic1_new_order INTEGER,
  topic2_id UUID,
  topic2_new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Update the first topic
  UPDATE topics SET order_index = topic1_new_order WHERE id = topic1_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Topic with id % not found', topic1_id;
  END IF;

  -- Update the second topic
  UPDATE topics SET order_index = topic2_new_order WHERE id = topic2_id;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  IF rows_affected != 1 THEN
    RAISE EXCEPTION 'Topic with id % not found', topic2_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION swap_levels_order TO authenticated;
GRANT EXECUTE ON FUNCTION swap_subjects_order TO authenticated;
GRANT EXECUTE ON FUNCTION swap_topics_order TO authenticated;

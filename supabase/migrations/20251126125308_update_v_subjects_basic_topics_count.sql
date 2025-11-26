/*
  # Update v_subjects_basic view to show topics count

  1. Changes
    - Drop existing v_subjects_basic view
    - Recreate with topics_count instead of resources_count
    - Count distinct topics associated with each subject
    - Maintain existing columns: subject_id, subject_name, subject_slug, order_index
  
  2. Notes
    - Topics are linked to subjects directly via the topics table (subject_id column)
    - This counts the number of unique topics per subject, not resources
*/

DROP VIEW IF EXISTS v_subjects_basic;

CREATE VIEW v_subjects_basic
WITH (security_invoker = true)
AS
SELECT 
  s.id AS subject_id,
  s.name AS subject_name,
  s.slug AS subject_slug,
  s.order_index,
  count(DISTINCT t.id) AS topics_count
FROM subjects s
  LEFT JOIN topics t ON t.subject_id = s.id
GROUP BY s.id
ORDER BY s.order_index;

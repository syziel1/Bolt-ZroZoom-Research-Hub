-- Function to increment reputation
CREATE OR REPLACE FUNCTION increment_reputation_on_resource_add()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET reputation_score = reputation_score + 10
  WHERE id = NEW.contributor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new resource creation
CREATE TRIGGER on_resource_created
AFTER INSERT ON resources
FOR EACH ROW
EXECUTE FUNCTION increment_reputation_on_resource_add();

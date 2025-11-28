-- Create a function to get user statistics
create or replace function get_user_stats(user_uuid uuid)
returns json
language plpgsql
security definer
as $$
declare
  favorites_count integer;
  ratings_count integer;
  resources_count integer;
begin
  -- Count favorites
  select count(*)
  into favorites_count
  from user_favorites
  where user_id = user_uuid;

  -- Count ratings
  select count(*)
  into ratings_count
  from ratings
  where author_id = user_uuid;

  -- Count added resources
  select count(*)
  into resources_count
  from resources
  where contributor_id = user_uuid;

  return json_build_object(
    'favorites_count', favorites_count,
    'ratings_count', ratings_count,
    'resources_count', resources_count
  );
end;
$$;

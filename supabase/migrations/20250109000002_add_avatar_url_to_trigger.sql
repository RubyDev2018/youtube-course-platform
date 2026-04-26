-- Update handle_new_user() trigger to save Google OAuth avatar URL
-- Google OAuth provides avatar URL in raw_user_meta_data->>'avatar_url' or 'picture'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users who have Google OAuth avatars but no avatar_url in profiles
UPDATE profiles
SET avatar_url = COALESCE(
  auth.users.raw_user_meta_data->>'avatar_url',
  auth.users.raw_user_meta_data->>'picture'
)
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.avatar_url IS NULL
  AND (
    auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL
    OR auth.users.raw_user_meta_data->>'picture' IS NOT NULL
  );

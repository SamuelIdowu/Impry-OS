-- Trigger to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Insert existing users if they don't exist in public.users
INSERT INTO public.users (id, email, full_name, company_name)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'company_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

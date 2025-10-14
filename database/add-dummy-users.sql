INSERT INTO public.profiles (id, email, encrypted_password)
VALUES
  (gen_random_uuid(), 'demo@example.com', crypt('password123', gen_salt('bf'))),
  (gen_random_uuid(), 'testuser1@example.com', crypt('password123', gen_salt('bf'))),
  (gen_random_uuid(), 'testuser2@example.com', crypt('password123', gen_salt('bf')))
RETURNING id, email;
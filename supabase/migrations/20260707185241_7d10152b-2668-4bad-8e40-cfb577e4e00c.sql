
-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========== WEDDINGS ===========
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner1_name TEXT NOT NULL,
  partner2_name TEXT NOT NULL,
  wedding_date DATE,
  venue_ceremony TEXT,
  venue_reception TEXT,
  ceremony_time TEXT,
  reception_time TEXT,
  dress_code TEXT,
  template_id TEXT DEFAULT 'classique',
  custom_message TEXT,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  map_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weddings TO authenticated;
GRANT ALL ON public.weddings TO service_role;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage weddings" ON public.weddings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========== GUESTS ===========
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  group_label TEXT NOT NULL DEFAULT 'amis',
  household_id UUID,
  invite_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage guests" ON public.guests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = guests.wedding_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = guests.wedding_id AND w.user_id = auth.uid()));

-- =========== RSVP RESPONSES ===========
CREATE TABLE public.rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  attending TEXT NOT NULL DEFAULT 'maybe',
  number_of_people INT NOT NULL DEFAULT 1,
  menu_choice TEXT,
  allergies TEXT,
  message TEXT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_responses TO authenticated;
GRANT ALL ON public.rsvp_responses TO service_role;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read rsvp" ON public.rsvp_responses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guests g JOIN public.weddings w ON w.id = g.wedding_id WHERE g.id = rsvp_responses.guest_id AND w.user_id = auth.uid()));
CREATE POLICY "Owners modify rsvp" ON public.rsvp_responses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guests g JOIN public.weddings w ON w.id = g.wedding_id WHERE g.id = rsvp_responses.guest_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.guests g JOIN public.weddings w ON w.id = g.wedding_id WHERE g.id = rsvp_responses.guest_id AND w.user_id = auth.uid()));

-- =========== TABLES SEATING ===========
CREATE TABLE public.tables_seating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 8,
  table_number INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tables_seating TO authenticated;
GRANT ALL ON public.tables_seating TO service_role;
ALTER TABLE public.tables_seating ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage tables" ON public.tables_seating FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = tables_seating.wedding_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = tables_seating.wedding_id AND w.user_id = auth.uid()));

-- =========== TABLE ASSIGNMENTS ===========
CREATE TABLE public.table_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES public.tables_seating(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  UNIQUE (guest_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_assignments TO authenticated;
GRANT ALL ON public.table_assignments TO service_role;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage assignments" ON public.table_assignments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tables_seating t JOIN public.weddings w ON w.id = t.wedding_id WHERE t.id = table_assignments.table_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tables_seating t JOIN public.weddings w ON w.id = t.wedding_id WHERE t.id = table_assignments.table_id AND w.user_id = auth.uid()));

-- =========== PROFILE AUTO-CREATION TRIGGER ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== PUBLIC INVITE RPC (SECURITY DEFINER) ===========
CREATE OR REPLACE FUNCTION public.get_invite_by_token(_token TEXT)
RETURNS TABLE (
  guest_id UUID,
  guest_name TEXT,
  wedding_id UUID,
  partner1_name TEXT,
  partner2_name TEXT,
  wedding_date DATE,
  venue_ceremony TEXT,
  venue_reception TEXT,
  ceremony_time TEXT,
  reception_time TEXT,
  dress_code TEXT,
  template_id TEXT,
  custom_message TEXT,
  faq JSONB,
  map_url TEXT,
  existing_response JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id, g.full_name,
    w.id, w.partner1_name, w.partner2_name, w.wedding_date,
    w.venue_ceremony, w.venue_reception, w.ceremony_time, w.reception_time,
    w.dress_code, w.template_id, w.custom_message, w.faq, w.map_url,
    (SELECT to_jsonb(r.*) FROM public.rsvp_responses r WHERE r.guest_id = g.id ORDER BY r.responded_at DESC LIMIT 1)
  FROM public.guests g
  JOIN public.weddings w ON w.id = g.wedding_id
  WHERE g.invite_token = _token
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_rsvp(
  _token TEXT,
  _attending TEXT,
  _number_of_people INT,
  _menu_choice TEXT,
  _allergies TEXT,
  _message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _guest_id UUID;
  _response_id UUID;
BEGIN
  SELECT id INTO _guest_id FROM public.guests WHERE invite_token = _token;
  IF _guest_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  -- Delete previous response then insert fresh
  DELETE FROM public.rsvp_responses WHERE guest_id = _guest_id;

  INSERT INTO public.rsvp_responses (guest_id, attending, number_of_people, menu_choice, allergies, message)
  VALUES (_guest_id, _attending, COALESCE(_number_of_people, 1), _menu_choice, _allergies, _message)
  RETURNING id INTO _response_id;

  RETURN _response_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_rsvp(TEXT, TEXT, INT, TEXT, TEXT, TEXT) TO anon, authenticated;

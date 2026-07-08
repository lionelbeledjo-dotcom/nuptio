
CREATE TYPE public.wedding_plan AS ENUM ('free', 'standard', 'premium');
CREATE TYPE public.wedding_payment_status AS ENUM ('pending', 'paid');

ALTER TABLE public.weddings
  ADD COLUMN plan public.wedding_plan NOT NULL DEFAULT 'free',
  ADD COLUMN payment_status public.wedding_payment_status NOT NULL DEFAULT 'pending';

-- Guest cap enforced server-side: 20 for free, 100 for standard/premium.
CREATE OR REPLACE FUNCTION public.enforce_guest_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w_plan public.wedding_plan;
  w_status public.wedding_payment_status;
  current_count INTEGER;
  cap INTEGER;
BEGIN
  SELECT plan, payment_status INTO w_plan, w_status
  FROM public.weddings WHERE id = NEW.wedding_id;

  -- Effective plan: paid unlocks the plan, otherwise treat as free.
  IF w_status = 'paid' AND w_plan IN ('standard', 'premium') THEN
    cap := 100;
  ELSE
    cap := 20;
  END IF;

  SELECT COUNT(*) INTO current_count FROM public.guests WHERE wedding_id = NEW.wedding_id;
  IF current_count >= cap THEN
    RAISE EXCEPTION 'Plafond d''invités atteint pour cette formule (%). Passez à une formule supérieure.', cap
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_guest_cap_trigger ON public.guests;
CREATE TRIGGER enforce_guest_cap_trigger
BEFORE INSERT ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.enforce_guest_cap();

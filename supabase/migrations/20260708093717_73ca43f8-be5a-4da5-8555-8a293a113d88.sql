
DROP FUNCTION public.get_invite_by_token(text);

CREATE OR REPLACE FUNCTION public.get_invite_by_token(_token text)
 RETURNS TABLE(guest_id uuid, guest_name text, wedding_id uuid, partner1_name text, partner2_name text, wedding_date date, venue_ceremony text, venue_reception text, ceremony_time text, reception_time text, dress_code text, template_id text, custom_message text, faq jsonb, map_url text, plan public.wedding_plan, payment_status public.wedding_payment_status, existing_response jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    g.id, g.full_name,
    w.id, w.partner1_name, w.partner2_name, w.wedding_date,
    w.venue_ceremony, w.venue_reception, w.ceremony_time, w.reception_time,
    w.dress_code, w.template_id, w.custom_message, w.faq, w.map_url,
    w.plan, w.payment_status,
    (SELECT to_jsonb(r.*) FROM public.rsvp_responses r WHERE r.guest_id = g.id ORDER BY r.responded_at DESC LIMIT 1)
  FROM public.guests g
  JOIN public.weddings w ON w.id = g.wedding_id
  WHERE g.invite_token = _token
  LIMIT 1;
END;
$function$;

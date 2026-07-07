import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAILS } from "@/lib/constants";

export function useAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return false;
      return ADMIN_EMAILS.includes(data.user.email ?? "");
    },
    staleTime: Infinity,
  });
}

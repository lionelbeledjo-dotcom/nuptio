import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const eventQueryOptions = queryOptions({
  queryKey: ["event"],
  queryFn: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const { data, error } = await supabase
      .from("weddings")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export function useEvent() {
  return useQuery(eventQueryOptions);
}

export function useInvalidateEvent() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["event"] });
}

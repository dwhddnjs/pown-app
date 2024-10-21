import { supabase } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"

export const useGetUsers = () => {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: async () => await supabase.from("user").select(),
  })

  return {
    data,
  }
}

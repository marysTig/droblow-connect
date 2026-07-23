import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type OrderStatus } from "./supabase";

// ─── Utility ─────────────────────────────────────────────────────
export function formatDZD(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(n)) + " DZD";
}

// ─── Categories ──────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      // If the table doesn't exist yet, return empty array gracefully
      if (error) {
        console.warn("[categories] Query failed (table may not exist yet):", error.message);
        return [];
      }
      return data ?? [];
    },
    retry: false,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (category: {
      name: string;
      image?: string | null;
      subcategories?: string[] | null;
    }) => {
      const { error } = await supabase.from("categories").insert(category);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string;
      name?: string;
      image?: string | null;
      subcategories?: string[] | null;
    }) => {
      const { error } = await supabase.from("categories").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ─── Products ────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      let allProducts: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data) {
          allProducts = [...allProducts, ...data];
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      return allProducts;
    },
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      name: string;
      description: string;
      image: string;
      price: number;
      category: string;
      subcategory?: string | null;
      is_active: boolean;
    }) => {
      const { error } = await supabase.from("products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string;
      name?: string;
      description?: string;
      image?: string;
      price?: number;
      category?: string;
      subcategory?: string | null;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("products").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ─── Testimonials ────────────────────────────────────────────────
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── FAQs ────────────────────────────────────────────────────────
export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Platform Stats ──────────────────────────────────────────────
export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_stats").select("*").single();
      if (error) throw error;
      return data;
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────
export function useOrders(affiliateId?: string) {
  return useQuery({
    queryKey: ["orders", affiliateId],
    queryFn: async () => {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (affiliateId) query = query.eq("affiliate_id", affiliateId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: {
      id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      selling_price: number;
      commission: number;
      customer_name: string;
      phone: string;
      wilaya: string;
      commune?: string;
      delivery_type?: "home" | "desk" | null;
      delivery_price?: number;
      affiliate_id?: string;
    }) => {
      const { error } = await supabase.from("orders").insert(order);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string;
      quantity?: number;
      selling_price?: number;
      commission?: number;
      customer_name?: string;
      phone?: string;
      wilaya?: string;
      commune?: string;
    }) => {
      const { error } = await supabase.from("orders").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// ─── Affiliates ──────────────────────────────────────────────────
export function useAffiliates() {
  return useQuery({
    queryKey: ["affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("joined", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAffiliateProfile(id?: string) {
  return useQuery({
    queryKey: ["affiliate", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("affiliates").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ─── Withdrawals ─────────────────────────────────────────────────
export function useWithdrawals(affiliateId?: string) {
  return useQuery({
    queryKey: ["withdrawals", affiliateId],
    queryFn: async () => {
      let query = supabase
        .from("withdrawals")
        .select("*")
        .order("requested_at", { ascending: false });
      if (affiliateId) query = query.eq("affiliate_id", affiliateId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateWithdrawalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("withdrawals").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
}

export function useCreateWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (w: {
      id: string;
      affiliate_id?: string;
      amount: number;
      method: string;
      account_number?: string;
    }) => {
      const { error } = await supabase.from("withdrawals").insert(w);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
}

// ─── Earnings Chart ──────────────────────────────────────────────
export function useEarningsChart(affiliateId?: string) {
  return useQuery({
    queryKey: ["earnings_chart", affiliateId],
    queryFn: async () => {
      let query = supabase
        .from("earnings_chart")
        .select("month, year, earnings, orders")
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      if (affiliateId) query = query.eq("affiliate_id", affiliateId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Shipping Rates ──────────────────────────────────────────────
export function useShippingRates() {
  return useQuery({
    queryKey: ["shipping_rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_rates")
        .select("*")
        .order("wilaya_id", { ascending: true });
      if (error) {
        console.warn("[shipping_rates] Query failed (table may not exist yet):", error.message);
        return [];
      }
      return data ?? [];
    },
  });
}

export function useUpdateShippingRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wilaya_id,
      ...fields
    }: {
      wilaya_id: string;
      home_delivery?: number;
      desk_delivery?: number;
      is_available?: boolean;
    }) => {
      const { error } = await supabase
        .from("shipping_rates")
        .update(fields)
        .eq("wilaya_id", wilaya_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping_rates"] }),
  });
}

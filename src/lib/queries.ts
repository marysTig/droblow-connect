import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase, type OrderStatus, type Notification } from "./supabase";

// ─── Utility ─────────────────────────────────────────────────────
export function formatDZD(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(n)) + " DZD";
}

/**
 * Résout l'image à afficher pour un produit.
 * Pour les produits "Promotion" : priorité à images[1] (index 1),
 * puis p.image, sinon null (afficher un placeholder).
 * Pour les autres catégories : p.image en priorité, puis images[0], sinon null.
 */
export function getProductImage(p: {
  image?: string | null;
  images?: string[] | null;
  category?: string | null;
}): string | null {
  const isPromo = (p.category ?? "").toLowerCase().trim() === "promotion";
  if (isPromo) {
    return (
      (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] || null : null)
      || p.image
      || null
    );
  }
  return p.image || (Array.isArray(p.images) ? p.images.find((img) => !!img) ?? null : null) || null;
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
      // First fetch to get count and first page
      const { data: firstPage, count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 999);

      if (countError) throw countError;

      let allProducts = [...(firstPage || [])];
      
      if (count && count > 1000) {
        const totalPages = Math.ceil(count / 1000);
        
        // Fetch pages sequentially in chunks of 2 to avoid overwhelming the database (500 error)
        for (let page = 1; page < totalPages; page += 2) {
          const promises = [];
          promises.push(
            supabase
              .from("products")
              .select("*")
              .order("created_at", { ascending: false })
              .range(page * 1000, (page + 1) * 1000 - 1)
          );
          
          if (page + 1 < totalPages) {
            promises.push(
              supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false })
                .range((page + 1) * 1000, (page + 2) * 1000 - 1)
            );
          }
          
          const results = await Promise.all(promises);
          for (const { data, error } of results) {
            if (error) throw error;
            if (data) allProducts = [...allProducts, ...data];
          }
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
      images?: string[];
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
      images?: string[];
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
      const { data, error } = await supabase.from("platform_stats").select("*").maybeSingle();
      if (error) throw error;
      return data || {
        total_sales: 0,
        active_affiliates: 0,
        conversion_rate: 0,
        monthly_growth: 0,
        products_count: 0,
        orders_delivered: 0,
        commissions_paid: 0,
      };
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────
export function useOrders(affiliateId?: string) {
  const qc = useQueryClient();

  // ── Realtime sync: auto-invalidate when any order row changes ──
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          qc.invalidateQueries({ queryKey: ["orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

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
    mutationFn: async ({ id, status, cancellation_reason }: { id: string; status: OrderStatus; cancellation_reason?: string | null }) => {
      const payload: Record<string, any> = { status };
      if (status === "cancelled") {
        payload.cancellation_reason = cancellation_reason ?? null;
      } else {
        // Clear reason if status changes away from cancelled
        payload.cancellation_reason = null;
      }
      const { error } = await supabase.from("orders").update(payload).eq("id", id);
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
      address?: string;
      delivery_type?: "home" | "desk" | null;
      delivery_price?: number;
      affiliate_id?: string;
      affiliate_name?: string | null;
      status?: OrderStatus;
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
      id_commande_review?: string;
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

export function useUpdateAffiliateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; payout_method?: string; account_number?: string; name?: string; phone?: string; wilaya?: string; commune?: string; }) => {
      const { data, error } = await supabase.from("affiliates").update(fields).eq("id", id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Update failed: Row not found or RLS blocked the update.");
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["affiliate", variables.id] });
    },
  });
}

export function useDeleteAffiliate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useUnlockImmobilier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, unlock }: { id: string; unlock: boolean }) => {
      const { error } = await supabase
        .from("affiliates")
        .update({ immobilier_unlocked: unlock })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
    },
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

// ─── Support Tickets ─────────────────────────────────────────────
export function useSupportTickets(affiliateId?: string) {
  return useQuery({
    queryKey: ["support_tickets", affiliateId],
    queryFn: async () => {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (affiliateId) query = query.eq("affiliate_id", affiliateId);
      const { data, error } = await query;
      if (error) {
        console.warn("[support_tickets] Query failed:", error.message);
        return [];
      }
      return data ?? [];
    },
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: {
      affiliate_id: string;
      affiliate_name: string;
      affiliate_email: string;
      subject: string;
      description: string;
    }) => {
      const { error } = await supabase.from("support_tickets").insert(ticket);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support_tickets"] }),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      admin_reply,
      messages,
    }: {
      id: string;
      status?: string;
      admin_reply?: string;
      messages?: any[];
    }) => {
      const payload: any = {};
      if (status) payload.status = status;
      if (admin_reply !== undefined) payload.admin_reply = admin_reply;
      if (messages !== undefined) payload.messages = messages;

      const { error } = await supabase
        .from("support_tickets")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support_tickets"] }),
  });
}

export function useReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      messages,
    }: {
      id: string;
      messages: any[];
    }) => {
      // Si l'affilié répond, on repasse le ticket "en cours" (ouvert)
      const { error } = await supabase
        .from("support_tickets")
        .update({ messages, status: "open" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support_tickets"] }),
  });
}

// ─── Notifications ───────────────────────────────────────────────
export function useNotifications(affiliateId?: string) {
  const qc = useQueryClient();

  // ── Realtime sync: invalidate when a notification row changes ──
  useEffect(() => {
    if (!affiliateId) return;
    const channel = supabase
      .channel(`notifications-realtime-${affiliateId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications", affiliateId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId, qc]);

  return useQuery({
    queryKey: ["notifications", affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.warn("[notifications] Query failed:", error.message);
        return [];
      }
      return (data ?? []) as Notification[];
    },
    enabled: !!affiliateId,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (affiliateId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("affiliate_id", affiliateId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── Immobilier ───────────────────────────────────────────────────

export function useImmobilierProduct(id?: string) {
  return useQuery({
    queryKey: ["immobilier_product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("immobilier_products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useImmobilierProducts() {
  return useQuery({
    queryKey: ["immobilier_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("immobilier_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("[immobilier_products] Query failed:", error.message);
        return [];
      }
      return data ?? [];
    },
    retry: false,
  });
}

export function useImportImmobilierCSV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      rows: Array<{
        category?: string | null;
        title?: string | null;
        phone?: string | null;
        type?: string | null;
        location?: string | null;
        price?: string | null;
        rooms?: string | null;
        surface_m2?: string | null;
        detail_url?: string | null;
        image_url?: string | null;
      }>
    ) => {
      const { error } = await supabase.from("immobilier_products").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["immobilier_products"] }),
  });
}

export function useDeleteImmobilierProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("immobilier_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["immobilier_products"] }),
  });
}

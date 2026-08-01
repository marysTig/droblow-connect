import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth";
import { useSupportTickets, useCreateSupportTicket, useReplyToTicket } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import {
  LifeBuoy,
  SendHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SupportTicket, TicketStatus } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/support")({
  component: () => (
    <AuthGuard>
      <SupportPage />
    </AuthGuard>
  ),
});

// ─── Status helpers ────────────────────────────────────────────────────────────

function ticketStatusConfig(status: TicketStatus) {
  switch (status) {
    case "open":
      return {
        label: "Ouvert",
        icon: AlertCircle,
        className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    case "in_progress":
      return {
        label: "En cours",
        icon: Clock,
        className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      };
    case "resolved":
      return {
        label: "Résolu",
        icon: CheckCircle2,
        className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    case "closed":
      return {
        label: "Fermé",
        icon: XCircle,
        className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyMutation = useReplyToTicket();

  const cfg = ticketStatusConfig(ticket.status);
  const Icon = cfg.icon;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const newMsg = {
      role: "affiliate" as const,
      content: replyText.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedMessages = [...(ticket.messages || []), newMsg];
    replyMutation.mutate(
      { id: ticket.id, messages: updatedMessages },
      {
        onSuccess: () => {
          toast.success("Réponse envoyée !");
          setReplyText("");
        },
        onError: (err: any) => toast.error("Erreur : " + err.message),
      }
    );
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Icon */}
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm truncate">{ticket.subject}</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}
            >
              <Icon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5">{formatDate(ticket.created_at)}</p>
        </div>

        {/* Toggle */}
        <div className="text-muted-foreground flex-shrink-0 mt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/40 pt-4 space-y-4">
          <div className="space-y-4">
            {/* Premier message (description) */}
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold">{t("support_you").charAt(0)}</span>
                </div>
                <span className="text-xs font-semibold">{t("support_you")}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(ticket.created_at)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>

            {/* Réponse admin initiale (pour rétrocompatibilité) */}
            {ticket.admin_reply && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 ml-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{t("support_admin").charAt(0)}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">{t("support_admin")}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.admin_reply}</p>
              </div>
            )}

            {/* Nouveau système de messages */}
            {ticket.messages?.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  msg.role === "admin"
                    ? "bg-primary/5 border-primary/20 ml-6"
                    : "bg-muted/40 border-border/50 mr-6"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      msg.role === "admin" ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        msg.role === "admin" ? "text-primary" : ""
                      }`}
                    >
                      {msg.role === "admin" ? t("support_admin").charAt(0) : t("support_you").charAt(0)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      msg.role === "admin" ? "text-primary" : ""
                    }`}
                  >
                    {msg.role === "admin" ? t("support_admin") : t("support_you")}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatDate(msg.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>

          {!ticket.admin_reply && (!ticket.messages || ticket.messages.length === 0) && ticket.status === "open" && (
            <p className="text-xs text-muted-foreground/70 italic text-center py-2">
              En attente de réponse de l'équipe support…
            </p>
          )}

          {/* Formulaire de réponse (disponible sauf si fermé) */}
          {ticket.status !== "closed" ? (
            <div className="pt-2">
              <Textarea
                placeholder="Ajouter une réponse..."
                className="min-h-[80px] resize-none mb-3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replyMutation.isPending}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="gradient-brand text-brand-foreground shadow-brand"
                >
                  {replyMutation.isPending ? "Envoi..." : "Envoyer la réponse"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-muted-foreground/70 italic py-2">
              Ce ticket est fermé. Veuillez ouvrir un nouveau ticket pour toute autre question.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Support Page ────────────────────────────────────────────────────────

function SupportPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useSupportTickets(user?.id);
  const createTicket = useCreateSupportTicket();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (!user) return;

    createTicket.mutate(
      {
        affiliate_id: user.id,
        affiliate_name:
          user.user_metadata?.first_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
            : user.email ?? "Affilié",
        affiliate_email: user.email ?? "",
        subject: subject.trim(),
        description: description.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Votre ticket a été soumis avec succès !");
          setSubject("");
          setDescription("");
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
        },
        onError: (err: any) => toast.error("Erreur : " + err.message),
      }
    );
  };

  const openCount = tickets.filter((t: SupportTicket) => t.status === "open" || t.status === "in_progress").length;
  
  const filteredTickets = tickets.filter((t: SupportTicket) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(252 87% 67%), hsl(283 68% 55%))" }}
        >
          <LifeBuoy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("support_title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("support_sub")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total tickets", value: tickets.length, color: "text-primary" },
          { label: "En cours", value: openCount, color: "text-amber-500" },
          {
            label: "Résolus",
            value: tickets.filter((t: SupportTicket) => t.status === "resolved" || t.status === "closed").length,
            color: "text-emerald-500",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* New Ticket Form */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <SendHorizontal className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t("support_new_ticket")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-subject">{t("support_subject")}</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex : Problème avec mon paiement, Question sur une commande…"
              className="h-11"
              disabled={createTicket.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-description">{t("support_desc")}</Label>
            <Textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pouvons vous aider efficacement."
              className="min-h-[140px] resize-none"
              disabled={createTicket.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 gradient-brand text-brand-foreground shadow-brand font-semibold"
            disabled={createTicket.isPending}
          >
            {createTicket.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Envoi en cours…
              </span>
            ) : submitted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ticket envoyé !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SendHorizontal className="h-4 w-4" />
                Soumettre le ticket
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Tickets History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{t("support_my_tickets")}</h2>
            {tickets.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tickets.length}
              </Badge>
            )}
          </div>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "Tous" },
                { id: "open", label: "Ouverts" },
                { id: "in_progress", label: "En cours" },
                { id: "resolved", label: "Résolus" },
                { id: "closed", label: "Fermés" },
              ] as const
            ).map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.id)}
                className={`h-8 text-xs ${filter === f.id ? "gradient-brand text-white border-transparent" : "text-muted-foreground"}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Chargement…</div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <LifeBuoy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("support_no_tickets")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket: SupportTicket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

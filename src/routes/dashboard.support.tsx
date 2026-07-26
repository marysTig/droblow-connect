import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth";
import { useSupportTickets, useCreateSupportTicket } from "@/lib/queries";
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
  const [expanded, setExpanded] = useState(false);
  const cfg = ticketStatusConfig(ticket.status);
  const Icon = cfg.icon;

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
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Description complète</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>

          {ticket.admin_reply && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">A</span>
                </div>
                <span className="text-xs font-semibold text-primary">Réponse de l'admin</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.admin_reply}</p>
            </div>
          )}

          {!ticket.admin_reply && ticket.status === "open" && (
            <p className="text-xs text-muted-foreground/70 italic">
              En attente de réponse de l'équipe support…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Support Page ────────────────────────────────────────────────────────

function SupportPage() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useSupportTickets(user?.id);
  const createTicket = useCreateSupportTicket();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground">
            Soumettez un ticket et notre équipe vous répondra rapidement.
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
          <h2 className="font-semibold">Nouveau ticket</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-subject">Sujet *</Label>
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
            <Label htmlFor="ticket-description">Description du problème *</Label>
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Mes tickets</h2>
          {tickets.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tickets.length} ticket{tickets.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Chargement…</div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <LifeBuoy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun ticket soumis pour l'instant.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Utilisez le formulaire ci-dessus pour contacter le support.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: SupportTicket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

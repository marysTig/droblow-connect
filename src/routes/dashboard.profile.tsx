import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Profile" subtitle="Manage your account, payments, and notifications." />

      <div className="rounded-2xl border bg-card p-6 flex flex-wrap items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src="https://i.pravatar.cc/120?img=12" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold">Amine Bouzid</h2>
          <p className="text-sm text-muted-foreground">Affiliate ID · AF-1234 · Joined Jan 2026</p>
        </div>
        <Button variant="outline">Change avatar</Button>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="bg-card border p-1 h-11">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="First name" defaultValue="Amine" />
              <F label="Last name" defaultValue="Bouzid" />
              <F label="Email" type="email" defaultValue="amine@droblow.dz" />
              <F label="Phone" defaultValue="0555 12 34 56" />
              <F label="Wilaya" defaultValue="Alger" />
              <F label="City" defaultValue="Bab Ezzouar" />
            </div>
            <Save />
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Payout method" defaultValue="CCP" />
              <F label="Account holder" defaultValue="Amine Bouzid" />
              <F label="Account number" defaultValue="00799999 0016 66" />
              <F label="RIB / IBAN" defaultValue="123 456 789 012 345 678" />
            </div>
            <Save />
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Current password" type="password" />
              <div />
              <F label="New password" type="password" />
              <F label="Confirm new password" type="password" />
            </div>
            <Save label="Update password" />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <div className="space-y-4">
              {[
                ["Order updates", "Get notified when your orders change status."],
                ["Commission unlocked", "Alert me when a commission becomes available."],
                ["Withdrawal status", "Get updates on withdrawal requests."],
                ["Product launches", "Be first to know when new products drop."],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center justify-between rounded-xl border p-4">
                  <div><div className="font-medium">{t}</div><div className="text-sm text-muted-foreground">{d}</div></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
            <Save />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-6 space-y-4">{children}</div>;
}
function F({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div><Label>{label}</Label><Input className="mt-1.5 h-11" {...rest} /></div>;
}
function Save({ label = "Save changes" }: { label?: string }) {
  return <div className="flex justify-end pt-2"><Button className="gradient-brand text-brand-foreground shadow-brand" onClick={() => toast.success("Saved")}>{label}</Button></div>;
}

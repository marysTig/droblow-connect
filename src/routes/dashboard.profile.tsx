import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useAffiliateProfile, useUpdateAffiliateProfile } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { Loader2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import wilayasData from "../../wilayas-with-municipalities.json";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useAffiliateProfile(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-brand" />
      </div>
    );
  }

  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: any }) {
  const { t } = useI18n();
  const [firstNamePart, ...lastNameParts] = (profile?.name || "").split(" ");
  const lastNamePart = lastNameParts.join(" ");

  const [firstName, setFirstName] = useState(firstNamePart || "");
  const [lastName, setLastName] = useState(lastNamePart || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  const [selectedWilaya, setSelectedWilaya] = useState(profile?.wilaya || "");
  const [selectedCommune, setSelectedCommune] = useState(profile?.commune || "");
  const [payoutMethod, setPayoutMethod] = useState(profile?.payout_method || "ccp");
  const [accountNumber, setAccountNumber] = useState(profile?.account_number || "");

  const updateProfile = useUpdateAffiliateProfile();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    "Order updates": true,
    "Commission unlocked": true,
    "Withdrawal status": true,
    "Product launches": true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("notification_settings");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateNotifications = () => {
    localStorage.setItem("notification_settings", JSON.stringify(notifications));
    toast.success("Notification preferences saved");
  };

  const wilayaData = wilayasData.find((w) => w.nameFr === selectedWilaya);
  const communes = wilayaData?.communes || [];

  const handleWilayaChange = (value: string) => {
    setSelectedWilaya(value);
    setSelectedCommune(""); // reset commune when wilaya changes
  };

  const joinedDate = profile?.joined
    ? new Date(profile.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Unknown";

  const shortId = profile?.id ? profile.id.substring(0, 8) : "...";

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title={t("profile_title")} subtitle={t("profile_sub")} />

      <div className="rounded-2xl border bg-card p-6 flex flex-wrap items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl bg-brand/10 text-brand font-semibold">
            {firstName?.[0]?.toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold" dir="auto">
            {profile?.name || "No Name"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 mb-0.5 flex-wrap">
            <span>{t("profile_affiliate_id")} :</span>
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">{profile?.id}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (profile?.id) {
                  navigator.clipboard.writeText(profile.id);
                  toast.success("Affiliate ID copié");
                }
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <span className="mx-1 hidden sm:inline">·</span>
            <span>{t("profile_joined")} {joinedDate}</span>
          </div>
          {(selectedWilaya || selectedCommune) && (
            <p className="text-sm text-muted-foreground mt-0.5">
              📍 {[selectedCommune, selectedWilaya].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="bg-card border p-1 flex-wrap h-auto">
          <TabsTrigger value="personal">{t("profile_tab_personal")}</TabsTrigger>
          <TabsTrigger value="payment">{t("profile_tab_payment")}</TabsTrigger>
          <TabsTrigger value="password">{t("profile_tab_password")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("profile_tab_notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label={t("profile_first_name")} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <F label={t("profile_last_name")} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <F label={t("profile_email")} type="email" value={profile?.email || ""} disabled />
              <div>
                <Label>Affiliate ID</Label>
                <div className="relative mt-1.5">
                  <Input value={profile?.id || ""} disabled className="pr-10 bg-background/50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (profile?.id) {
                        navigator.clipboard.writeText(profile.id);
                        toast.success("Affiliate ID copied to clipboard");
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <F label={t("profile_phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />

              {/* Wilaya Dropdown */}
              <div>
                <Label>{t("profile_wilaya")}</Label>
                <Select value={selectedWilaya} onValueChange={handleWilayaChange}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background">
                    <SelectValue placeholder="Select Wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayasData.map((w) => (
                      <SelectItem key={w.wilayaCode} value={w.nameFr}>
                        {w.wilayaCode} - {w.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Commune Dropdown */}
              <div>
                <Label>{t("profile_commune")}</Label>
                <Select
                  value={selectedCommune}
                  onValueChange={setSelectedCommune}
                  disabled={!selectedWilaya}
                >
                  <SelectTrigger className="mt-1.5 h-11 bg-background">
                    <SelectValue
                      placeholder={selectedWilaya ? "Select Commune" : "Select a Wilaya first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map((c) => (
                      <SelectItem key={c.nameFr} value={c.nameFr}>
                        {c.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Save 
              onClick={() => {
                const newName = `${firstName} ${lastName}`.trim();
                updateProfile.mutate(
                  { id: profile.id, name: newName, phone, wilaya: selectedWilaya, commune: selectedCommune },
                  { onSuccess: () => toast.success("Personal details updated") }
                );
              }}
              isLoading={updateProfile.isPending}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("profile_payout_method")}</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background">
                    <SelectValue placeholder="Select payout method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CCP">CCP</SelectItem>
                    <SelectItem value="BaridiMob">BaridiMob</SelectItem>
                    <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                    <SelectItem value="Flixy">Flixy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <F label={t("profile_account_holder")} value={profile?.name || ""} disabled />
              <F 
                label={t("profile_account_number")} 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)} 
                placeholder={payoutMethod === "Flixy" ? "Phone number for Flixy" : "e.g. 00799999 0016 66"} 
              />
            </div>
            <Save 
              onClick={() => {
                updateProfile.mutate(
                  { id: profile.id, payout_method: payoutMethod, account_number: accountNumber },
                  { onSuccess: () => toast.success("Payment details updated") }
                );
              }}
              isLoading={updateProfile.isPending}
            />
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F 
                label={t("profile_current_password")} 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div />
              <F 
                label={t("profile_new_password")} 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <F 
                label={t("profile_confirm_password")} 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Save 
              label={t("profile_update_password")} 
              onClick={handleUpdatePassword} 
              isLoading={isUpdatingPassword} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <div className="space-y-4">
              {[
                [t("notif_order_updates"), t("notif_order_updates_desc")],
                [t("notif_commission"), t("notif_commission_desc")],
                [t("notif_withdrawal"), t("notif_withdrawal_desc")],
                [t("notif_product"), t("notif_product_desc")],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <div className="font-medium">{t}</div>
                    <div className="text-sm text-muted-foreground">{d}</div>
                  </div>
                  <Switch 
                    checked={notifications[t as keyof typeof notifications] ?? true}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [t]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
            <Save onClick={handleUpdateNotifications} />
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
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5 h-11" {...rest} />
    </div>
  );
}
function Save({ label, onClick, isLoading }: { label?: string; onClick?: () => void; isLoading?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="flex justify-end pt-2">
      <Button
        className="gradient-brand text-brand-foreground shadow-brand"
        onClick={onClick ? onClick : () => toast.success(t("profile_saved"))}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label || t("profile_save")}
      </Button>
    </div>
  );
}

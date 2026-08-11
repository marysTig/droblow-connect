import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatusBadge, ProductNameDisplay } from "@/components/dashboard/shared";
import { formatProductName } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  ShoppingBag,
  Users,
  Wallet,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Upload,
  ImageIcon,
  LogOut,
  Tag,
  Wand2,
  MapPin,
  Clock,
  LayoutDashboard,
  ChevronRight,
  Bell,
  Settings,
  TrendingUp,
  Activity,
  Truck,
  BarChart2,
  Menu,
  Home,
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  SendHorizontal,
  Info,
  Database,
  Sparkles,
  Building,
  Search,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import {
  usePlatformStats,
  useProducts,
  useOrders,
  useAffiliates,
  useWithdrawals,
  useEarningsChart,
  useUpdateOrderStatus,
  useUpdateOrder,
  useDeleteOrder,
  useUpdateWithdrawalStatus,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  formatDZD,
  getProductImage,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useShippingRates,
  useUpdateShippingRate,
  useSupportTickets,
  useUpdateTicketStatus,
  useImmobilierProducts,
  useImportImmobilierCSV,
  useDeleteImmobilierProduct,
  useUnlockImmobilier,
  useDeleteAffiliate,
} from "@/lib/queries";
import { WILAYAS } from "@/lib/constants";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, OrderStatus, Category, SupportTicket, TicketStatus } from "@/lib/supabase";
import { useState, useRef } from "react";
import { generateIntelligentDescription } from "@/lib/utils/product";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthGuard requireAdmin>
      <AdminPanel />
    </AuthGuard>
  ),
});

// ─── Product Form ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  image: "",
  is_active: true,
};
type ProductForm = typeof EMPTY_FORM;

// DEFAULT_CATEGORIES removed — categories are now managed dynamically from the database.

function ProductDialog({
  open,
  onClose,
  editProduct,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  editProduct?: Product | null;
  categories: Category[];
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>(
    editProduct
      ? {
          name: editProduct.name,
          description: editProduct.description,
          category: editProduct.category,
          subcategory: editProduct.subcategory || "",
          price: String(editProduct.price),
          image: editProduct.image,
          is_active: editProduct.is_active,
        }
      : EMPTY_FORM,
  );
  const [coverUrl, setCoverUrl] = useState<string>(editProduct?.image || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(editProduct?.images ?? []);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const set = (k: keyof ProductForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const result = await uploadToCloudinary(file);
      setCoverUrl(result.secure_url);
      set("image", result.secure_url);
      toast.success("Cover photo uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const results = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      setGalleryUrls((prev) => [...prev, ...results.map((r) => r.secure_url)]);
      toast.success(`${results.length} photo(s) added to gallery!`);
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeGalleryPhoto = (idx: number) =>
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));

  const generateDescription = () => {
    if (!form.name) {
      toast.error("Please enter a product name first to generate a description.");
      return;
    }

    const desc = generateIntelligentDescription(form.name, form.category, form.price);

    set("description", desc);
    toast.success("Description intelligente générée !");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !coverUrl) {
      return toast.error("Please fill in all required fields and upload a cover photo.");
    }
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || null,
      price: Number(form.price),
      image: coverUrl,
      images: galleryUrls,
      is_active: form.is_active,
    };

    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Product updated!");
            onClose();
          },
          onError: (err) => toast.error("Update failed: " + err.message),
        },
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          toast.success("Product created!");
          onClose();
        },
        onError: (err) => toast.error("Create failed: " + err.message),
      });
    }
  };

  const isPending =
    createProduct.isPending || updateProduct.isPending || uploadingCover || uploadingGallery;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* ── Cover Photo ── */}
          <div>
            <Label className="flex items-center gap-1.5">
              <span>Cover Photo</span>
              <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (ratio 1:1 — square thumbnail)
              </span>
            </Label>
            <div
              className="mt-1.5 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:border-brand/50 transition-colors relative"
              style={{ aspectRatio: "1/1", maxHeight: 220 }}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverUrl ? (
                <>
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 text-white text-sm">
                      <Upload className="h-6 w-6" />
                      <span>Change cover</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground py-10">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                  <span className="text-sm">
                    {uploadingCover ? "Uploading..." : "Click to upload cover photo"}
                  </span>
                  <span className="text-xs opacity-60">Square format recommended (1:1)</span>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>

          {/* ── Product Gallery ── */}
          <div>
            <Label className="flex items-center gap-1.5">
              <span>Product Photos</span>
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (optional — multiple allowed)
              </span>
            </Label>
            <div className="mt-1.5">
              {/* Existing gallery thumbnails */}
              {galleryUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {galleryUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group h-20 w-20 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        onClick={() => removeGalleryPhoto(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Upload area */}
              <div
                className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-brand/50 transition-colors"
                onClick={() => galleryInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Upload className="h-6 w-6 opacity-50" />
                  <span className="text-sm">
                    {uploadingGallery ? "Uploading..." : "Click to add product photos"}
                  </span>
                  <span className="text-xs opacity-60">You can select multiple files at once</span>
                </div>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />
            </div>
          </div>

          {/* ── Fields ── */}
          <div>
            <Label>
              Product name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1.5 h-11"
              placeholder="e.g. Wireless Earbuds Pro"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateDescription}
                className="h-6 px-2 text-xs text-brand hover:text-brand hover:bg-brand/10"
              >
                <Wand2 className="w-3 h-3 mr-1.5" />
                Auto-generate
              </Button>
            </div>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short product description"
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  set("category", v);
                  set("subcategory", "");
                }}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategory (Optional)</Label>
              <Select
                value={form.subcategory}
                onValueChange={(v) => set("subcategory", v)}
                disabled={
                  !form.category ||
                  !categories.find((c) => c.name === form.category)?.subcategories?.length
                }
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .find((c) => c.name === form.category)
                    ?.subcategories?.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  {!categories.find((c) => c.name === form.category)?.subcategories?.length && (
                    <SelectItem value="none" disabled>
                      No subcategories
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>
              Price (DZD) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="mt-1.5 h-11"
              placeholder="e.g. 4500"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active as boolean}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active (visible to affiliates)
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            className="gradient-brand text-brand-foreground shadow-brand"
            onClick={handleSubmit as any}
          >
            {isPending ? "Saving..." : editProduct ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────

// ─── Category Manager ────────────────────────────────────────────────────────

function CategoriesTab() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateProduct = useUpdateProduct();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Detect category names used by products but not yet in the categories table
  const dbCategoryNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const missingFromDb = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).filter(
    (name) => !dbCategoryNames.has(name.toLowerCase()),
  );

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase()))
      return toast.error("Category already exists.");
    createCategory.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setNewName("");
          toast.success(`Category "${trimmed}" added.`);
        },
        onError: (err) => toast.error("Failed to add category: " + err.message),
      },
    );
  };

  const handleSyncFromProducts = async () => {
    if (missingFromDb.length === 0) return;
    setSyncing(true);
    let successCount = 0;
    for (const name of missingFromDb) {
      await new Promise<void>((resolve) => {
        createCategory.mutate(
          { name },
          {
            onSuccess: () => {
              successCount++;
              resolve();
            },
            onError: () => resolve(),
          },
        );
      });
    }
    setSyncing(false);
    toast.success(`${successCount} categorie(s) importée(s) depuis les produits.`);
  };

  const handleRename = (id: string, oldName: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingId(null);
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== id)) {
      toast.error("Category already exists.");
      return;
    }
    updateCategory.mutate(
      { id, name: trimmed },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success(`Renamed to "${trimmed}".`);
          // Update all products using the old category name
          products
            .filter((p) => p.category === oldName)
            .forEach((p) => {
              updateProduct.mutate({ id: p.id, category: trimmed });
            });
        },
        onError: (err) => toast.error("Rename failed: " + err.message),
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${name}"? Products using it will be moved to "Other".`,
      )
    )
      return;
    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast.success(`Category "${name}" deleted.`);
        products
          .filter((p) => p.category === name)
          .forEach((p) => {
            updateProduct.mutate({ id: p.id, category: "Other" });
          });
      },
      onError: (err) => toast.error("Delete failed: " + err.message),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId) return;

    setUploadingImageId(activeUploadId);
    try {
      const result = await uploadToCloudinary(file);
      updateCategory.mutate(
        { id: activeUploadId, image: result.secure_url },
        {
          onSuccess: () => toast.success("Category image updated!"),
          onError: (err) => toast.error("Failed to save image: " + err.message),
        },
      );
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingImageId(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border bg-card">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold" dir="auto">
            Categories
          </h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} category(ies) — used in products and landing page
          </p>
        </div>
      </div>
      <div className="p-5">
        {/* ── Missing categories banner ── */}
        {!isLoading && missingFromDb.length > 0 && (
          <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">
                {missingFromDb.length} catégorie(s) utilisée(s) par des produits mais absente(s) de
                la base :
              </p>
              <p className="text-xs text-muted-foreground mt-1">{missingFromDb.join(" · ")}</p>
            </div>
            <Button
              size="sm"
              onClick={handleSyncFromProducts}
              disabled={syncing || createCategory.isPending}
              className="shrink-0 gradient-brand text-brand-foreground shadow-brand"
            >
              {syncing ? "Synchronisation..." : "Importer depuis les produits"}
            </Button>
          </div>
        )}

        {/* Add new */}
        <div className="flex gap-2 mb-6">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name…"
            className="h-10"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={createCategory.isPending}
            className="gradient-brand text-brand-foreground shadow-brand shrink-0"
          >
            {createCategory.isPending ? (
              "Adding..."
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" /> Add
              </>
            )}
          </Button>
        </div>

        {/* Hidden file input for image upload */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-6 text-sm">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No categories yet. Add one above or import from your products.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 rounded-xl border bg-background p-3"
              >
                {/* Image Section */}
                <div
                  className="relative w-16 h-16 rounded-full border bg-muted flex-shrink-0 overflow-hidden cursor-pointer group flex items-center justify-center"
                  onClick={() => {
                    setActiveUploadId(cat.id);
                    fileInputRef.current?.click();
                  }}
                >
                  {cat.image ? (
                    <>
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  )}
                  {uploadingImageId === cat.id && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Name & Subcategories Section */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
                  <div className="flex items-center gap-3">
                    {editingId === cat.id ? (
                      <input
                        className="flex-1 bg-transparent border-b border-primary outline-none text-base font-medium py-1 px-1"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.id, cat.name);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => handleRename(cat.id, cat.name)}
                      />
                    ) : (
                      <span className="flex-1 text-base font-medium">{cat.name}</span>
                    )}
                  </div>

                  {/* Subcategories list */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(cat.subcategories || []).map((sub: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs font-normal pl-2 pr-1 py-0 h-6"
                      >
                        {sub}
                        <button
                          type="button"
                          className="ml-1 hover:text-destructive rounded-full p-0.5 transition-colors"
                          onClick={() => {
                            const newSubs = (cat.subcategories || []).filter((s: string) => s !== sub);
                            updateCategory.mutate({ id: cat.id, subcategories: newSubs });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <div className="flex items-center">
                      <Input
                        placeholder="+ add subcategory (enter)"
                        className="h-6 text-[11px] w-40 px-2 py-0 border-dashed bg-muted/50 focus-visible:ring-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = e.currentTarget.value.trim();
                            if (val && !(cat.subcategories || []).includes(val)) {
                              const newSubs = [...(cat.subcategories || []), val];
                              updateCategory.mutate({ id: cat.id, subcategories: newSubs });
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Product count badge */}
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
                  {products.filter((p) => p.category === cat.name).length} produit(s)
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditValue(cat.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteCategory.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Immobilier Admin Section ──────────────────────────────────────────────

function ImmobilierActivationTab() {
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAffiliates();
  const unlockImmobilier = useUnlockImmobilier();
  const [userId, setUserId] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");

  // Find affiliate by pasted ID
  const foundAffiliate = userId.trim()
    ? affiliates.find((a) => a.id === userId.trim())
    : null;

  const handleToggle = (id: string, currentState: boolean) => {
    unlockImmobilier.mutate(
      { id, unlock: !currentState },
      {
        onSuccess: () =>
          toast.success(!currentState ? "✅ Accès Immobilier activé !" : "🔒 Accès Immobilier désactivé."),
        onError: (err: any) => toast.error("Erreur : " + err.message),
      }
    );
  };

  // Affiliates filtered for the list
  const filteredAffiliates = affiliates.filter((a) => {
    const q = affiliateSearch.toLowerCase();
    return (
      !q ||
      a.id?.toLowerCase().includes(q) ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  });

  const unlockedCount = affiliates.filter((a) => a.immobilier_unlocked).length;

  return (
    <div className="space-y-8">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total affiliés", value: affiliates.length, color: "text-slate-300", bg: "bg-slate-500/10" },
          { label: "Accès activé", value: unlockedCount, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Accès verrouillé", value: affiliates.length - unlockedCount, color: "text-slate-500", bg: "bg-slate-700/10" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-4 ${s.bg}`}
            style={{ borderColor: "hsl(220 15% 20%)" }}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Activate by ID ── */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 20%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Activer l'accès Immobilier</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Collez l'ID de l'utilisateur reçu via WhatsApp pour lui activer l'accès.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            id="immobilier-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Collez l'ID utilisateur ici…"
            className="flex-1 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 font-mono text-sm h-11"
          />
          <Button
            variant="outline"
            className="border-slate-700 text-slate-400 hover:text-white hover:bg-white/5 h-11 px-3"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setUserId(text);
            }}
            title="Coller depuis le presse-papier"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Result card */}
        {userId.trim() && (
          <div
            className={`rounded-xl border p-4 transition-all ${
              foundAffiliate
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            {foundAffiliate ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-300 font-bold text-sm">
                      {(foundAffiliate.first_name?.[0] || foundAffiliate.email?.[0] || "?").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {foundAffiliate.first_name} {foundAffiliate.last_name}
                    </p>
                    <p className="text-xs text-slate-400">{foundAffiliate.email}</p>
                    <p className="text-xs font-mono text-slate-600 mt-0.5">{foundAffiliate.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      foundAffiliate.immobilier_unlocked
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-700/50 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {foundAffiliate.immobilier_unlocked ? "✅ Activé" : "🔒 Verrouillé"}
                  </span>
                  <Button
                    size="sm"
                    disabled={unlockImmobilier.isPending}
                    className={
                      foundAffiliate.immobilier_unlocked
                        ? "border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                    }
                    onClick={() =>
                      handleToggle(foundAffiliate.id, !!foundAffiliate.immobilier_unlocked)
                    }
                  >
                    {unlockImmobilier.isPending
                      ? "..."
                      : foundAffiliate.immobilier_unlocked
                      ? "Désactiver"
                      : "Activer l'accès"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-rose-400">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Utilisateur introuvable</p>
                  <p className="text-xs text-rose-400/70 mt-0.5">
                    Vérifiez que l'ID collé est correct et correspond bien à un affilié inscrit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── All affiliates list ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-white text-sm">Tous les affiliés</h3>
          <Input
            placeholder="Rechercher par nom, email ou ID…"
            value={affiliateSearch}
            onChange={(e) => setAffiliateSearch(e.target.value)}
            className="w-60 bg-slate-900 border-slate-800 h-9 text-sm"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Affilié</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400 text-center">Statut Immobilier</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAffiliates ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : filteredAffiliates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Aucun affilié trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAffiliates.map((a) => (
                  <TableRow key={a.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-slate-200">
                      {a.first_name} {a.last_name}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{a.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-500 truncate max-w-[120px]">
                          {a.id}
                        </span>
                        <button
                          className="text-slate-600 hover:text-slate-300 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(a.id);
                            toast.success("ID copié !");
                          }}
                          title="Copier l'ID"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          a.immobilier_unlocked
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-700/40 text-slate-500 border-slate-700"
                        }`}
                      >
                        {a.immobilier_unlocked ? "✅ Activé" : "🔒 Verrouillé"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={unlockImmobilier.isPending}
                        className={
                          a.immobilier_unlocked
                            ? "text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 text-xs h-8 px-3"
                            : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs h-8 px-3"
                        }
                        onClick={() => handleToggle(a.id, !!a.immobilier_unlocked)}
                      >
                        {a.immobilier_unlocked ? "Désactiver" : "Activer"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ImmobilierAdminSection() {
  const { data: products = [], isLoading } = useImmobilierProducts();
  const importCSV = useImportImmobilierCSV();
  const deleteProduct = useDeleteImmobilierProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"annonces" | "activation">("annonces");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) throw new Error("Fichier CSV vide ou invalide");

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        
        const catIdx = headers.findIndex(h => h.includes("cat"));
        const titreIdx = headers.findIndex(h => h.includes("title") || h.includes("titre"));
        const typeIdx = headers.findIndex(h => h.includes("type"));
        const locIdx = headers.findIndex(h => h.includes("loc"));
        const prixIdx = headers.findIndex(h => h.includes("price") || h.includes("prix"));
        const chambIdx = headers.findIndex(h => h.includes("room") || h.includes("chambre"));
        const surfIdx = headers.findIndex(h => h.includes("surface") || h.includes("m2") || h.includes("m²"));
        const telIdx = headers.findIndex(h => h.includes("phone") || h.includes("tel") || h.includes("tél"));
        const detailIdx = headers.findIndex(h => h.includes("detail"));
        const imageIdx = headers.findIndex(h => h.includes("image"));

        if (titreIdx === -1) {
          throw new Error("La colonne 'Titre' (ou title) est obligatoire dans le CSV.");
        }

        const rowsToInsert = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          if (cols.length < headers.length) continue;

          rowsToInsert.push({
            category: catIdx !== -1 ? cols[catIdx] : null,
            title: cols[titreIdx],
            type: typeIdx !== -1 ? cols[typeIdx] : null,
            location: locIdx !== -1 ? cols[locIdx] : null,
            price: prixIdx !== -1 ? cols[prixIdx] : null,
            rooms: chambIdx !== -1 ? cols[chambIdx] : null,
            surface_m2: surfIdx !== -1 ? cols[surfIdx] : null,
            phone: telIdx !== -1 ? cols[telIdx] : null,
            detail_url: detailIdx !== -1 ? cols[detailIdx] : null,
            image_url: imageIdx !== -1 ? cols[imageIdx] : null,
          });
        }

        if (rowsToInsert.length === 0) throw new Error("Aucune donnée valide à importer.");

        await importCSV.mutateAsync(rowsToInsert);
        toast.success(`${rowsToInsert.length} produits immobiliers importés avec succès.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'import CSV");
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(p => 
    (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div>
        <h2 className="text-xl font-bold text-white">Immobilier</h2>
        <p className="text-sm text-slate-500 mt-0.5">Gérez les annonces et les accès affiliés.</p>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-800 bg-slate-900/60 w-fit">
        {[
          { id: "annonces" as const, label: "Annonces", icon: Building },
          { id: "activation" as const, label: "Activation", icon: CheckCircle2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`immobilier-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Annonces Tab ── */}
      {activeTab === "annonces" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-slate-400">
              {products.length} annonce{products.length !== 1 ? "s" : ""} importée{products.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Rechercher (Titre, Lieu)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-slate-900 border-slate-800"
              />
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importCSV.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {importCSV.isPending ? "Import en cours..." : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Titre</TableHead>
                    <TableHead className="text-slate-400">Catégorie</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Localisation</TableHead>
                    <TableHead className="text-slate-400">Prix</TableHead>
                    <TableHead className="text-slate-400">Chambres</TableHead>
                    <TableHead className="text-slate-400">Surface</TableHead>
                    <TableHead className="text-slate-400">Téléphone</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">Chargement...</TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">Aucune annonce trouvée.</TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-slate-200">{p.title}</TableCell>
                        <TableCell className="text-slate-400">{p.category || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.type || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.location || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.price || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.rooms || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.surface_m2 || "-"}</TableCell>
                        <TableCell className="text-slate-400">{p.phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => {
                              if (window.confirm("Supprimer cette annonce ?")) {
                                deleteProduct.mutate(p.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* ── Activation Tab ── */}
      {activeTab === "activation" && <ImmobilierActivationTab />}
    </div>
  );
}

// ─── Admin Panel (cPanel Style) ──────────────────────────────────────────────

type AdminSection =
  | "home"
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "affiliates"
  | "withdrawals"
  | "shipping"
  | "stats"
  | "support"
  | "blackchain"
  | "skancare"
  | "immobilier";

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: "home",        label: "Dashboard",    icon: LayoutDashboard, color: "text-blue-400",   bg: "bg-blue-500/10" },
  { id: "products",    label: "Products",     icon: Package,         color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "categories",  label: "Categories",   icon: Tag,             color: "text-cyan-400",   bg: "bg-cyan-500/10" },
  { id: "orders",      label: "Orders",       icon: ShoppingBag,     color: "text-amber-400",  bg: "bg-amber-500/10" },
  { id: "affiliates",  label: "Affiliates",   icon: Users,           color: "text-emerald-400",bg: "bg-emerald-500/10" },
  { id: "withdrawals", label: "Withdrawals",  icon: Wallet,          color: "text-rose-400",   bg: "bg-rose-500/10" },
  { id: "shipping",    label: "Livraison",    icon: Truck,           color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "stats",       label: "Statistics",   icon: BarChart2,       color: "text-pink-400",   bg: "bg-pink-500/10" },
  { id: "support",     label: "Support",      icon: LifeBuoy,        color: "text-teal-400",   bg: "bg-teal-500/10" },
  { id: "blackchain",  label: "Blackchain",   icon: Database,        color: "text-fuchsia-400",bg: "bg-fuchsia-500/10" },
  { id: "skancare",    label: "Skancare",     icon: Sparkles,        color: "text-sky-400",    bg: "bg-sky-500/10" },
  { id: "immobilier",  label: "Immobilier",   icon: Building,        color: "text-indigo-400", bg: "bg-indigo-500/10" },
];

function AdminPanel() {
  const { data: stats } = usePlatformStats();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: affiliates = [] } = useAffiliates();
  const { data: withdrawals = [] } = useWithdrawals();
  const { data: earningsChart = [] } = useEarningsChart();

  const updateOrderStatus = useUpdateOrderStatus();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const updateWithdrawal = useUpdateWithdrawalStatus();
  const deleteAffiliate = useDeleteAffiliate();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { data: shippingRates = [], isLoading: isLoadingShipping } = useShippingRates();
  const updateShippingRate = useUpdateShippingRate();

  const { data: dbCategories = [] } = useCategories();

  const { data: supportTickets = [] } = useSupportTickets();
  const updateTicket = useUpdateTicketStatus();
  const unlockImmobilier = useUnlockImmobilier();

  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: Product | null }>({
    open: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });
  const [deleteOrderDialog, setDeleteOrderDialog] = useState<{ open: boolean; id?: string; label?: string }>({
    open: false,
  });
  const [cancellationDialog, setCancellationDialog] = useState<{ open: boolean; orderId?: string; currentReason?: string | null }>({
    open: false,
  });
  const [cancellationReason, setCancellationReason] = useState("");
  const [ticketDialog, setTicketDialog] = useState<{ open: boolean; ticket?: SupportTicket | null }>({
    open: false,
  });
  const [affiliateInfoDialog, setAffiliateInfoDialog] = useState<{ open: boolean; affiliateId?: string | null }>({
    open: false,
  });
  const [deleteAffiliateDialog, setDeleteAffiliateDialog] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });
  const [ticketReply, setTicketReply] = useState("");
  const [ticketStatusEdit, setTicketStatusEdit] = useState<TicketStatus>("open");

  const [activeSection, setActiveSection] = useState<AdminSection>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(50);
  const [visibleOrders, setVisibleOrders] = useState(50);
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const openTickets = supportTickets.filter((t: SupportTicket) => t.status === "open").length;

  const currentNav = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(220 20% 7%)" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex-shrink-0 flex flex-col border-r transition-all duration-300"
        style={{
          width: sidebarCollapsed ? 68 : 230,
          background: "hsl(220 18% 10%)",
          borderColor: "hsl(220 15% 16%)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="h-16 flex items-center justify-between px-3 border-b flex-shrink-0"
          style={{ borderColor: "hsl(220 15% 16%)" }}
        >
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Settings className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white truncate">Control Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const badge =
              item.id === "orders" ? pendingOrders :
              item.id === "withdrawals" ? pendingWithdrawals :
              item.id === "support" ? openTickets : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 group relative text-left ${
                  isActive
                    ? "bg-indigo-500/15 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-400" />
                )}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? item.bg : "bg-white/5 group-hover:bg-white/8"}`}>
                  <Icon className={`h-4 w-4 ${isActive ? item.color : "text-slate-400 group-hover:text-slate-300"}`} />
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && badge > 0 && (
                  <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t" style={{ borderColor: "hsl(220 15% 16%)" }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5">
              <LogOut className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header
          className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0 sticky top-0 z-20 backdrop-blur-xl"
          style={{
            background: "hsl(220 20% 7% / 0.9)",
            borderColor: "hsl(220 15% 16%)",
          }}
        >
          <div className="flex items-center gap-3">
            {currentNav && (
              <>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${currentNav.bg}`}>
                  <currentNav.icon className={`h-4 w-4 ${currentNav.color}`} />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-white leading-none">{currentNav.label}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Admin Panel › {currentNav.label}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Notification badge */}
            {(pendingOrders + pendingWithdrawals + openTickets) > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Bell className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">
                  {pendingOrders + pendingWithdrawals + openTickets} pending
                </span>
              </div>
            )}
            <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Link to="/dashboard">
                <Home className="mr-1.5 h-4 w-4" /> Affiliate View
              </Link>
            </Button>
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── HOME / DASHBOARD ── */}
          {activeSection === "home" && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="rounded-2xl p-6 border" style={{ background: "linear-gradient(135deg, hsl(240 40% 15%), hsl(260 35% 12%))", borderColor: "hsl(240 30% 25%)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Welcome back, Admin 👋</h2>
                    <p className="text-slate-400 mt-1 text-sm">Here's what's happening on your platform today.</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Platform Online</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Affiliates", value: stats?.active_affiliates?.toLocaleString() ?? "...", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { label: "Total Products", value: products.length.toString(), icon: Package, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
                  { label: "Orders Delivered", value: stats?.orders_delivered?.toLocaleString() ?? "...", icon: ShoppingBag, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "Commissions Paid", value: stats ? formatDZD(stats.commissions_paid) : "...", icon: Wallet, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl p-5 border ${s.border}`} style={{ background: "hsl(220 18% 11%)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                        <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* cPanel Tiles */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Access</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {NAV_ITEMS.filter((n) => n.id !== "home").map((item) => {
                    const Icon = item.icon;
                    const badge =
                      item.id === "orders" ? pendingOrders :
                      item.id === "withdrawals" ? pendingWithdrawals : 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}
                      >
                        {badge > 0 && (
                          <span className="absolute top-2 right-2 h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {badge}
                          </span>
                        )}
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.bg} group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "hsl(220 15% 18%)" }}>
                  <div>
                    <h3 className="font-semibold text-white">Recent Orders</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{orders.length} total orders</p>
                  </div>
                  <button onClick={() => setActiveSection("orders")} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid hsl(220 15% 18%)" }}>
                        {["Order ID", "Customer", "Affiliate", "Product", "Total", "Status"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-white/2 transition-colors" style={{ borderBottom: "1px solid hsl(220 15% 14%)" }}>
                          <td className="px-5 py-3 font-mono text-xs text-slate-400">{o.id.slice(0, 16)}…</td>
                          <td className="px-5 py-3 text-slate-200 font-medium">{o.customer_name}</td>
                          <td className="px-5 py-3 text-slate-200">{o.affiliate_name || "N/A"}</td>
                          <td className="px-5 py-3 text-slate-400 max-w-[160px] truncate"><ProductNameDisplay name={o.product_name} /></td>
                          <td className="px-5 py-3 text-white font-semibold">{formatDZD(o.selling_price * o.quantity)}</td>
                          <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeSection === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Products</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{products.length} products in catalog</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 bg-black/20 border-white/10 text-white h-10"
                    />
                  </div>
                  <Button
                    className="gradient-brand text-brand-foreground shadow-brand h-10 shrink-0"
                    onClick={() => setProductDialog({ open: true, product: null })}
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Add product
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "hsl(220 15% 18%)" }}>
                        <TableHead className="text-slate-500">Product</TableHead>
                        <TableHead className="text-slate-500">Category</TableHead>
                        <TableHead className="text-slate-500">Price</TableHead>
                        <TableHead className="text-slate-500">Status</TableHead>
                        <TableHead className="text-slate-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filteredProducts = products.filter(p => 
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.description?.toLowerCase().includes(productSearch.toLowerCase())
                        );

                        if (products.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                No products yet. Click "Add product" to get started.
                              </TableCell>
                            </TableRow>
                          );
                        }

                        if (filteredProducts.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                                No products found matching "{productSearch}".
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return filteredProducts.slice(0, visibleProducts).map((p) => (
                        <TableRow key={p.id} className="hover:bg-white/2" style={{ borderColor: "hsl(220 15% 14%)" }}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={getProductImage(p) ?? p.image} className="h-12 w-12 rounded-xl object-cover border border-white/10" alt="" />
                              <div>
                                <div className="font-medium text-slate-200">{p.name}</div>
                                <div className="text-xs text-slate-500 line-clamp-1 max-w-[220px]">{p.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="border-white/10 text-slate-400">{p.category}</Badge></TableCell>
                          <TableCell className="font-semibold text-indigo-400">{formatDZD(p.price)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={p.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-500"}>
                              {p.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setProductDialog({ open: true, product: p })} className="text-slate-400 hover:text-white">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-400" onClick={() => setDeleteDialog({ open: true, id: p.id, name: p.name })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                  {visibleProducts < products.length && (
                    <div className="flex justify-center p-4 border-t" style={{ borderColor: "hsl(220 15% 18%)" }}>
                      <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5" onClick={() => setVisibleProducts(v => v + 50)}>
                        Load More Products
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {activeSection === "categories" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Categories</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage product categories and subcategories</p>
              </div>
              <CategoriesTab />
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeSection === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">All Orders</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{orders.length} orders · {pendingOrders} pending</p>
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search by affiliate ID, customer, order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10 text-white h-10"
                  />
                </div>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "hsl(220 15% 18%)" }}>
                        {["Order", "ID Review", "Product", "Customer", "Affiliate", "Qty", "Base", "Total", "Commission", "Delivery", "Status", "Action", ""].map((h) => (
                          <TableHead key={h} className="text-slate-500">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filteredOrders = orders.filter(o => 
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.affiliate_id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.product_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.affiliate_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.id_commande_review?.toLowerCase().includes(orderSearch.toLowerCase())
                        );

                        if (orders.length === 0) {
                          return (
                            <TableRow><TableCell colSpan={13} className="text-center text-slate-500 py-8">No orders found.</TableCell></TableRow>
                          );
                        }

                        if (filteredOrders.length === 0) {
                          return (
                            <TableRow><TableCell colSpan={13} className="text-center text-slate-500 py-8">No orders found matching "{orderSearch}".</TableCell></TableRow>
                          );
                        }

                        return filteredOrders.slice(0, visibleOrders).map((o) => (
                        <TableRow key={o.id} className="hover:bg-white/2" style={{ borderColor: "hsl(220 15% 14%)" }}>
                          <TableCell className="font-mono text-xs text-slate-400">{o.id}</TableCell>
                          <TableCell>
                            <Input
                              defaultValue={o.id_commande_review || ""}
                              placeholder="ID..."
                              className="h-8 text-xs min-w-[100px] bg-white/5 border-white/10"
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (o.id_commande_review || "")) {
                                  updateOrder.mutate({ id: o.id, id_commande_review: val || null } as any);
                                  toast.success(`ID Review mis à jour`);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-slate-200"><ProductNameDisplay name={o.product_name} /></TableCell>
                          <TableCell className="text-slate-200">{o.customer_name}</TableCell>
                          <TableCell className="text-slate-200">{o.affiliate_name || "N/A"}</TableCell>
                          <TableCell className="text-slate-300">{o.quantity}</TableCell>
                          <TableCell className="text-slate-400">{formatDZD(o.selling_price * o.quantity - (o.commission || 0))}</TableCell>
                          <TableCell className="font-semibold text-white">{formatDZD(o.selling_price * o.quantity)}</TableCell>
                          <TableCell className="font-semibold text-emerald-400">{formatDZD(o.commission)}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize border-white/10 text-slate-400">{o.delivery_type || "N/A"}</Badge></TableCell>
                          <TableCell><StatusBadge status={o.status} /></TableCell>
                          <TableCell>
                            <Select
                              defaultValue={o.status}
                              onValueChange={(v) => {
                                if (v === "cancelled") {
                                  setCancellationReason(o.cancellation_reason || "");
                                  setCancellationDialog({ open: true, orderId: o.id, currentReason: o.cancellation_reason });
                                } else {
                                  updateOrderStatus.mutate({ id: o.id, status: v as OrderStatus });
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-[130px] bg-white/5 border-white/10 text-slate-300" disabled={updateOrderStatus.isPending}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              onClick={() => setDeleteOrderDialog({ open: true, id: o.id, label: `${o.customer_name} – ${formatProductName(o.product_name)}` })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                  {visibleOrders < orders.length && (
                    <div className="flex justify-center p-4 border-t" style={{ borderColor: "hsl(220 15% 18%)" }}>
                      <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5" onClick={() => setVisibleOrders(v => v + 50)}>
                        Load More Orders
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── AFFILIATES ── */}
          {activeSection === "affiliates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Affiliates</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{affiliates.length} affiliés inscrits</p>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Rechercher un affilié..."
                    value={affiliateSearch}
                    onChange={(e) => setAffiliateSearch(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "hsl(220 15% 18%)" }}>
                      {["Affilié", "Email", "Gains", "Inscrit le", "Statut", "Actions"].map((h) => (
                        <TableHead key={h} className={`text-slate-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredAffiliates = affiliates.filter(a =>
                        a.name?.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                        a.email?.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                        a.id?.toLowerCase().includes(affiliateSearch.toLowerCase())
                      );

                      if (filteredAffiliates.length === 0) {
                        return (
                          <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Aucun affilié trouvé.</TableCell></TableRow>
                        );
                      }

                      return filteredAffiliates.map((a) => (
                        <TableRow key={a.id} className="hover:bg-white/2" style={{ borderColor: "hsl(220 15% 14%)" }}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">
                                {a.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div>
                                <div className="font-medium text-slate-200">{a.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{a.id.slice(0, 12)}…</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400">{a.email}</TableCell>
                          <TableCell className="font-semibold text-emerald-400">{formatDZD(a.total_earnings)}</TableCell>
                          <TableCell className="text-xs text-slate-500">{new Date(a.joined).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={a.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}>
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                              title="Voir les informations"
                              onClick={() => setAffiliateInfoDialog({ open: true, affiliateId: a.id })}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Supprimer l'affilié"
                              onClick={() => setDeleteAffiliateDialog({ open: true, id: a.id, name: a.name ?? a.email ?? a.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── WITHDRAWALS ── */}
          {activeSection === "withdrawals" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Withdrawals</h2>
                <p className="text-sm text-slate-500 mt-0.5">{withdrawals.length} requests · {pendingWithdrawals} pending</p>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "hsl(220 15% 18%)" }}>
                      {["Request ID", "Affiliate", "Amount", "Method", "Account Number", "Requested", "Status", "Action"].map((h) => (
                        <TableHead key={h} className={`text-slate-500 ${h === "Action" ? "text-right" : ""}`}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-8">No withdrawals found.</TableCell></TableRow>
                    )}
                    {withdrawals.map((w) => (
                      <TableRow key={w.id} className="hover:bg-white/2" style={{ borderColor: "hsl(220 15% 14%)" }}>
                        <TableCell className="font-mono text-xs text-slate-400">{w.id.slice(0, 8)}…</TableCell>
                        <TableCell>
                          {(() => {
                            const aff = affiliates.find((a) => a.id === w.affiliate_id);
                            return (
                              <div>
                                {aff ? (
                                  <span className="text-sm font-medium text-slate-200 block">{aff.name}</span>
                                ) : (
                                  <span className="text-sm font-medium text-slate-400 italic block">Affilié Inconnu</span>
                                )}
                                {w.affiliate_id && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="font-mono text-[10px] text-slate-500">{w.affiliate_id}</span>
                                    <button
                                      type="button"
                                      className="text-slate-500 hover:text-slate-300 transition-colors"
                                      onClick={() => {
                                        navigator.clipboard.writeText(w.affiliate_id);
                                        toast.success("Affiliate ID copié");
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="font-semibold text-white">{formatDZD(w.amount)}</TableCell>
                        <TableCell className="text-slate-300">{w.method}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-300">{w.account_number || "N/A"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${w.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : w.status === "rejected" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                            {w.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 mr-1" onClick={() => setAffiliateInfoDialog({ open: true, affiliateId: w.affiliate_id })}>
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" disabled={w.status !== "pending"} onClick={() => updateWithdrawal.mutate({ id: w.id, status: "approved" })}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" disabled={w.status !== "pending"} onClick={() => updateWithdrawal.mutate({ id: w.id, status: "rejected" })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── STATISTICS ── */}
          {activeSection === "stats" && (() => {
            const validOrders = orders.filter((o) => o.status !== "cancelled");
            const deliveredOrders = orders.filter((o) => o.status === "delivered");
            const totalRevenue = validOrders.reduce((sum, o) => sum + o.selling_price * o.quantity, 0);
            const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
            const resolvedOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
            const deliveryRate = resolvedOrders.length > 0 ? (deliveredOrders.length / resolvedOrders.length) * 100 : 0;
            const wilayaCounts = orders.reduce((acc, o) => { acc[o.wilaya] = (acc[o.wilaya] || 0) + 1; return acc; }, {} as Record<string, number>);
            const topWilaya = (Object.entries(wilayaCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
            const topAffiliate = [...affiliates].sort((a, b) => b.total_earnings - a.total_earnings)[0]?.name || "N/A";
            return (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Statistics</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Platform performance overview</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Avg Order Value", value: formatDZD(avgOrderValue), icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
                    { label: "Delivery Success Rate", value: `${deliveryRate.toFixed(1)}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Top Wilaya", value: topWilaya, icon: MapPin, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    { label: "Top Affiliate", value: topAffiliate, icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border p-6 flex items-center gap-5" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                        <s.icon className={`h-7 w-7 ${s.color}`} />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">{s.label}</div>
                        <div className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className="rounded-2xl border p-5" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                  <h3 className="font-semibold text-white mb-1">Platform Activity</h3>
                  <p className="text-sm text-slate-500">Orders delivered per month.</p>
                  {earningsChart.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">No chart data yet.</div>
                  ) : (
                    <ChartContainer config={{ orders: { label: "Orders" } }} className="h-[280px] w-full mt-4">
                      <AreaChart data={earningsChart}>
                        <defs>
                          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.2} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" tick={{ fill: "#64748b" }} />
                        <YAxis tickLine={false} axisLine={false} className="text-xs" tick={{ fill: "#64748b" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="orders" stroke="#6366f1" fill="url(#cg)" strokeWidth={2.5} />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── SHIPPING ── */}
          {activeSection === "shipping" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Tarifs de Livraison</h2>
                <p className="text-sm text-slate-500 mt-0.5">Modifier les prix par wilaya (Domicile et Bureau)</p>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "hsl(220 15% 18%)" }}>
                        <TableHead className="text-slate-500 w-14">N°</TableHead>
                        <TableHead className="text-slate-500">Wilaya</TableHead>
                        <TableHead className="text-slate-500">Adresse du bureau</TableHead>
                        <TableHead className="text-slate-500"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Délai</span></TableHead>
                        <TableHead className="text-slate-500">Domicile (DZD)</TableHead>
                        <TableHead className="text-slate-500">Bureau (DZD)</TableHead>
                        <TableHead className="text-slate-500">Disponible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingShipping && (
                        <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">Chargement des tarifs...</TableCell></TableRow>
                      )}
                      {shippingRates.map((rate) => {
                        const wilayaName = WILAYAS[parseInt(rate.wilaya_id, 10) - 1] || "Inconnu";
                        return (
                          <TableRow key={rate.wilaya_id} className={`hover:bg-white/2 ${!rate.is_available ? "opacity-50" : ""}`} style={{ borderColor: "hsl(220 15% 14%)" }}>
                            <TableCell className="font-mono text-xs text-slate-500">{rate.wilaya_id}</TableCell>
                            <TableCell className="font-semibold text-slate-200">{wilayaName}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                                <Input
                                  key={`addr-${rate.wilaya_id}-${(rate as any).office_address ?? "none"}`}
                                  defaultValue={(rate as any).office_address ?? ""}
                                  placeholder="—"
                                  className="h-8 text-xs min-w-[200px] bg-white/5 border-white/10"
                                  onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val !== ((rate as any).office_address ?? "")) {
                                      updateShippingRate.mutate({ wilaya_id: rate.wilaya_id, office_address: val } as any);
                                      toast.success(`Adresse mise à jour pour ${wilayaName}`);
                                    }
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell><span className="text-xs text-slate-500 whitespace-nowrap">{(rate as any).delivery_time ?? "—"}</span></TableCell>
                            <TableCell>
                              <Input
                                key={`home-${rate.wilaya_id}-${rate.home_delivery}`}
                                type="number" defaultValue={rate.home_delivery}
                                className="w-24 h-9 bg-white/5 border-white/10"
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val !== rate.home_delivery) {
                                    updateShippingRate.mutate({ wilaya_id: rate.wilaya_id, home_delivery: val });
                                    toast.success(`Tarif domicile mis à jour pour ${wilayaName}`);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                key={`desk-${rate.wilaya_id}-${rate.desk_delivery}`}
                                type="number" defaultValue={rate.desk_delivery}
                                className="w-24 h-9 bg-white/5 border-white/10"
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val !== rate.desk_delivery) {
                                    updateShippingRate.mutate({ wilaya_id: rate.wilaya_id, desk_delivery: val });
                                    toast.success(`Tarif bureau mis à jour pour ${wilayaName}`);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                className="h-9 rounded-md border bg-white/5 border-white/10 px-3 py-1 text-sm text-slate-300"
                                defaultValue={rate.is_available ? "oui" : "non"}
                                onChange={(e) => {
                                  updateShippingRate.mutate({ wilaya_id: rate.wilaya_id, is_available: e.target.value === "oui" });
                                  toast.success(`Disponibilité mise à jour pour ${wilayaName}`);
                                }}
                              >
                                <option value="oui">Oui</option>
                                <option value="non">Non</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          {/* ── SUPPORT TICKETS ── */}
          {activeSection === "support" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Tickets de support</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {supportTickets.length} ticket{supportTickets.length !== 1 ? "s" : ""} —
                    {" "}{openTickets} ouvert{openTickets !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Ouverts", value: openTickets, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "En cours", value: supportTickets.filter((t: SupportTicket) => t.status === "in_progress").length, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Résolus", value: supportTickets.filter((t: SupportTicket) => t.status === "resolved").length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Fermés", value: supportTickets.filter((t: SupportTicket) => t.status === "closed").length, color: "text-slate-400", bg: "bg-slate-500/10" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`} style={{ borderColor: "hsl(220 15% 20%)" }}>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tickets list */}
              {supportTickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-16 text-center" style={{ borderColor: "hsl(220 15% 20%)" }}>
                  <LifeBuoy className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Aucun ticket soumis pour l'instant.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {supportTickets.map((ticket: SupportTicket) => {
                    const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string }> = {
                      open:        { label: "Ouvert",   color: "text-amber-400",  bg: "bg-amber-500/15 border-amber-500/30" },
                      in_progress: { label: "En cours", color: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30" },
                      resolved:    { label: "Résolu",   color: "text-emerald-400",bg: "bg-emerald-500/15 border-emerald-500/30" },
                      closed:      { label: "Fermé",    color: "text-slate-400",  bg: "bg-slate-500/15 border-slate-500/30" },
                    };
                    const cfg = statusConfig[ticket.status];
                    return (
                      <div
                        key={ticket.id}
                        className="rounded-2xl border p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-colors cursor-pointer"
                        style={{ background: "hsl(220 18% 12%)", borderColor: "hsl(220 15% 20%)" }}
                        onClick={() => {
                          setTicketDialog({ open: true, ticket });
                          setTicketReply(ticket.admin_reply || "");
                          setTicketStatusEdit(ticket.status);
                        }}
                      >
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="h-5 w-5 text-teal-400" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-white text-sm truncate">{ticket.subject}</span>
                            <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-1.5">{ticket.description}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[11px] text-slate-500">
                              {ticket.affiliate_name || ticket.affiliate_email || "Affilié inconnu"}
                            </span>
                            <span className="text-[11px] text-slate-600">·</span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(ticket.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            {ticket.admin_reply && (
                              <>
                                <span className="text-[11px] text-slate-600">·</span>
                                <span className="text-[11px] text-emerald-400">Répondu</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0 mt-3" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── BLACKCHAIN ── */}
          {activeSection === "blackchain" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Blackchain</h2>
                <p className="text-sm text-slate-500 mt-0.5">Section en cours de construction.</p>
              </div>
              <div className="rounded-2xl border p-12 text-center" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <Database className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Contenu de la section Blackchain à venir.</p>
              </div>
            </div>
          )}

          {/* ── SKANCARE ── */}
          {activeSection === "skancare" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Skancare</h2>
                <p className="text-sm text-slate-500 mt-0.5">Section en cours de construction.</p>
              </div>
              <div className="rounded-2xl border p-12 text-center" style={{ background: "hsl(220 18% 11%)", borderColor: "hsl(220 15% 18%)" }}>
                <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Contenu de la section Skancare à venir.</p>
              </div>
            </div>
          )}

          {/* ── IMMOBILIER ── */}
          {activeSection === "immobilier" && <ImmobilierAdminSection />}

        </main>
      </div>

      {/* ── Dialogs ── */}
      {productDialog.open && (
        <ProductDialog
          open={productDialog.open}
          editProduct={productDialog.product}
          categories={dbCategories}
          onClose={() => setProductDialog({ open: false })}
        />
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.name}</strong> from the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteDialog.id) return;
                deleteProduct.mutate(deleteDialog.id, {
                  onSuccess: () => { toast.success("Product deleted."); setDeleteDialog({ open: false }); },
                  onError: (err: any) => toast.error("Delete failed: " + err.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOrderDialog.open} onOpenChange={(open) => !open && setDeleteOrderDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order for <strong>{deleteOrderDialog.label}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteOrderDialog.id) return;
                deleteOrder.mutate(deleteOrderDialog.id, {
                  onSuccess: () => { toast.success("Order deleted."); setDeleteOrderDialog({ open: false }); },
                  onError: (err: any) => toast.error("Delete failed: " + err.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Ticket Response Dialog ── */}
      <Dialog
        open={ticketDialog.open}
        onOpenChange={(open) => !open && setTicketDialog({ open: false })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-teal-400" />
              Ticket : {ticketDialog.ticket?.subject}
            </DialogTitle>
          </DialogHeader>

          {ticketDialog.ticket && (
            <div className="space-y-4 py-2">
              {/* Affiliate info */}
              <div className="rounded-xl bg-muted/50 p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Affilié</p>
                <p className="text-sm font-semibold">
                  {ticketDialog.ticket.affiliate_name || "Inconnu"}
                </p>
                {ticketDialog.ticket.affiliate_email && (
                  <p className="text-xs text-muted-foreground">{ticketDialog.ticket.affiliate_email}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(ticketDialog.ticket.created_at).toLocaleDateString("fr-DZ", {
                    day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Messages History */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {/* Description initiale */}
                <div className="rounded-xl bg-muted/40 border border-border/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[10px] font-bold">A</span>
                    </div>
                    <span className="text-xs font-semibold">Affilié</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {ticketDialog.ticket.description}
                  </p>
                </div>

                {/* Ancienne réponse admin */}
                {ticketDialog.ticket.admin_reply && (
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 ml-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">S</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">Support Admin</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {ticketDialog.ticket.admin_reply}
                    </p>
                  </div>
                )}

                {/* Nouveaux messages */}
                {ticketDialog.ticket.messages?.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${
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
                          {msg.role === "admin" ? "S" : "A"}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          msg.role === "admin" ? "text-primary" : ""
                        }`}
                      >
                        {msg.role === "admin" ? "Support Admin" : "Affilié"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="ticket-status-admin">Statut</Label>
                <select
                  id="ticket-status-admin"
                  value={ticketStatusEdit}
                  onChange={(e) => setTicketStatusEdit(e.target.value as TicketStatus)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="open">Ouvert</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              {/* Admin reply */}
              <div className="space-y-2">
                <Label htmlFor="ticket-reply-admin">Nouvelle réponse</Label>
                <Textarea
                  id="ticket-reply-admin"
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  placeholder="Rédigez une nouvelle réponse…"
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setTicketDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button
              className="gradient-brand text-brand-foreground shadow-brand"
              disabled={updateTicket.isPending}
              onClick={() => {
                if (!ticketDialog.ticket) return;
                
                let updatedMessages = ticketDialog.ticket.messages || [];
                if (ticketReply.trim()) {
                  updatedMessages = [
                    ...updatedMessages,
                    {
                      role: "admin",
                      content: ticketReply.trim(),
                      created_at: new Date().toISOString(),
                    },
                  ];
                }

                updateTicket.mutate(
                  {
                    id: ticketDialog.ticket.id,
                    status: ticketStatusEdit,
                    messages: updatedMessages,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Ticket mis à jour !");
                      setTicketDialog({ open: false });
                    },
                    onError: (err: any) => toast.error("Erreur : " + err.message),
                  }
                );
              }}
            >
              {updateTicket.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SendHorizontal className="h-4 w-4" />
                  Enregistrer la réponse
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={affiliateInfoDialog.open} onOpenChange={(open) => setAffiliateInfoDialog({ open, affiliateId: null })}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Affiliate Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const aff = affiliates.find(a => a.id === affiliateInfoDialog.affiliateId);
              if (!aff) return <div className="text-slate-400 text-center">Affiliate not found</div>;
              return (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-200">{aff.id}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(aff.id);
                          toast.success("Affiliate ID copié");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</span>
                    <span className="text-sm text-slate-200">{aff.first_name} {aff.last_name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
                    <span className="text-sm text-slate-200">{aff.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</span>
                    <span className="text-sm text-slate-200">{aff.phone || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wilaya / Commune</span>
                    <span className="text-sm text-slate-200">{aff.wilaya || "N/A"} {aff.commune ? `- ${aff.commune}` : ""}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined At</span>
                    <span className="text-sm text-slate-200">{new Date(aff.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payout Method</span>
                    <span className="text-sm text-emerald-400 font-medium">{aff.payout_method || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</span>
                    <span className="text-sm font-mono text-slate-300">{aff.account_number || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accès Immobilier (2000 DA)</span>
                      <span className={`text-sm font-medium ${aff.immobilier_unlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {aff.immobilier_unlocked ? 'Débloqué' : 'Verrouillé'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={aff.immobilier_unlocked ? "outline" : "default"}
                      className={!aff.immobilier_unlocked ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "border-slate-700 text-slate-300 hover:text-white"}
                      onClick={() => {
                        unlockImmobilier.mutate({ id: aff.id, unlock: !aff.immobilier_unlocked }, {
                          onSuccess: () => toast.success(aff.immobilier_unlocked ? "Accès verrouillé" : "Accès débloqué"),
                          onError: (err) => toast.error("Erreur: " + err.message)
                        });
                      }}
                      disabled={unlockImmobilier.isPending}
                    >
                      {unlockImmobilier.isPending ? "..." : aff.immobilier_unlocked ? "Verrouiller" : "Débloquer"}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAffiliateInfoDialog({ open: false })} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE AFFILIATE DIALOG ── */}
      <AlertDialog open={deleteAffiliateDialog.open} onOpenChange={(open) => !open && setDeleteAffiliateDialog({ open: false })}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              Supprimer l'affilié
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Voulez-vous vraiment supprimer <span className="font-semibold text-slate-200">{deleteAffiliateDialog.name}</span> de la base de données ?<br />
              Cette action est <span className="text-rose-400 font-semibold">irréversible</span> et supprimera toutes les données associées à cet affilié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500 text-white border-0"
              disabled={deleteAffiliate.isPending}
              onClick={() => {
                if (!deleteAffiliateDialog.id) return;
                deleteAffiliate.mutate(deleteAffiliateDialog.id, {
                  onSuccess: () => {
                    toast.success(`Affilié "${deleteAffiliateDialog.name}" supprimé avec succès.`);
                    setDeleteAffiliateDialog({ open: false });
                  },
                  onError: (err: any) => toast.error("Erreur lors de la suppression : " + err.message),
                });
              }}
            >
              {deleteAffiliate.isPending ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── CANCELLATION REASON DIALOG ── */}
      <Dialog
        open={cancellationDialog.open}
        onOpenChange={(open) => {
          if (!open) setCancellationDialog({ open: false });
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-400" />
              Annuler la commande
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-400">
              Veuillez indiquer le motif d'annulation. Ce message sera affiché à l'affilié.
            </p>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Motif d'annulation <span className="text-rose-400">*</span></Label>
              <Textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ex : Adresse incorrecte, client injoignable, produit en rupture de stock…"
                className="min-h-[100px] bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 resize-none focus-visible:ring-rose-500/30"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-white/5"
              onClick={() => setCancellationDialog({ open: false })}
            >
              Retour
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-500 text-white border-0"
              disabled={!cancellationReason.trim() || updateOrderStatus.isPending}
              onClick={() => {
                if (!cancellationDialog.orderId || !cancellationReason.trim()) return;
                updateOrderStatus.mutate(
                  {
                    id: cancellationDialog.orderId,
                    status: "cancelled",
                    cancellation_reason: cancellationReason.trim(),
                  },
                  {
                    onSuccess: () => {
                      toast.success("Commande annulée avec motif enregistré.");
                      setCancellationDialog({ open: false });
                      setCancellationReason("");
                    },
                    onError: (err: any) => toast.error("Erreur : " + err.message),
                  }
                );
              }}
            >
              {updateOrderStatus.isPending ? "Annulation…" : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}


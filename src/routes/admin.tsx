import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/shared";
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
  useUpdateWithdrawalStatus,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  formatDZD,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useShippingRates,
  useUpdateShippingRate,
} from "@/lib/queries";
import { WILAYAS } from "@/lib/constants";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, OrderStatus, Category } from "@/lib/supabase";
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
                    {(cat.subcategories || []).map((sub, idx) => (
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
                            const newSubs = (cat.subcategories || []).filter((s) => s !== sub);
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

// ─── Admin Panel ─────────────────────────────────────────────────────────────

function AdminPanel() {
  const { data: stats } = usePlatformStats();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: affiliates = [] } = useAffiliates();
  const { data: withdrawals = [] } = useWithdrawals();
  const { data: earningsChart = [] } = useEarningsChart();

  const updateOrder = useUpdateOrderStatus();
  const updateWithdrawal = useUpdateWithdrawalStatus();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { data: shippingRates = [], isLoading: isLoadingShipping } = useShippingRates();
  const updateShippingRate = useUpdateShippingRate();

  const { data: dbCategories = [] } = useCategories();

  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: Product | null }>({
    open: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <Badge variant="outline" className="border-navy/30 text-primary font-semibold">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to affiliate
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" /> Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        <PageHeader
          title="Admin Panel"
          subtitle="Manage products, orders, affiliates and withdrawals."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active affiliates"
            value={stats ? stats.active_affiliates.toLocaleString() : "..."}
            icon={Users}
            tone="brand"
          />
          <StatCard label="Products" value={products.length.toString()} icon={Package} />
          <StatCard
            label="Orders delivered"
            value={stats ? stats.orders_delivered.toLocaleString() : "..."}
            icon={ShoppingBag}
            tone="success"
          />
          <StatCard
            label="Commissions paid"
            value={stats ? formatDZD(stats.commissions_paid) : "..."}
            icon={Wallet}
            tone="warning"
          />
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-card border p-1 h-11 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="shipping">Tarifs Livraison</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold" dir="auto">
                Platform activity
              </h2>
              <p className="text-sm text-muted-foreground">Orders delivered per month.</p>
              {earningsChart.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
                  No chart data yet.
                </div>
              ) : (
                <ChartContainer
                  config={{ orders: { label: "Orders" } }}
                  className="h-[320px] w-full mt-4"
                >
                  <AreaChart data={earningsChart}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--brand-glow)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--brand-glow)"
                      fill="url(#ag)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>
          </TabsContent>

          {/* ── Products ── */}
          <TabsContent value="products" className="mt-4">
            <div className="rounded-2xl border bg-card">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold" dir="auto">
                    Products
                  </h2>
                  <p className="text-sm text-muted-foreground">{products.length} total</p>
                </div>
                <Button
                  className="gradient-brand text-brand-foreground shadow-brand"
                  onClick={() => setProductDialog({ open: true, product: null })}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add product
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                          No products yet. Click "Add product" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              className="h-12 w-12 rounded-xl object-cover border"
                              alt=""
                            />
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                                {p.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatDZD(p.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              p.is_active
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {p.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductDialog({ open: true, product: p })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteDialog({ open: true, id: p.id, name: p.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Categories ── */}
          <TabsContent value="categories" className="mt-4">
            <CategoriesTab />
          </TabsContent>

          {/* ── Orders ── */}
          <TabsContent value="orders" className="mt-4">
            <div className="rounded-2xl border bg-card">
              <div className="p-5">
                <h2 className="font-semibold" dir="auto">
                  All orders
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                    {orders.slice(0, 10).map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell>{o.product_name}</TableCell>
                        <TableCell>{o.customer_name}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell>
                          {formatDZD(o.selling_price * o.quantity - (o.commission || 0))}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatDZD(o.selling_price * o.quantity)}
                        </TableCell>
                        <TableCell className="font-semibold text-success">
                          {formatDZD(o.commission)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {o.delivery_type || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={o.status}
                            onValueChange={(v) =>
                              updateOrder.mutate({ id: o.id, status: v as OrderStatus })
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-[130px]"
                              disabled={updateOrder.isPending}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(
                                [
                                  "pending",
                                  "confirmed",
                                  "shipped",
                                  "delivered",
                                  "cancelled",
                                ] as OrderStatus[]
                              ).map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Affiliates ── */}
          <TabsContent value="affiliates" className="mt-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No affiliates found.
                      </TableCell>
                    </TableRow>
                  )}
                  {affiliates.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                      <TableCell className="font-semibold">{formatDZD(a.total_earnings)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Withdrawals ── */}
          <TabsContent value="withdrawals" className="mt-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No withdrawals found.
                      </TableCell>
                    </TableRow>
                  )}
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.id}</TableCell>
                      <TableCell className="font-semibold">{formatDZD(w.amount)}</TableCell>
                      <TableCell>{w.method}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(w.requested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success"
                          disabled={w.status !== "pending"}
                          onClick={() => updateWithdrawal.mutate({ id: w.id, status: "approved" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={w.status !== "pending"}
                          onClick={() => updateWithdrawal.mutate({ id: w.id, status: "rejected" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Statistics ── */}
          <TabsContent value="stats" className="mt-4">
            {(() => {
              const validOrders = orders.filter((o) => o.status !== "cancelled");
              const deliveredOrders = orders.filter((o) => o.status === "delivered");
              const totalRevenue = validOrders.reduce(
                (sum, o) => sum + o.selling_price * o.quantity,
                0,
              );
              const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
              const resolvedOrders = orders.filter(
                (o) => o.status === "delivered" || o.status === "cancelled",
              );
              const deliveryRate =
                resolvedOrders.length > 0
                  ? (deliveredOrders.length / resolvedOrders.length) * 100
                  : 0;
              const wilayaCounts = orders.reduce(
                (acc, o) => {
                  acc[o.wilaya] = (acc[o.wilaya] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              );
              const topWilaya =
                Object.entries(wilayaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
              const topAffiliate =
                [...affiliates].sort((a, b) => b.total_earnings - a.total_earnings)[0]?.name ||
                "N/A";

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Avg order value</div>
                    <div className="mt-2 text-3xl font-bold text-gradient-brand">
                      {formatDZD(avgOrderValue)}
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Delivery success rate</div>
                    <div className="mt-2 text-3xl font-bold text-gradient-brand">
                      {deliveryRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Top wilaya</div>
                    <div className="mt-2 text-3xl font-bold text-primary">{topWilaya}</div>
                  </div>
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Top affiliate</div>
                    <div className="mt-2 text-3xl font-bold text-primary">{topAffiliate}</div>
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          {/* ── Shipping Rates ── */}
          <TabsContent value="shipping" className="mt-4">
            <div className="rounded-2xl border bg-card">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold" dir="auto">
                    Tarifs de livraison
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Modifier les prix de livraison par wilaya (Domicile et Bureau).
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">N°</TableHead>
                      <TableHead>Wilaya</TableHead>
                      <TableHead>Adresse du bureau</TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Délai
                        </span>
                      </TableHead>
                      <TableHead>Domicile (DZD)</TableHead>
                      <TableHead>Bureau (DZD)</TableHead>
                      <TableHead>Disponible</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingShipping && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          Chargement des tarifs...
                        </TableCell>
                      </TableRow>
                    )}
                    {shippingRates.map((rate) => {
                      const wilayaName = WILAYAS[parseInt(rate.wilaya_id, 10) - 1] || "Inconnu";
                      return (
                        <TableRow
                          key={rate.wilaya_id}
                          className={!rate.is_available ? "opacity-50" : ""}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {rate.wilaya_id}
                          </TableCell>
                          <TableCell className="font-semibold">{wilayaName}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                              <Input
                                key={`addr-${rate.wilaya_id}-${(rate as any).office_address ?? "none"}`}
                                defaultValue={(rate as any).office_address ?? ""}
                                placeholder="—"
                                className="h-8 text-xs min-w-[240px]"
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (val !== ((rate as any).office_address ?? "")) {
                                    updateShippingRate.mutate({
                                      wilaya_id: rate.wilaya_id,
                                      office_address: val,
                                    } as any);
                                    toast.success(`Adresse mise à jour pour ${wilayaName}`);
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {(rate as any).delivery_time ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`home-${rate.wilaya_id}-${rate.home_delivery}`}
                              type="number"
                              defaultValue={rate.home_delivery}
                              className="w-24 h-9"
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== rate.home_delivery) {
                                  updateShippingRate.mutate({
                                    wilaya_id: rate.wilaya_id,
                                    home_delivery: val,
                                  });
                                  toast.success(`Tarif domicile mis à jour pour ${wilayaName}`);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`desk-${rate.wilaya_id}-${rate.desk_delivery}`}
                              type="number"
                              defaultValue={rate.desk_delivery}
                              className="w-24 h-9"
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== rate.desk_delivery) {
                                  updateShippingRate.mutate({
                                    wilaya_id: rate.wilaya_id,
                                    desk_delivery: val,
                                  });
                                  toast.success(`Tarif bureau mis à jour pour ${wilayaName}`);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                              defaultValue={rate.is_available ? "oui" : "non"}
                              onChange={(e) => {
                                const isAvail = e.target.value === "oui";
                                updateShippingRate.mutate({
                                  wilaya_id: rate.wilaya_id,
                                  is_available: isAvail,
                                });
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
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Product Dialog (Add/Edit) ── */}
      {productDialog.open && (
        <ProductDialog
          open={productDialog.open}
          editProduct={productDialog.product}
          categories={dbCategories}
          onClose={() => setProductDialog({ open: false })}
        />
      )}

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.name}</strong> from the catalog.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteDialog.id) return;
                deleteProduct.mutate(deleteDialog.id, {
                  onSuccess: () => {
                    toast.success("Product deleted.");
                    setDeleteDialog({ open: false });
                  },
                  onError: (err: any) => toast.error("Delete failed: " + err.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

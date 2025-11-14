"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useForm,
  FormProvider,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CategoryInput, categorySchema } from "@/lib/validation/categorySchema";
import { Trash2, Edit, Plus, X, FolderOpen, FolderTree } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeleteItem } from "@/hooks/useDeleteItem";

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

interface Category {
  _id: string;
  name: string;
  parent?: { _id: string; name: string };
  properties: { name: string; values: string[] }[];
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", parentCategory: "", properties: [] },
  });

  const { control, handleSubmit, reset, register, formState } = form;
  const { isDirty } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  // ──────────────────────────────────────────────
  // FETCH CATEGORIES
  // ──────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Category[]>("/api/categories");
      setCategories(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch categories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ──────────────────────────────────────────────
  // DELETE HOOK
  // ──────────────────────────────────────────────
  const { handleDelete, isDeleting } = useDeleteItem({
    resource: "categories",
    onDeleted: fetchCategories,
  });

  // ──────────────────────────────────────────────
  // FORM HANDLERS
  // ──────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setEditedCategory(null);
    reset({ name: "", parentCategory: "", properties: [] });
  }, [reset]);

  const editCategory = useCallback(
    (category: Category) => {
      setEditedCategory(category);
      reset({
        name: category.name,
        parentCategory: category.parent?._id || "none",
        properties: category.properties.map((p) => ({
          name: p.name,
          values: p.values.join(", "),
        })),
      });
    },
    [reset]
  );

  const onSubmit: SubmitHandler<CategoryInput> = async (data) => {
    try {
      setIsSubmitting(true);
      const parsedProperties = (data.properties ?? []).map((p) => ({
        ...p,
        values: Array.isArray(p.values)
          ? p.values
          : typeof p.values === "string" && p.values.length > 0
          ? p.values.split(",").map((v) => v.trim())
          : [],
      }));

      const payload = {
        name: data.name.trim().toLowerCase(),
        parentCategory:
          data.parentCategory === "none" ? null : data.parentCategory,
        properties: parsedProperties,
      };

      if (editedCategory) {
        await axios.put("/api/categories", {
          ...payload,
          _id: editedCategory._id,
        });
        toast({
          title: "Updated",
          description: "Category updated successfully.",
        });
      } else {
        await axios.post("/api/categories", payload);
        toast({
          title: "Created",
          description: "Category created successfully.",
        });
      }

      resetForm();
      fetchCategories();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save category.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────
  // TABLE + BATCH LOGIC
  // ──────────────────────────────────────────────
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === categories.length ? [] : categories.map((c) => c._id)
    );
  }, [categories]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    await handleDelete(
      selectedIds.join(","),
      `${selectedIds.length} categories`
    );
    setSelectedIds([]);
  }, [selectedIds, handleDelete]);

  const getSubcategoriesCount = (categoryId: string) =>
    categories.filter((c) => c.parent?._id === categoryId).length;

  const getPropertyCount = (category: Category) =>
    category.properties?.length || 0;

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage product categories and their properties.
            </p>
          </div>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              className="gap-2"
              disabled={isDeleting !== null}
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* FORM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editedCategory ? (
                  <>
                    <Edit className="h-5 w-5" />
                    Edit Category
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Category
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Electronics"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="parentCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No parent</SelectItem>
                            {categories
                              .filter(
                                (c) =>
                                  !editedCategory ||
                                  c._id !== editedCategory._id
                              )
                              .map((c) => (
                                <SelectItem key={c._id} value={c._id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PROPERTIES */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <FormLabel>Properties</FormLabel>
                      <Badge variant="outline">
                        {fields.length} propert
                        {fields.length === 1 ? "y" : "ies"}
                      </Badge>
                    </div>

                    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                      {fields.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No properties added yet</p>
                        </div>
                      ) : (
                        fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex gap-3 items-start p-3 bg-background rounded-lg border"
                          >
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Property name (e.g. Color)"
                                {...register(`properties.${index}.name`)}
                                disabled={isSubmitting}
                              />
                              <Input
                                placeholder="Values (comma separated)"
                                {...register(`properties.${index}.values`)}
                                disabled={isSubmitting}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => append({ name: "", values: "" })}
                        disabled={isSubmitting}
                      >
                        <Plus size={16} />
                        Add Property
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {editedCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className={`gap-2 text-sm lg:text-base bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100 ${
                        editedCategory ? "flex-1" : "w-full"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : editedCategory ? (
                        <>
                          <Edit size={16} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Create
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>

          {/* CATEGORY LIST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" /> All Categories
                <Badge variant="secondary">{categories.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            categories.length > 0 &&
                            selectedIds.length === categories.length
                          }
                          onCheckedChange={toggleSelectAll}
                          disabled={isLoading || categories.length === 0}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead className="text-center">Properties</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8 mx-auto" />
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">
                            No categories found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((cat) => (
                        <TableRow
                          key={cat._id}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(cat._id)}
                              onCheckedChange={() => toggleSelection(cat._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            {cat.name}
                            {getSubcategoriesCount(cat._id) > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {getSubcategoriesCount(cat._id)} sub
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {cat.parent ? (
                              cat.parent.name
                            ) : (
                              <span className="text-muted-foreground">–</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {getPropertyCount(cat)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editCategory(cat)}
                              className="h-8 w-8"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(cat._id, cat.name)}
                              disabled={isDeleting === cat._id}
                              className="h-8 w-8"
                            >
                              {isDeleting === cat._id ? (
                                <div className="animate-spin">
                                  <X className="h-4 w-4" />
                                </div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

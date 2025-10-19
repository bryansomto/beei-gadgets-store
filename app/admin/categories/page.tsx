"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { SweetAlertResult } from "sweetalert2";
import Layout from "../components/Layout";
import { Label } from "@/components/ui/label";
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

interface Category {
  _id: string;
  name: string;
  parent?: {
    _id: string;
    name: string;
  };
  properties: {
    name: string;
    values: string[];
  }[];
}

interface CategoriesProps {
  swal: {
    fire: (options: any) => Promise<SweetAlertResult>;
  };
}

function Categories({ swal }: CategoriesProps) {
  const { toast } = useToast();
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      parentCategory: "",
      properties: [],
    },
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Category[]>("/api/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onSubmit: SubmitHandler<CategoryInput> = async (data) => {
    try {
      setIsSubmitting(true);
      const parsedProperties = (data.properties || []).map((p) => ({
        ...p,
        values: Array.isArray(p.values)
          ? p.values
          : p.values.split(",").map((v) => v.trim()),
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
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await axios.post("/api/categories", payload);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setEditedCategory(null);
    reset({
      name: "",
      parentCategory: "",
      properties: [],
    });
  }, [reset]);

  const editCategory = useCallback(
    (category: Category) => {
      setEditedCategory(category);
      reset({
        name: category.name,
        parentCategory: category.parent?._id || "",
        properties: category.properties.map((p) => ({
          name: p.name,
          values: p.values.join(", "),
        })),
      });
    },
    [reset]
  );

  const deleteSelectedCategories = useCallback(
    async (ids: string[]) => {
      try {
        await axios.delete("/api/categories", { data: { ids } });
        setSelectedIds([]);
        fetchCategories();
        toast({
          title: "Success",
          description: "Categories deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete categories", error);
        toast({
          title: "Error",
          description: "Failed to delete categories",
          variant: "destructive",
        });
      }
    },
    [fetchCategories, toast]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === categories.length ? [] : categories.map((cat) => cat._id)
    );
  }, [categories]);

  const deleteCategory = useCallback(
    (category: Category) => {
      swal
        .fire({
          title: "Are you sure?",
          text: `Do you want to delete "${category.name}"? This action cannot be undone.`,
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Delete",
          confirmButtonColor: "#E7000B",
          reverseButtons: true,
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            try {
              await axios.delete("/api/categories", {
                data: { ids: [category._id] },
              });
              fetchCategories();
              toast({
                title: "Success",
                description: "Category deleted successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to delete category",
                variant: "destructive",
              });
            }
          }
        });
    },
    [fetchCategories, swal, toast]
  );

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.length === 0) return;

    swal
      .fire({
        title: "Are you sure?",
        text: `You are about to delete ${selectedIds.length} categor${
          selectedIds.length === 1 ? "y" : "ies"
        }. This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: `Delete ${selectedIds.length}`,
        confirmButtonColor: "#E7000B",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteSelectedCategories(selectedIds);
        }
      });
  }, [deleteSelectedCategories, selectedIds.length, swal]);

  const getCategoryPropertiesCount = (category: Category) => {
    return category.properties?.length || 0;
  };

  const getSubcategoriesCount = (categoryId: string) => {
    return categories.filter((cat) => cat.parent?._id === categoryId).length;
  };

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage product categories and their properties
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              className="gap-2"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Category Form */}
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
                    Create New Category
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Electronics, Clothing"
                              {...field}
                              disabled={isSubmitting}
                              className="w-full"
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
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">
                                No parent (Root category)
                              </SelectItem>
                              {categories
                                .filter(
                                  (cat) =>
                                    !editedCategory ||
                                    cat._id !== editedCategory._id
                                )
                                .map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    {cat.name.charAt(0).toUpperCase() +
                                      cat.name.slice(1)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Properties Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
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
                                  placeholder="Property name (e.g. Color, Size)"
                                  {...register(`properties.${index}.name`)}
                                  disabled={isSubmitting}
                                />
                                <Input
                                  placeholder="Values (comma separated, e.g. Red, Blue, Green)"
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
                                className="mt-1"
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
                      className={`gap-2 ${
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
                          <Edit size={16} />
                          Update Category
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Create Category
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                All Categories
                <Badge variant="secondary" className="ml-2">
                  {categories.length}
                </Badge>
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
                          <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <div className="space-y-2">
                            <p className="text-muted-foreground font-medium">
                              No categories found
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Create your first category to get started
                            </p>
                          </div>
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
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-muted-foreground" />
                              {cat.name.charAt(0).toUpperCase() +
                                cat.name.slice(1)}
                              {getSubcategoriesCount(cat._id) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {getSubcategoriesCount(cat._id)} sub
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {cat.parent ? (
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {cat.parent.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryPropertiesCount(cat)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                onClick={() => deleteCategory(cat)}
                                className="h-8 w-8"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
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

export default withSwal(Categories);

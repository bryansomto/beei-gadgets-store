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
import { Trash2, Edit, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

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
  }, []);

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
    [fetchCategories]
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
          text: `Do you want to delete "${category.name}"?`,
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
    [fetchCategories, swal]
  );

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.length === 0) return;

    swal
      .fire({
        title: "Are you sure?",
        text: `You are about to delete ${selectedIds.length} categories. This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: `Delete (${selectedIds.length})`,
        confirmButtonColor: "#E7000B",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteSelectedCategories(selectedIds);
        }
      });
  }, [deleteSelectedCategories, selectedIds.length, swal]);

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categories</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Label className="text-lg">
              {editedCategory
                ? `Edit Category: ${editedCategory.name}`
                : "Create New Category"}
            </Label>

            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
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
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Properties</FormLabel>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Property name (e.g. Color, Size)"
                            {...register(`properties.${index}.name`)}
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Values (comma separated, e.g. Red,Blue,Green)"
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
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => append({ name: "", values: "" })}
                      disabled={isSubmitting}
                    >
                      <Plus size={16} />
                      Add Property
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {editedCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      "Processing..."
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
          </div>

          <div className="space-y-4">
            <Label className="text-lg">All Categories</Label>
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
                        <TableCell className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat) => (
                      <TableRow key={cat._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(cat._id)}
                            onCheckedChange={() => toggleSelection(cat._id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </TableCell>
                        <TableCell>{cat.parent?.name || "-"}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editCategory(cat)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteCategory(cat)}
                          >
                            <Trash2 size={16} />
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
      </div>
    </Layout>
  );
}

export default withSwal(Categories);

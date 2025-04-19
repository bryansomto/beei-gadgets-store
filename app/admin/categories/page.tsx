"use client";

import { useEffect, useState } from "react";
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
import { Trash2 } from "lucide-react";

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
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get<Category[]>("/api/categories").then((res) => {
      setCategories(res.data);
    });
  }

  const onSubmit: SubmitHandler<CategoryInput> = (data) => {
    const parsedProperties = (data.properties || []).map((p) => ({
      ...p,
      values: Array.isArray(p.values)
        ? p.values
        : p.values.split(",").map((v) => v.trim()),
    }));

    const payload = {
      name: data.name,
      parentCategory:
        data.parentCategory === "none" ? null : data.parentCategory,
      properties: parsedProperties,
    };

    if (editedCategory) {
      (payload as any)._id = editedCategory._id;
      axios
        .put("/api/categories", payload)
        .then(() => {
          resetForm();
          fetchCategories();
        })
        .catch((error) => {
          console.error("Error updating category:", error);
        });
    } else {
      axios
        .post("/api/categories", payload)
        .then(() => {
          resetForm();
          fetchCategories();
        })
        .catch((error) => {
          console.error("Error creating category:", error);
        });
    }
  };

  function resetForm() {
    setEditedCategory(null);
    reset({
      name: "",
      parentCategory: "",
      properties: [],
    });
  }

  function editCategory(category: Category) {
    setEditedCategory(category);
    reset({
      name: category.name,
      parentCategory: category.parent?._id || "",
      properties: category.properties.map((p) => ({
        name: p.name,
        values: p.values.join(", "),
      })),
    });
  }

  async function deleteSelectedCategories(ids: string[]) {
    try {
      await axios.delete("/api/categories", {
        data: { ids },
      });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete categories", error);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function deleteCategory(category: Category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#E7000B",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete("/api/categories", {
            data: { ids: [category._id] },
          });
          fetchCategories();
        }
      });
  }

  async function handleBatchDelete() {
    if (selectedIds.length > 0) {
      swal
        .fire({
          title: "Are you sure?",
          text: `Delete ${selectedIds.length} categories?`,
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Yes, Delete!",
          confirmButtonColor: "#E7000B",
          reverseButtons: true,
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await deleteSelectedCategories(selectedIds);
          }
        });
    }
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <Label>
        {editedCategory
          ? `Edit category: ${editedCategory.name}`
          : "Create new category"}
      </Label>

      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-4"
        >
          {/* Name */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category name</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent category */}
          <FormField
            control={control}
            name="parentCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No parent category" />
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

          {/* Properties */}
          <FormField
            control={control}
            name="properties"
            render={() => (
              <FormItem>
                <FormLabel>Properties</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ name: "", values: "" })}
                    >
                      Add Property
                    </Button>
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-1">
                        <Input
                          placeholder="Property name"
                          {...register(`properties.${index}.name`)}
                        />
                        <Input
                          placeholder="Values (comma-separated)"
                          {...register(`properties.${index}.values`)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-2">
            {editedCategory && (
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel
              </Button>
            )}
            <Button type="submit" className="w-full">
              {editedCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Table */}
      {!editedCategory && (
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-xl">
            <Table className="mx-auto">
              <TableHeader>
                {/* Bulk Delete */}
                <div className="flex gap-2 mt-6 mb-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    onClick={handleBatchDelete}
                    disabled={selectedIds.length === 0}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === categories.length}
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === categories.length
                            ? []
                            : categories.map((cat) => cat._id)
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cat._id)}
                        onChange={() => toggleSelection(cat._id)}
                      />
                    </TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.parent?.name || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => editCategory(cat)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCategory(cat)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }: { swal: any }) => (
  <Categories swal={swal} />
));

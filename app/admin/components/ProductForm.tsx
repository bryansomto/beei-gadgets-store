import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { ReactSortable } from "react-sortablejs";
import { HashLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import colors from "@/lib/colors/swalAlerts";
import { ProductFormData, productSchema } from "@/lib/validation/productSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  _id: string;
  name: string;
  properties: Property[];
  parent?: Category;
}

interface Property {
  _id: string;
  name: string;
  values: string[];
}

interface ProductFormProps {
  _id?: string;
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  properties?: Record<string, string>;
  onSave?: (data: ProductFormData) => void; // Optional callback
}

export default function ProductForm({
  _id,
  name: existingName = "",
  description: existingDescription = "",
  price: existingPrice = 0,
  images: existingImages = [],
  category: assignedCategory = "",
  properties: assignedProperties = {},
  onSave,
}: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: existingName,
      category: assignedCategory,
      description: existingDescription,
      price: existingPrice,
      images: existingImages,
      properties: Object.entries(assignedProperties).map(([name, value]) => ({
        name,
        values: [value],
      })),
    },
    resolver: zodResolver(productSchema),
  });

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = form;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    axios.get<Category[]>("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  const propertiesToFill: Property[] = [];
  if (categories.length > 0 && form.watch("category")) {
    let catInfo = categories.find(({ _id }) => _id === form.watch("category"));
    if (catInfo) {
      propertiesToFill.push(...catInfo.properties);
      while (catInfo?.parent?._id) {
        const parentCat = categories.find(
          ({ _id }) => _id === catInfo?.parent?._id
        );
        if (parentCat) {
          propertiesToFill.push(...parentCat.properties);
          catInfo = parentCat;
        }
      }
    }
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        price:
          typeof data.price === "string" ? parseFloat(data.price) : data.price,
      };

      // 2. Format properties
      const formattedProperties = Object.entries(data.properties || {}).map(
        ([name, value]) => ({
          name: name.trim(),
          values: Array.isArray(value)
            ? value.map((v) => v.trim()).filter((v) => v)
            : [String(value).trim()].filter((v) => v),
        })
      );

      // 3. Prepare complete product data
      const productData = {
        name: data.name.trim(),
        category: data.category,
        description: data.description.trim(),
        price: typeof data.price === "number" ? data.price : 0,
        // priceVariants: completePriceVariants,
        images: data.images || [],
        properties: formattedProperties,
        ...(_id && { _id }), // Only include _id if it exists
      };

      // 4. Validate required fields
      if (!productData.name) {
        throw new Error("Product name is required");
      }
      if (!productData.category) {
        throw new Error("Category is required");
      }
      if (productData.images.length === 0) {
        throw new Error("At least one image is required");
      }

      // 5. Make API request
      const response = _id
        ? await axios.put("/api/products", productData)
        : await axios.post("/api/products", productData);

      // 6. Show success message
      await Swal.fire({
        icon: "success",
        title: "Product saved!",
        showConfirmButton: false,
        timer: 1500,
      });

      // 7. Execute onSave callback with properly typed properties
      if (onSave) {
        onSave({
          ...productData,
          properties: productData.properties.map((p) => ({
            name: p.name,
            values: p.values, // Already in string[] format
          })),
        });
      }

      // 8. Reset form for new products
      if (!_id) {
        setTimeout(() => {
          form.reset();
          setValue("images", []);
          // setValue("priceVariants", []);
        }, 1600);
      }
    } catch (error) {
      console.error("Error saving product:", error);

      let errorMessage = "Failed to save product. Please try again.";

      // Type-safe error handling
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: colors.red,
      });
    }
  };

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const fileInput = {
      target: {
        files,
      },
    } as unknown as ChangeEvent<HTMLInputElement>;
    uploadImages(fileInput);
  }

  async function uploadImages(ev: ChangeEvent<HTMLInputElement>) {
    const files = ev.target?.files;
    if ((files ?? []).length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files || []) {
        data.append("file", file);
      }

      try {
        const res = await axios.post("/api/upload", data, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percent);
          },
        });
        setValue("images", [...watch("images"), ...res.data.links]);
        Swal.fire({
          title: "Upload Complete",
          text: "Image successfully uploaded",
          icon: "success",
          confirmButtonColor: colors.green,
        });
      } catch (err) {
        console.error("Upload error", err);
        Swal.fire({
          title: "Upload failed",
          text: "Please try again",
          icon: "error",
          confirmButtonColor: colors.red,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }

  function updateImagesOrder(images: string[]) {
    setValue("images", images);
  }

  async function handleImageDelete(imageUrl: string) {
    const confirm = await Swal.fire({
      title: "Delete this image?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.red,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete("/api/delete-image", {
        data: { url: imageUrl },
      });

      const updatedImages: string[] = watch("images").filter(
        (img: string) => img !== imageUrl
      );
      setValue("images", updatedImages);
      Swal.fire({
        title: "Deleted",
        text: "Image has been removed.",
        icon: "success",
        confirmButtonColor: colors.green,
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Failed to delete image.", "error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={String(field.value || "")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
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

        {propertiesToFill.map((property) => (
          <FormField
            key={property._id}
            control={form.control}
            name={`properties.${property.name}` as keyof ProductFormData}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {property.name[0].toUpperCase() + property.name.substring(1)}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value || "")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${property.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {property.values.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <div
                  className="mb-2 flex flex-wrap gap-1 border-dashed border-2 border-gray-300 rounded-md p-4 justify-center items-center relative"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <ReactSortable
                    list={watch("images").map((image, index) => ({
                      id: `${image}-${index}`,
                      name: image,
                    }))}
                    setList={(newState) =>
                      updateImagesOrder(newState.map((item) => item.name))
                    }
                    className="flex flex-wrap gap-1"
                  >
                    {watch("images").map((link, index) => (
                      <div
                        key={`image-${link}-${index}`}
                        className="relative h-24 w-24 bg-white p-1 rounded-sm shadow-sm border border-gray-200"
                      >
                        <img
                          src={link}
                          alt=""
                          className="object-cover h-full w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(link)}
                          className="absolute -top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </ReactSortable>
                  <FormLabel
                    htmlFor="upload-images"
                    className="w-24 h-24 cursor-pointer text-center flex items-center justify-center text-sm gap-1 text-gray-800 rounded-sm bg-white shadow-sm border border-gray-200 hover:text-base"
                  >
                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg> */}
                    <Input
                      id="upload-images"
                      type="file"
                      multiple
                      onChange={uploadImages}
                      className="hidden"
                    />
                    {isUploading ? (
                      <HashLoader size={24} />
                    ) : (
                      <>
                        <PlusIcon className="h-6 w-6" />
                        <span className="sr-only">Upload images</span>
                      </>
                    )}
                  </FormLabel>
                </div>
              </FormControl>
              <FormMessage>{errors.images?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in NGN)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUploading}>
          Save product
        </Button>
      </form>
    </Form>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

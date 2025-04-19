import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { ReactSortable } from "react-sortablejs";
import { HashLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import {
  useForm,
  Controller,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { productSchema, ProductFormData } from "@/lib/validation/productSchema"; // Import the schema

import { zodResolver } from "@hookform/resolvers/zod"; // For using Zod with react-hook-form
import {
  FormField,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form"; // ShadCN Form components

import Swal from "sweetalert2";
import colors from "@/lib/colors/swalAlerts";

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
  images?: string[];
  price?: number;
  category?: string;
  properties?: Record<string, string>;
  onSave?: () => void;
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
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: existingName,
      description: existingDescription,
      price: existingPrice,
      images: existingImages,
      category: assignedCategory,
      properties: Object.entries(assignedProperties).map(([name, value]) => ({
        name,
        values: value || "",
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

  const images = watch("images");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [goToProducts, setGoToProducts] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    const { name, description, price, images, category, properties } = data;
    const productData = {
      name,
      description,
      price,
      images,
      category,
      properties,
    };

    try {
      if (_id) {
        await axios.put("/api/products", { ...productData, _id });
      } else {
        await axios.post("/api/products", productData);
      }

      Swal.fire({
        icon: "success",
        title: "Product saved!",
        showConfirmButton: false,
        timer: 1500,
      });

      // ✅ Reset form after success (only if it's a new product)

      if (onSave) {
        onSave();
      }

      // Optionally navigate back to the products page after saving
      setTimeout(() => {
        if (!_id) {
          form.reset({
            name: "",
            description: "",
            price: 0,
            images: [],
            category: "",
            properties: [],
          });
        }
      }, 1600);
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire("Error", "Failed to save product. Please try again.", "error");
    }
  };

  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete("/api/delete-image", {
        data: { url: imageUrl },
      });

      const updatedImages = watch("images").filter((img) => img !== imageUrl);
      setValue("images", updatedImages);
      Swal.fire("Deleted!", "Image has been removed.", "success");
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Failed to delete image.", "error");
    }
  }

  const propertiesToFill: Property[] = [];
  if (categories.length > 0 && assignedCategory) {
    let catInfo = categories.find((cat) => cat._id === assignedCategory);
    if (catInfo) {
      propertiesToFill.push(...catInfo.properties);
      while (catInfo?.parent?._id) {
        const parentCat = categories.find(
          (c) => c._id === catInfo?.parent?._id
        );
        if (parentCat) {
          propertiesToFill.push(...parentCat.properties);
          catInfo = parentCat;
        } else {
          break;
        }
      }
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Playstation 5 pro"
                  {...field} // Spread the field props here
                />
              </FormControl>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.category?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
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
                    list={images.map((image, index) => ({
                      id: index,
                      name: image,
                    }))}
                    setList={(newState) =>
                      updateImagesOrder(newState.map((item) => item.name))
                    }
                    className="flex flex-wrap gap-1"
                  >
                    {images.map((link) => (
                      <div
                        key={link}
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

                  {isUploading && (
                    <div className="flex flex-col items-center text-sm text-gray-600 mt-2">
                      <HashLoader color="#00A63E" size={24} />
                      {uploadProgress > 0 && <div>{uploadProgress}%</div>}
                    </div>
                  )}

                  <label className="w-24 h-24 cursor-pointer text-center flex items-center justify-center text-sm gap-1 text-gray-800 rounded-sm bg-white shadow-sm border border-gray-200 hover:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>Upload</div>
                    <Input
                      type="file"
                      multiple
                      onChange={uploadImages}
                      className="hidden"
                    />
                  </label>
                </div>
              </FormControl>
              <FormMessage>{errors.images?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="mb-0 p-2" />
              </FormControl>
              <FormMessage>{errors.description?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in NGN)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="price"
                  {...field} // Spread the field props here
                  className="mb-0 pr-3 pl-10 p-2"
                />
              </FormControl>
              <FormMessage>{errors.price?.message}</FormMessage>
            </FormItem>
          )}
        />

        <button
          type="submit"
          className={`${buttonVariants({ variant: "default" })} cursor-pointer`}
        >
          Save
        </button>
      </form>
    </FormProvider>
  );
}

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
import { Input, Textarea } from "@/components/ui/input";
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

// import { useEffect, useState, ChangeEvent, FormEvent, useMemo } from "react";
// import axios from "axios";
// import { ReactSortable } from "react-sortablejs";
// import { HashLoader } from "react-spinners";
// import { useRouter } from "next/navigation";
// import { Input, Textarea } from "@/components/ui/input";
// import { FormLabel as FormLabel } from "@/components/ui/FormLabel";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/Select";
// import { buttonVariants } from "@/components/ui/button";
// import {
//   useForm,
//   Controller,
//   FormProvider,
//   SubmitHandler,
// } from "react-hook-form";
// import { productSchema, ProductFormData } from "@/lib/validation/productSchema"; // Import the schema

// import { zodResolver } from "@hookform/resolvers/zod"; // For using Zod with react-hook-form
// import {
//   FormField,
//   FormControl,
//   FormMessage,
//   FormItem,
// } from "@/components/ui/form"; // ShadCN Form components

// import Swal from "sweetalert2";
// import colors from "@/lib/colors/swalAlerts";

// interface Category {
//   _id: string;
//   name: string;
//   properties: Property[];
//   parent?: Category;
// }

// interface Property {
//   _id: string;
//   name: string;
//   values: string[];
// }

// interface PriceVariant {
//   variantName: string;
//   variantValues: string[];
//   price: number;
// }

// interface ProductFormProps {
//   _id?: string;
//   name?: string;
//   description?: string;
//   price?: number;
//   priceVariants?: PriceVariant[];
//   images?: string[];
//   category?: string;
//   properties?: Record<string, string>; // assuming this is still a flat object
//   onSave: (data: ProductFormData) => void;
// }

// export default function ProductForm({
//   _id,
//   name: existingName = "",
//   description: existingDescription = "",
//   price: existingPrice = 0,
//   priceVariants: existingPriceVariants = [],
//   images: existingImages = [],
//   category: assignedCategory = "",
//   properties: assignedProperties = {},
//   onSave,
// }: ProductFormProps) {
//   const form = useForm<ProductFormData>({
//     defaultValues: {
//       name: existingName,
//       description: existingDescription,
//       price: existingPrice,
//       priceVariants: existingPriceVariants,
//       images: existingImages,
//       category: assignedCategory,
//       properties: Object.entries(assignedProperties).map(([name, value]) => {
//         console.log(`Processing property ${name}:`, value, typeof value);

//         try {
//           const values = Array.isArray(value)
//             ? value.map((v) => String(v).trim())
//             : typeof value === "string"
//             ? value
//                 .split(",")
//                 .map((v) => v.trim())
//                 .filter((v) => v)
//             : [];

//           return { name, values };
//         } catch (error) {
//           console.error(`Error processing property ${name}:`, error);
//           return { name, values: [] };
//         }
//       }),
//     },
//     resolver: zodResolver(productSchema),
//   });

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     register,
//     watch,
//     formState: { errors },
//   } = form;

//   const router = useRouter();
//   const images = watch("images");
//   const category = watch("category");
//   const selectedProperties = watch("properties");
//   const priceVariants = watch("priceVariants");

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [goToProducts, setGoToProducts] = useState<boolean>(false);

//   useEffect(() => {
//     axios.get("/api/categories").then((result) => {
//       setCategories(result.data);
//     });
//   }, []);

//   const propertiesToFill = useMemo(() => {
//     const selectedCategory = categories.find(({ _id }) => _id === category);
//     if (!selectedCategory) return [];

//     const props: Category["properties"] = [...selectedCategory.properties];

//     let parentId = selectedCategory.parent?._id;
//     while (parentId) {
//       const parentCategory = categories.find(({ _id }) => _id === parentId);
//       if (!parentCategory) break;

//       props.push(...parentCategory.properties);
//       parentId = parentCategory.parent?._id;
//     }

//     return props;
//   }, [category, categories]);

//   useEffect(() => {
//     const formatted = propertiesToFill.map((prop) => ({
//       name: prop.name,
//       values: [],
//     }));
//     setValue("properties", formatted);
//   }, [propertiesToFill, setValue]);

//   interface VariantCombination {
//     variantName: string;
//     variantValues: string[];
//     originalValues?: string[]; // Optional if you need to keep original values
//   }

//   const generateVariantCombinations = (): VariantCombination[] => {
//     if (!selectedProperties || !Array.isArray(selectedProperties)) return [];

//     // Filter out properties with no values and ensure values are arrays
//     const activeProperties = selectedProperties
//       .filter((p) => p.values && p.values.length > 0)
//       .map((p) => ({
//         ...p,
//         values: Array.isArray(p.values) ? p.values : [p.values].filter(Boolean),
//       }));

//     if (activeProperties.length === 0) return [];

//     // Generate all possible combinations
//     const combinations: VariantCombination[] = activeProperties.reduce(
//       (acc, property) => {
//         if (acc.length === 0) {
//           return property.values.map((value) => ({
//             variantName: value,
//             variantValues: [value],
//           }));
//         }

//         return acc.flatMap((combination) =>
//           property.values.map((value) => ({
//             variantName: `${combination.variantName} / ${value}`,
//             variantValues: [...combination.variantValues, value],
//           }))
//         );
//       },
//       [] as VariantCombination[]
//     );

//     return combinations;
//   };

//   const variantKeys = useMemo(
//     () => generateVariantCombinations(),
//     [selectedProperties]
//   );

//   // Updated SubmitHandler type, ensuring the right structure for priceVariants
//   const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
//     try {
//       // 1. Prepare price variants
//       const completePriceVariants = variantKeys.map((variant) => {
//         // Find existing variant price or fallback to base price
//         const existingVariant = data.priceVariants?.find(
//           (v) => v.variantName === variant.variantName
//         );

//         // Validate price is a positive number
//         const variantPrice = existingVariant?.price ?? data.price ?? 0;
//         const price =
//           typeof variantPrice === "number" && variantPrice >= 0
//             ? variantPrice
//             : 0;

//         return {
//           variantName: variant.variantName,
//           variantValues: variant.variantValues,
//           price: price,
//         };
//       });

//       // 2. Format properties
//       const formattedProperties = (data.properties || []).map((prop) => ({
//         name: prop?.name?.trim() || "", // Ensure name exists and is trimmed
//         values: (prop?.values || [])
//           .map((v) => (typeof v === "string" ? v.trim() : String(v)))
//           .filter((v) => v), // Remove empty values
//       }));

//       // 3. Prepare complete product data
//       const productData = {
//         name: data.name.trim(),
//         category: data.category,
//         description: data.description.trim(),
//         price: typeof data.price === "number" ? data.price : 0,
//         priceVariants: completePriceVariants,
//         images: data.images || [],
//         properties: formattedProperties,
//         ...(_id && { _id }), // Only include _id if it exists
//       };

//       // 4. Validate required fields
//       if (!productData.name) {
//         throw new Error("Product name is required");
//       }
//       if (!productData.category) {
//         throw new Error("Category is required");
//       }
//       if (productData.images.length === 0) {
//         throw new Error("At least one image is required");
//       }

//       // 5. Make API request
//       const response = _id
//         ? await axios.put("/api/products", productData)
//         : await axios.post("/api/products", productData);

//       // 6. Show success message
//       await Swal.fire({
//         icon: "success",
//         name: "Product saved!",
//         showConfirmButton: false,
//         timer: 1500,
//       });

//       // 7. Execute onSave callback with properly typed properties
//       if (onSave) {
//         onSave({
//           ...productData,
//           properties: productData.properties.map((p) => ({
//             name: p.name,
//             values: p.values, // Already in string[] format
//           })),
//         });
//       }

//       // 8. Reset form for new products
//       if (!_id) {
//         setTimeout(() => {
//           form.reset();
//           setValue("images", []);
//           setValue("priceVariants", []);
//         }, 1600);
//       }
//     } catch (error) {
//       console.error("Error saving product:", error);

//       let errorMessage = "Failed to save product. Please try again.";

//       // Type-safe error handling
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       } else if (typeof error === "string") {
//         errorMessage = error;
//       } else if (axios.isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || error.message;
//       }

//       await Swal.fire({
//         icon: "error",
//         name: "Error",
//         text: errorMessage,
//         confirmButtonColor: colors.red,
//       });
//     }
//   };

//   const [uploadProgress, setUploadProgress] = useState<number>(0);

//   function handleDrop(e: React.DragEvent<HTMLDivElement>) {
//     e.preventDefault();
//     const files = Array.from(e.dataTransfer.files);
//     const fileInput = {
//       target: {
//         files,
//       },
//     } as unknown as ChangeEvent<HTMLInputElement>;
//     uploadImages(fileInput);
//   }

//   async function uploadImages(ev: ChangeEvent<HTMLInputElement>) {
//     const files = ev.target?.files;
//     if ((files ?? []).length > 0) {
//       setIsUploading(true);
//       const data = new FormData();
//       for (const file of files || []) {
//         data.append("file", file);
//       }

//       try {
//         const res = await axios.post("/api/upload", data, {
//           onUploadProgress: (progressEvent) => {
//             const percent = Math.round(
//               (progressEvent.loaded * 100) / (progressEvent.total || 1)
//             );
//             setUploadProgress(percent);
//           },
//         });
//         setValue("images", [...watch("images"), ...res.data.links]);
//         Swal.fire({
//           name: "Upload Complete",
//           text: "Image successfully uploaded",
//           icon: "success",
//           confirmButtonColor: colors.green,
//         });
//       } catch (err) {
//         console.error("Upload error", err);
//         Swal.fire({
//           name: "Upload failed",
//           text: "Please try again",
//           icon: "error",
//           confirmButtonColor: colors.red,
//         });
//       } finally {
//         setIsUploading(false);
//         setUploadProgress(0);
//       }
//     }
//   }

//   function updateImagesOrder(images: string[]) {
//     setValue("images", images);
//   }

//   async function handleImageDelete(imageUrl: string) {
//     const confirm = await Swal.fire({
//       name: "Delete this image?",
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.delete("/api/delete-image", {
//         data: { url: imageUrl },
//       });

//       const updatedImages: string[] = watch("images").filter(
//         (img: string) => img !== imageUrl
//       );
//       setValue("images", updatedImages);
//       Swal.fire("Deleted!", "Image has been removed.", "success");
//     } catch (error) {
//       console.error("Delete error:", error);
//       Swal.fire("Error!", "Failed to delete image.", "error");
//     }
//   }

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="flex flex-col gap-4 w-full max-w-sm"
//       >
//         <FormField
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Product name</FormLabel>
//               <FormControl>
//                 <Input
//                   type="text"
//                   placeholder="Playstation 5 pro"
//                   {...field} // Spread the field props here
//                 />
//               </FormControl>
//               <FormMessage>{errors.name?.message}</FormMessage>
//             </FormItem>
//           )}
//         />

//         <FormField
//           name="category"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Category</FormLabel>
//               <FormControl>
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Choose category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((c) => (
//                       <SelectItem key={c._id} value={c._id}>
//                         {c.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//               <FormMessage>{errors.category?.message}</FormMessage>
//             </FormItem>
//           )}
//         />

//         {propertiesToFill.map((property) => (
//           <FormField
//             key={`property-${property._id}`}
//             name={`properties.${property.name}`}
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{property.name}</FormLabel>
//                 <FormControl>
//                   <Select
//                     onValueChange={(value) => {
//                       field.onChange(value);
//                       // Reset price variants when properties change
//                       setValue("priceVariants", []);
//                     }}
//                     value={field.value}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={`Select ${property.name}`} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {property.values.map((val) => {
//                         const storedValue = val.split("(")[0].trim();
//                         return (
//                           <SelectItem
//                             key={`SelectItem-${property._id}-${storedValue}`}
//                             value={storedValue}
//                           >
//                             {val}
//                           </SelectItem>
//                         );
//                       })}
//                     </SelectContent>
//                   </Select>
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//         ))}

//         <FormField
//           name="images"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Photos</FormLabel>
//               <FormControl>
//                 <div
//                   className="mb-2 flex flex-wrap gap-1 border-dashed border-2 border-gray-300 rounded-md p-4 justify-center items-center relative"
//                   onDrop={handleDrop}
//                   onDragOver={(e) => e.preventDefault()}
//                 >
//                   <ReactSortable
//                     list={images.map((image, index) => ({
//                       id: `${image}-${index}`,
//                       name: image,
//                     }))}
//                     setList={(newState) =>
//                       updateImagesOrder(newState.map((item) => item.name))
//                     }
//                     className="flex flex-wrap gap-1"
//                   >
//                     {images.map((link, index) => (
//                       <div
//                         key={`image-${link}-${index}`}
//                         className="relative h-24 w-24 bg-white p-1 rounded-sm shadow-sm border border-gray-200"
//                       >
//                         <img
//                           src={link}
//                           alt=""
//                           className="object-cover h-full w-full"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => handleImageDelete(link)}
//                           className="absolute -top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
//                         >
//                           &times;
//                         </button>
//                       </div>
//                     ))}
//                   </ReactSortable>

//                   {isUploading && (
//                     <div className="flex flex-col items-center text-sm text-gray-600 mt-2">
//                       <HashLoader color="#00A63E" size={24} />
//                       {uploadProgress > 0 && <div>{uploadProgress}%</div>}
//                     </div>
//                   )}

//                   <FormLabel className="w-24 h-24 cursor-pointer text-center flex items-center justify-center text-sm gap-1 text-gray-800 rounded-sm bg-white shadow-sm border border-gray-200 hover:text-base">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
//                       <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
//                     </svg>
//                     <div>Upload</div>
//                     <Input
//                       type="file"
//                       multiple
//                       onChange={uploadImages}
//                       className="hidden"
//                     />
//                   </FormLabel>
//                 </div>
//               </FormControl>
//               <FormMessage>{errors.images?.message}</FormMessage>
//             </FormItem>
//           )}
//         />

//         <FormField
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormControl>
//                 <Textarea {...field} className="mb-0 p-2" />
//               </FormControl>
//               <FormMessage>{errors.description?.message}</FormMessage>
//             </FormItem>
//           )}
//         />

//         <FormField
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Price (in NGN)</FormLabel>
//               <FormControl>
//                 <Input
//                   type="number"
//                   placeholder="price"
//                   {...field} // Spread the field props here
//                   className="mb-0 pr-3 pl-10 p-2"
//                 />
//               </FormControl>
//               <FormMessage>{errors.price?.message}</FormMessage>
//             </FormItem>
//           )}
//         />

//         <div className="mt-6">
//           <h3 className="text-lg font-medium">Price Variants</h3>
//           <p className="text-sm text-gray-500 mb-4">
//             Set different prices for property combinations
//           </p>

//           {variantKeys.length > 0 ? (
//             <div className="space-y-4">
//               {variantKeys.map((variant) => {
//                 const existingVariant = priceVariants?.find(
//                   (v) => v.variantName === variant.variantName
//                 ) || {
//                   variantName: variant.variantName,
//                   variantValues: variant.variantValues,
//                   price: watch("price") || 0,
//                 };

//                 return (
//                   <div
//                     key={`variant-${variant.variantName}`}
//                     className="border p-4 rounded-md"
//                   >
//                     <div className="font-medium mb-2">
//                       {variant.variantName}
//                     </div>
//                     <FormField
//                       name={`priceVariants.${variant.variantName}`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Price (NGN)</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               value={existingVariant.price}
//                               onChange={(e) => {
//                                 const value = parseFloat(e.target.value);
//                                 const updatedVariants = [
//                                   ...(priceVariants || []),
//                                 ];
//                                 const variantIndex = updatedVariants.findIndex(
//                                   (v) => v.variantName === variant.variantName
//                                 );

//                                 const updatedVariant = {
//                                   ...variant,
//                                   price: isNaN(value) ? 0 : value,
//                                 };

//                                 if (variantIndex >= 0) {
//                                   updatedVariants[variantIndex] =
//                                     updatedVariant;
//                                 } else {
//                                   updatedVariants.push(updatedVariant);
//                                 }

//                                 setValue("priceVariants", updatedVariants, {
//                                   shouldValidate: true,
//                                   shouldDirty: true,
//                                 });
//                               }}
//                             />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-500">
//               {selectedProperties?.some((p) => p.values?.length > 0)
//                 ? "No variant combinations available. Check your property selections."
//                 : "Select property values to generate price variants."}
//             </p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className={`${buttonVariants({ variant: "default" })} cursor-pointer`}
//         >
//           Save
//         </button>
//       </form>
//     </FormProvider>
//   );
// }

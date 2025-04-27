import { useState, ChangeEvent } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useFormContext } from "react-hook-form";
import colors from "@/lib/colors/swalAlerts";

export const ImageUploader = () => {
  const { setValue, watch } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function uploadImages(ev: ChangeEvent<HTMLInputElement>) {
    const files = ev.target?.files;

    if (!files?.length) return;

    setIsUploading(true);
    const data = new FormData();

    Array.from(files).forEach((file) => data.append("file", file));

    try {
      const res = await axios.post("/api/upload", data, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        },
      });

      const updatedImages = [...watch("images"), ...res.data.links];
      setValue("images", updatedImages);

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

      const updatedImages: string[] = watch("images").filter(
        (img: string) => img !== imageUrl
      );
      setValue("images", updatedImages);

      Swal.fire("Deleted!", "Image has been removed.", "success");
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Failed to delete image.", "error");
    }
  }

  return (
    <div className="image-uploader">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          multiple
          onChange={uploadImages}
          disabled={isUploading}
        />
        {isUploading && <progress value={uploadProgress} max={100} />}
      </div>
      <div className="image-preview">
        {watch("images").map((image: string) => (
          <div key={image} className="image-item">
            <img src={image} alt="Uploaded" />
            <button onClick={() => handleImageDelete(image)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

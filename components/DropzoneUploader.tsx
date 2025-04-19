// components/DropzoneUploader.tsx
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { HashLoader } from "react-spinners";
import axios from "axios";

interface DropzoneUploaderProps {
  existingImages: string[];
  setImages: (images: string[]) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

export function DropzoneUploader({
  existingImages,
  setImages,
  isUploading,
  setIsUploading,
}: DropzoneUploaderProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setIsUploading(true);
      const data = new FormData();
      acceptedFiles.forEach((file) => data.append("file", file));

      try {
        const res = await axios.post("/api/upload", data);
        setImages([...existingImages, ...res.data.links]);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    },
    [existingImages, setImages, setIsUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  function handleDeleteImage(image: string) {
    setImages(existingImages.filter((img) => img !== image));
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-4 rounded cursor-pointer hover:bg-gray-50 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag 'n' drop some images here, or click to select files</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {existingImages.map((img) => (
          <div
            key={img}
            className="relative w-24 h-24 border border-gray-200 rounded overflow-hidden"
          >
            <img
              src={img}
              alt="Uploaded"
              className="object-cover w-full h-full"
            />
            <button
              onClick={() => handleDeleteImage(img)}
              className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-bl"
            >
              ✕
            </button>
          </div>
        ))}

        {isUploading && (
          <div className="w-24 h-24 flex items-center justify-center">
            <HashLoader color="#00A63E" size={28} />
          </div>
        )}
      </div>
    </div>
  );
}

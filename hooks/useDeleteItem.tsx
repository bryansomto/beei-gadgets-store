"use client";

import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface UseDeleteItemOptions {
  resource: string; // e.g. "products" | "categories" | "orders"
  onDeleted?: () => void; // callback after successful delete
}

export function useDeleteItem({ resource, onDeleted }: UseDeleteItemOptions) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // --- Confirm before deletion ---
  async function confirmDelete(itemName: string): Promise<boolean> {
    return new Promise((resolve) => {
      toast({
        title: `Delete ${itemName}?`,
        description: "This action cannot be undone.",
        action: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => resolve(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => resolve(true)}
            >
              Delete
            </Button>
          </div>
        ),
      });
    });
  }

  // --- Delete handler ---
  async function handleDelete(itemId: string, itemName: string) {
    try {
      setIsDeleting(itemId);
      const confirmed = await confirmDelete(itemName);
      if (!confirmed) return;

      // Check if it's a batch delete (comma-separated IDs)
      if (itemId.includes(",")) {
        const ids = itemId.split(",").map((id) => id.trim());
        await axios.delete(`/api/${resource}`, { data: { ids } });
      } else {
        await axios.delete(`/api/${resource}?id=${itemId}`);
      }

      toast({
        title: "Deleted",
        description: `"${itemName}" deleted successfully.`,
      });

      onDeleted?.();
    } catch (error) {
      console.error(`Failed to delete ${resource}`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${resource.slice(0, -1)}.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  return { handleDelete, isDeleting };
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" asChild disabled={currentPage <= 1}>
        <Link href={createPageURL(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Link>
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          asChild
        >
          <Link href={createPageURL(page)}>
            {page}
            <span className="sr-only">Page {page}</span>
          </Link>
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage >= totalPages}
      >
        <Link href={createPageURL(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Link>
      </Button>
    </div>
  );
}

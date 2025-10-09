import { useState, useEffect, useCallback } from "react";

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  currentPage: number;
  totalItems: number;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = 0;
  const endIndex = currentPage * itemsPerPage;

  const currentItems = data.slice(startIndex, endIndex);
  const hasMore = currentPage < totalPages;

  // Wrap loadMore with useCallback
  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]); // hasMore sebagai dependensi

  // Wrap reset with useCallback
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []); // Dependency array kosong agar fungsi ini stabil

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    currentItems,
    hasMore,
    loadMore,
    reset,
    currentPage,
    totalItems,
  };
}

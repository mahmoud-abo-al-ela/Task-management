import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Builds the list of page numbers to show. With many pages it keeps the
// current page in the middle rather than rendering a button for every page.
function getPages(current: number, total: number) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const start = Math.min(Math.max(current - 2, 1), total - 4);
  return Array.from({ length: 5 }, (_, i) => start + i);
}

export default function TaskPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Nothing to page through.
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            // href="#" would jump to the top of the page on every click.
            onClick={() => onPageChange(page - 1)}
            aria-disabled={page === 1}
            className={
              page === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {getPages(page, totalPages).map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              onClick={() => onPageChange(number)}
              isActive={number === page}
              className="cursor-pointer"
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(page + 1)}
            aria-disabled={page === totalPages}
            className={
              page === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

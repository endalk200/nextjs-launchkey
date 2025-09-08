"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
    page: number;
    totalPages: number;
    pageSize?: number;
    totalItems: number;
    baseParams?: Record<string, string | undefined>;
}

export function DataTablePagination({
    page,
    totalPages,
    pageSize = 20,
    totalItems,
    baseParams = {},
}: DataTablePaginationProps) {
    const makeHref = (p: number, size?: number) => {
        const params = new URLSearchParams();
        Object.entries(baseParams).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        params.set("page", String(p));
        if (size && size !== 20) {
            params.set("limit", String(size));
        }
        return `?${params.toString()}`;
    };

    // Calculate the range of items currently displayed
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
                Showing {startItem} to {endItem} of {totalItems} users
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            window.location.href = makeHref(1, Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden h-8 w-8 lg:flex"
                        asChild
                        disabled={page <= 1}
                    >
                        <a href={makeHref(1)}>
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        disabled={page <= 1}
                    >
                        <a href={makeHref(Math.max(1, page - 1))}>
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        disabled={page >= totalPages}
                    >
                        <a href={makeHref(Math.min(totalPages, page + 1))}>
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden h-8 w-8 lg:flex"
                        asChild
                        disabled={page >= totalPages}
                    >
                        <a href={makeHref(totalPages)}>
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { DataTable } from "./data-table";
import { createColumns, type AdminUser } from "./columns";
import { DataTablePagination } from "./data-table-pagination";

interface UsersDataTableProps {
    data: AdminUser[];
    page: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    baseParams: Record<string, string | undefined>;
    actions: {
        banUser: (formData: FormData) => Promise<void>;
        toggleAdmin: (formData: FormData) => Promise<void>;
        removeUser: (formData: FormData) => Promise<void>;
    };
}

export function UsersDataTable({
    data,
    page,
    totalPages,
    pageSize,
    totalItems,
    baseParams,
    actions,
}: UsersDataTableProps) {
    const columns = createColumns(actions);

    return (
        <div className="space-y-4">
            <DataTable columns={columns} data={data} />
            <DataTablePagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                baseParams={baseParams}
            />
        </div>
    );
}

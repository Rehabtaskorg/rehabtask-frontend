"use client";

import { CustomerTableRow } from "./CustomerTableRow";

const COLUMNS = ['Applicant', 'Type', 'Status', 'Location', 'Applied', 'Docs'];

/**
 * Table of customers for the admin review list.
 * Renders an empty-state message when there are no results.
 *
 * @param {{ customers: object[], isLoading: boolean }} props
 */
export function CustomerTable({ customers = [], isLoading }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-border-light">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-border-light">
                        {COLUMNS.map((col) => (
                            <th key={col} className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                {COLUMNS.map((col) => (
                                    <td key={col} className="px-4 py-3">
                                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : customers.length === 0 ? (
                        <tr>
                            <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-sm text-text-muted">
                                No customers found.
                            </td>
                        </tr>
                    ) : (
                        customers.map((customer) => (
                            <CustomerTableRow key={customer.id} customer={customer} />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
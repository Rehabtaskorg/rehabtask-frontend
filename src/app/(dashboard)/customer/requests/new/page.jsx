"use client";

import { useSearchParams } from "next/navigation";
import NewRequestForm from "./_components/NewRequestForm";

export default function NewRequestPage() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const directTo = searchParams.get("directTo");

    return <NewRequestForm key={editId ?? directTo ?? "new"} editId={editId} directTo={directTo} />;
}

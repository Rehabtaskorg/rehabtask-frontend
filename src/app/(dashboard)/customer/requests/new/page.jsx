"use client";

import { useSearchParams } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CustomerLockedPageOverlay } from "@/components/customer/CustomerLockedPageOverlay";
import NewRequestForm from "./_components/NewRequestForm";

export default function NewRequestPage() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const directTo = searchParams.get("directTo");

    const customer = useCustomerUser();
    if (!customer?.canAccessMarketplace) {
        return <CustomerLockedPageOverlay pageType="newRequest" />;
    }

    return <NewRequestForm key={editId ?? directTo ?? "new"} editId={editId} directTo={directTo} />;
}

import Navbar from "@/components/landing/Navbar";

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}

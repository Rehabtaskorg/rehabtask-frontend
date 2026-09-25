/**
 * Titled card container used across the therapist detail sections.
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
export function SectionCard({ title, children }) {
    return (
        <div className="bg-card-light  border border-border-light  rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light ">
                <h3 className="font-semibold text-text-main  text-sm">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

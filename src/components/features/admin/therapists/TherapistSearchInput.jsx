import { MdSearch, MdClose } from 'react-icons/md';

/**
 * Debounced-by-parent search box for the admin therapist list.
 * @param {{ value: string, onChange: (v: string) => void, onClear: () => void }} props
 */
export function TherapistSearchInput({ value, onChange, onClear }) {
    return (
        <div className="relative max-w-sm mb-5">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl pointer-events-none" />
            <input
                type="text"
                placeholder="Search by name…"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-border-light  bg-card-light  text-text-main  placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-slate-700 "
                >
                    <MdClose className="text-lg" />
                </button>
            )}
        </div>
    );
}

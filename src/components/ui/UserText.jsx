/**
 * Renders user-generated free text without letting it break page layout.
 *
 * @param {Object} props
 * @param {string} [props.as]                  - Element tag to render (default "p")
 * @param {string} [props.className]           - Additional classes
 * @param {boolean} [props.preserveLineBreaks] - Keep authored newlines via `whitespace-pre-wrap`
 * @param {React.ReactNode} props.children     - The user-generated text
 */
export const UserText = ({ as: Component = "p", className = "", preserveLineBreaks = false, children }) => (
    <Component
        className={`[overflow-wrap:anywhere]${preserveLineBreaks ? " whitespace-pre-wrap" : ""} ${className}`.trim()}
    >
        {children}
    </Component>
);

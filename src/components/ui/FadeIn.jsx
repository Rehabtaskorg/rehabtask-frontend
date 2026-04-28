"use client";

import { motion } from "framer-motion";

/**
 * Lightweight animation boundary for server-rendered content.
 * Wrap any static content to add fade-in-on-scroll without making the parent a client component.
 *
 * @param {"up"|"down"|"none"} direction - Slide direction
 * @param {number} delay - Animation delay in seconds
 * @param {number} duration - Animation duration in seconds
 * @param {boolean} once - Only animate once (default true)
 * @param {string} className - Additional classes
 * @param {boolean} hover - Enable hover lift effect
 */
export default function FadeIn({
    children,
    direction = "up",
    delay = 0,
    duration = 0.5,
    once = true,
    className = "",
    hover = false,
    as = "div",
}) {
    const yOffset = direction === "up" ? 15 : direction === "down" ? -15 : 0;

    const Component = motion[as] || motion.div;

    return (
        <Component
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once }}
            transition={{ duration, delay }}
            {...(hover && { whileHover: { y: -2 } })}
            className={className}
        >
            {children}
        </Component>
    );
}

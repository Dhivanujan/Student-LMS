import { useEffect, useState } from "react";

const CursorGlow = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run on devices with mouse pointer capabilities
        const hasMouse = window.matchMedia("(pointer: fine)").matches;
        if (!hasMouse) return;

        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div 
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--primary-glow-strong) 0%, var(--accent-glow) 45%, transparent 70%)",
                transform: `translate(${position.x - 130}px, ${position.y - 130}px)`,
                pointerEvents: "none",
                zIndex: 0, // Behind elements, above background
                filter: "blur(15px)",
                transition: "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)",
                willChange: "transform"
            }}
        />
    );
};

export default CursorGlow;

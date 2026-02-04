import Image from "next/image";
import { ReactNode } from "react";

interface NotchedImageProps {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    children?: ReactNode;
}

/**
 * Image component with notched corners (cutout corners at top-left, top-right, bottom-left, bottom-right)
 * Matches the modern CRM design aesthetic
 */
export function NotchedImage({
    src,
    alt = "",
    width,
    height,
    className = "",
    priority = false,
    children
}: NotchedImageProps) {
    return (
        <div
            className={`relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${className}`}
            style={{
                borderRadius: '24px'
            }}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width || 600}
                    height={height || 600}
                    className="w-full h-auto"
                    priority={priority}
                />
            ) : children}
        </div>
    );
}

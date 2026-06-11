"use client"

import { useState } from "react"
import Image from "next/image"

export function MemberImage({
    src,
    fallbackSrc,
    alt,
}: {
    src: string
    fallbackSrc?: string
    alt: string
}) {
    const [imageSrc, setImageSrc] = useState(src)

    return (
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            <Image
                src={imageSrc}
                alt={alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-center"
                onError={() => {
                    if (fallbackSrc && imageSrc !== fallbackSrc) {
                        setImageSrc(fallbackSrc)
                    }
                }}
            />
        </div>
    )
}

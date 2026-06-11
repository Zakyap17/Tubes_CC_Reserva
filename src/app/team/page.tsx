"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { LogIn } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const teamMembers = [
    {
        name: "Muhammad Zakiyy Mujahid",
        nim: "102022330243",
        image: "/jek.png",
    },
    {
        name: "Zaki Aprilian",
        nim: "102022300212",
        image: "/zaki.jpeg",
    },
    {
        name: "Gyebran Nauri Haikal",
        nim: "102022300389",
        image: "/gyebran.jpg",
        fallbackImage: "/gyebran.jpg",
    },
]

function MemberImage({
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

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 pt-10">
                    <div className="max-w-2xl space-y-3 text-center">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                            Anggota Tim
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400">
                            Tim pengembang Sistem Peminjaman Ruangan & Alat Universitas.
                        </p>
                    </div>

                    <div className="grid w-full gap-6 md:grid-cols-3">
                        {teamMembers.map((member) => (
                            <Card
                                key={member.nim}
                                className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                            >
                                <CardContent className="space-y-5 p-5">
                                    <MemberImage
                                        src={member.image}
                                        fallbackSrc={member.fallbackImage}
                                        alt={member.name}
                                    />
                                    <div className="space-y-1 text-center">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                            {member.name}
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            NIM {member.nim}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button asChild size="lg" className="gap-2">
                        <Link href="/login">
                            <LogIn className="h-4 w-4" />
                            Login
                        </Link>
                    </Button>
                </section>
            </main>
        </div>
    )
}

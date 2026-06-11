// Server Component — dibaca tiap request agar INSTANCE_NAME selalu fresh
export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { LogIn, Server } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MemberImage } from "@/components/team/MemberImage"

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

export default function TeamPage() {
    const instanceName = process.env.INSTANCE_NAME ?? "UNKNOWN"

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

                    {/* Server badge untuk demo AWS ALB */}
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-slate-800 px-6 py-3 shadow-md">
                        <Server className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium text-slate-300">Served by:</span>
                        <span className="font-mono text-lg font-bold tracking-widest text-amber-400">
                            {instanceName}
                        </span>
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
                    </div>
                </section>
            </main>
        </div>
    )
}

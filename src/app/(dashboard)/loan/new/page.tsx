"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { BookingGrid } from "@/components/booking/BookingGrid"
import { AdminPanel } from "@/components/admin/AdminPanel"
import { Button } from "@/components/ui/button"
import { useBooking } from "@/context/BookingContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, LayoutDashboard, Download } from "lucide-react"

function LoanPageContent() {
    const { user, logout } = useAuth()
    const { bookings, cancelBooking } = useBooking()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"grid" | "history" | "admin">("grid")

    useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab === "history" && user?.role === "mahasiswa") {
            setActiveTab("history")
        } else if (tab === "admin" && user?.role === "admin") {
            setActiveTab("admin")
        } else {
            setActiveTab("grid")
        }
    }, [searchParams, user])

    if (!user) {
        return <div className="p-8 text-center">Silakan login terlebih dahulu.</div>
    }

    const myBookings = bookings.filter(b => b.user.toLowerCase() === user.username.toLowerCase())

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Clean UI: No Header, just Tabs */}
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="rounded-full gap-2 text-muted-foreground hover:text-primary"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Button>

                    <div className="w-px h-8 bg-border mx-2" />

                    <Button
                        variant={activeTab === "grid" ? "default" : "ghost"}
                        onClick={() => setActiveTab("grid")}
                        className="rounded-full"
                    >
                        Jadwal Ruangan
                    </Button>

                    {user.role === "mahasiswa" && (
                        <Button
                            variant={activeTab === "history" ? "default" : "ghost"}
                            onClick={() => setActiveTab("history")}
                            className="rounded-full"
                        >
                            Riwayat Saya
                        </Button>
                    )}

                    {user.role === "admin" && (
                        <Button
                            variant={activeTab === "admin" ? "default" : "ghost"}
                            onClick={() => setActiveTab("admin")}
                            className="rounded-full"
                        >
                            Daftar Persetujuan
                        </Button>
                    )}

                    {user.role === "admin" && (
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/admin/history")}
                            className="rounded-full"
                        >
                            Riwayat Peminjaman
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>

            {activeTab === "grid" && (
                <BookingGrid />
            )}

            {activeTab === "admin" && user.role === "admin" && (
                <AdminPanel />
            )}

            {activeTab === "history" && user.role === "mahasiswa" && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Riwayat Peminjaman Saya</h2>
                    {(() => {
                        // Grouping Logic
                        const groupStudentBookings = (bookings: typeof myBookings) => {
                            const sorted = [...bookings].sort((a, b) => {
                                if (a.room !== b.room) return a.room.localeCompare(b.room)
                                if (a.date !== b.date) return a.date.localeCompare(b.date)
                                return a.time.localeCompare(b.time)
                            })

                            const groups: {
                                ids: string[]
                                room: string
                                date: string
                                startTime: string
                                endTime: string
                                status: string
                                details: any
                                alasanPenolakan?: string
                                lastHour: number
                            }[] = []

                            sorted.forEach(booking => {
                                const hour = parseInt(booking.time.split(':')[0])
                                const lastGroup = groups[groups.length - 1]

                                const isSameRoom = lastGroup && lastGroup.room === booking.room
                                const isSameDate = lastGroup && lastGroup.date === booking.date
                                // Allow same hour (multiple slots?) or consecutive (current == last + 1)
                                const isConsecutive = lastGroup && (hour === lastGroup.lastHour + 1 || hour === lastGroup.lastHour)

                                if (isSameRoom && isSameDate && isConsecutive) {
                                    lastGroup.ids.push(booking.id)
                                    lastGroup.lastHour = hour
                                    const endH = hour + 1
                                    lastGroup.endTime = `${endH.toString().padStart(2, '0')}:00`
                                } else {
                                    const endH = hour + 1
                                    groups.push({
                                        ids: [booking.id],
                                        room: booking.room,
                                        date: booking.date,
                                        startTime: booking.time,
                                        endTime: `${endH.toString().padStart(2, '0')}:00`,
                                        status: booking.status,
                                        details: booking.details,
                                        alasanPenolakan: booking.alasanPenolakan,
                                        lastHour: hour
                                    })
                                }
                            })
                            return groups
                        }

                        const groupedMyBookings = groupStudentBookings(myBookings)

                        const handleBulkCancel = async (ids: string[]) => {
                            if (confirm("Apakah Anda yakin ingin membatalkan peminjaman ini?")) {
                                await Promise.all(ids.map(id => cancelBooking(id)))
                            }
                        }

                        if (groupedMyBookings.length === 0) {
                            return (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                    Belum ada riwayat peminjaman.
                                </div>
                            )
                        }

                        return (
                            <div className="grid gap-4">
                                {groupedMyBookings.map((group, idx) => (
                                    <Card key={`${group.ids[0]}-${idx}`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base">{group.room}</CardTitle>
                                                    <div className="text-sm text-muted-foreground">
                                                        {group.date} | {group.startTime} - {group.endTime}
                                                    </div>
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded-full font-medium ${group.status === "Menunggu" ? "bg-yellow-100 text-yellow-800" :
                                                    group.status === "Disetujui" ? "bg-green-100 text-green-800" :
                                                        "bg-red-100 text-red-800"
                                                    }`}>
                                                    {group.status}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <div><span className="font-medium">Keperluan:</span> {group.details.keperluan}</div>
                                                </div>

                                                <div className="flex justify-end items-start gap-2">
                                                    {group.status === "Menunggu" && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleBulkCancel(group.ids)}
                                                        >
                                                            Batalkan Permintaan
                                                        </Button>
                                                    )}

                                                    {group.status === "Disetujui" && (
                                                        <Button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2 items-center"
                                                            size="sm"
                                                            onClick={() => alert("Download berhasil! Silahkan cek email anda.")}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download Bukti Korin
                                                        </Button>
                                                    )}

                                                    {group.status === "Ditolak" && group.alasanPenolakan && (
                                                        <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-800 text-xs w-full text-left">
                                                            <span className="font-bold block mb-1">Catatan Admin:</span>
                                                            {group.alasanPenolakan}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}

export default function LoanPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoanPageContent />
        </Suspense>
    )
}

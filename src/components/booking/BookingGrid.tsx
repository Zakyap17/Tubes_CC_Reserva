"use client"

import { useState } from "react"
import { useBooking } from "@/context/BookingContext"
import { useAuth } from "@/context/AuthContext"
import { ROOM_LIST, OPERATIONAL_HOURS } from "@/lib/constants"
import { BookingModal } from "./BookingModal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Gunakan tanggal lokal (WIB), bukan UTC
function getLocalDateString() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function BookingGrid() {
    const { bookings, addBooking } = useBooking()
    const { user } = useAuth()
    const [selectedSlots, setSelectedSlots] = useState<{ room: string; time: string }[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const todayStr = getLocalDateString()

    const getBooking = (room: string, time: string) => {
        return bookings.find(
            (b) =>
                b.room === room &&
                b.time === time &&
                b.date === todayStr &&
                b.status !== "Ditolak"
        )
    }

    const toggleSlotSelection = (room: string, time: string) => {
        if (!user || user.role !== "mahasiswa") return

        const existingBooking = getBooking(room, time)
        if (existingBooking) return

        setSelectedSlots((prev) => {
            const isSelected = prev.some((s) => s.room === room && s.time === time)
            return isSelected
                ? prev.filter((s) => !(s.room === room && s.time === time))
                : [...prev, { room, time }]
        })
    }

    const handleBookingTrigger = () => {
        if (selectedSlots.length === 0) {
            alert("Pilih ruangan dan waktu terlebih dahulu")
            return
        }
        setIsModalOpen(true)
    }

    const handleBookingSubmit = async (data: any) => {
        if (!user || selectedSlots.length === 0) return

        setIsSubmitting(true)
        try {
            const sortedSlots = [...selectedSlots].sort((a, b) =>
                a.time.localeCompare(b.time)
            )

            const newBookings = sortedSlots.map((slot, index) => {
                const { tipePeminjam, organisasi, waktuMulai, ...details } = data
                const paramsTime = index === 0 && waktuMulai ? waktuMulai : slot.time
                return {
                    room: slot.room,
                    time: paramsTime,
                    date: todayStr,
                    user: user.username,
                    tipePeminjam,
                    organisasi,
                    details,
                }
            })

            await addBooking(newBookings)
            setSelectedSlots([])
        } finally {
            setIsSubmitting(false)
        }
    }

    const isMahasiswa = user?.role === "mahasiswa"

    return (
        <div className="space-y-4 relative">
            {isMahasiswa && (
                <div className="sticky top-4 z-20 flex justify-end mb-4 pointer-events-none">
                    <Button
                        size="lg"
                        className="shadow-lg pointer-events-auto"
                        onClick={handleBookingTrigger}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Memproses..."
                            : `Pesan Ruangan (${selectedSlots.length})`}
                    </Button>
                </div>
            )}

            {/* Info view-only untuk admin */}
            {user?.role === "admin" && (
                <div className="text-xs text-muted-foreground bg-slate-50 border rounded px-3 py-2 w-fit">
                    Mode tampilan — hanya mahasiswa yang dapat memilih slot
                </div>
            )}

            <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-slate-200 rounded"></div>
                    <span>Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Dipilih</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>Menunggu Konfirmasi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span>Terisi / Disetujui</span>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium sticky left-0 bg-slate-50 z-10 w-64 min-w-[200px]">
                                    Ruangan
                                </th>
                                {OPERATIONAL_HOURS.map((hour) => (
                                    <th
                                        key={hour}
                                        className="px-4 py-3 font-medium text-center min-w-[80px]"
                                    >
                                        {hour}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {ROOM_LIST.map((room) => (
                                <tr key={room} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r">
                                        {room}
                                    </td>
                                    {OPERATIONAL_HOURS.map((hour) => {
                                        const booking = getBooking(room, hour)
                                        const isSelected = selectedSlots.some(
                                            (s) => s.room === room && s.time === hour
                                        )

                                        let cellClass = ""
                                        let cellContent = null

                                        if (booking) {
                                            if (booking.status === "Menunggu") {
                                                cellClass =
                                                    "bg-yellow-100 hover:bg-yellow-200 cursor-not-allowed"
                                            } else {
                                                cellClass =
                                                    "bg-red-100 hover:bg-red-200 cursor-not-allowed"
                                            }
                                            cellContent = (
                                                <div
                                                    className="text-xs font-medium truncate max-w-[80px] mx-auto"
                                                    title={booking.user}
                                                >
                                                    {booking.user}
                                                </div>
                                            )
                                        } else if (isSelected) {
                                            cellClass =
                                                "bg-blue-100 hover:bg-blue-200 cursor-pointer border-blue-300"
                                        } else {
                                            // Slot tersedia: pointer hanya untuk mahasiswa
                                            cellClass = isMahasiswa
                                                ? "bg-white hover:bg-slate-50 cursor-pointer"
                                                : "bg-white cursor-default"
                                        }

                                        return (
                                            <td
                                                key={`${room}-${hour}`}
                                                className={cn(
                                                    "px-2 py-2 border-r last:border-r-0 transition-colors text-center",
                                                    cellClass
                                                )}
                                                onClick={() =>
                                                    !booking &&
                                                    toggleSlotSelection(room, hour)
                                                }
                                            >
                                                {cellContent}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleBookingSubmit}
                selectedSlots={selectedSlots}
            />
        </div>
    )
}

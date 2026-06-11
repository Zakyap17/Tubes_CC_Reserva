"use client"

import { useState } from "react"
import { useBooking } from "@/context/BookingContext"
import { useAuth } from "@/context/AuthContext"
import { ROOM_LIST, OPERATIONAL_HOURS } from "@/lib/constants"
import { BookingModal } from "./BookingModal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function BookingGrid() {
    const { bookings, addBooking } = useBooking()
    const { user } = useAuth()
    const [selectedSlots, setSelectedSlots] = useState<{ room: string, time: string }[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Helper to find booking for a cell
    // FIX: Ignore "Ditolak" status so the slot appears available
    const getBooking = (room: string, time: string) => {
        return bookings.find(b =>
            b.room === room &&
            b.time === time &&
            b.date === new Date().toISOString().split('T')[0] &&
            b.status !== "Ditolak"
        )
    }

    const toggleSlotSelection = (room: string, time: string) => {
        if (!user || user.role !== "mahasiswa") return

        const existingBooking = getBooking(room, time)
        if (existingBooking) return // Cannot select booked slots

        setSelectedSlots(prev => {
            const isSelected = prev.some(slot => slot.room === room && slot.time === time)
            if (isSelected) {
                return prev.filter(slot => !(slot.room === room && slot.time === time))
            } else {
                return [...prev, { room, time }]
            }
        })
    }

    const handleBookingTrigger = () => {
        if (selectedSlots.length === 0) {
            alert("Pilih ruangan dan waktu terlebih dahulu")
            return
        }
        setIsModalOpen(true)
    }

    const handleBookingSubmit = (data: any) => {
        if (user && selectedSlots.length > 0) {
            // Sort slots to ensure we identify the first/earliest one correctly
            const sortedSlots = [...selectedSlots].sort((a, b) => a.time.localeCompare(b.time))

            const newBookings = sortedSlots.map((slot, index) => {
                const { tipePeminjam, organisasi, waktuMulai, ...details } = data

                // Use custom start time for the first slot, otherwise use slot time
                const paramsTime = (index === 0 && waktuMulai) ? waktuMulai : slot.time

                return {
                    room: slot.room,
                    time: paramsTime,
                    date: new Date().toISOString().split('T')[0],
                    user: user.username,
                    tipePeminjam,
                    organisasi,
                    details
                }
            })

            addBooking(newBookings)
            setSelectedSlots([]) // Clear selection after booking
        }
    }

    return (
        <div className="space-y-4 relative">
            {/* Floating Action Button for Booking */}
            {user?.role === "mahasiswa" && (
                <div className="sticky top-4 z-20 flex justify-end mb-4 pointer-events-none">
                    <Button
                        size="lg"
                        className="shadow-lg pointer-events-auto"
                        onClick={handleBookingTrigger}
                    >
                        Pesan Ruangan ({selectedSlots.length})
                    </Button>
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
                                {OPERATIONAL_HOURS.map(hour => (
                                    <th key={hour} className="px-4 py-3 font-medium text-center min-w-[80px]">
                                        {hour}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {ROOM_LIST.map(room => (
                                <tr key={room} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r">
                                        {room}
                                    </td>
                                    {OPERATIONAL_HOURS.map(hour => {
                                        const booking = getBooking(room, hour)
                                        const isSelected = selectedSlots.some(s => s.room === room && s.time === hour)

                                        let cellClass = "bg-white hover:bg-slate-50 cursor-pointer"
                                        let cellContent = null

                                        if (booking) {
                                            if (booking.status === "Menunggu") {
                                                cellClass = "bg-yellow-100 hover:bg-yellow-200 cursor-not-allowed"
                                            } else if (booking.status === "Disetujui") {
                                                cellClass = "bg-red-100 hover:bg-red-200 cursor-not-allowed"
                                            }
                                            cellContent = (
                                                <div className="text-xs font-medium truncate max-w-[80px] mx-auto" title={booking.user}>
                                                    {booking.user}
                                                </div>
                                            )
                                        } else if (isSelected) {
                                            cellClass = "bg-blue-100 hover:bg-blue-200 cursor-pointer border-blue-300"
                                        }

                                        return (
                                            <td
                                                key={`${room}-${hour}`}
                                                className={cn("px-2 py-2 border-r last:border-r-0 transition-colors text-center", cellClass)}
                                                onClick={() => !booking && toggleSlotSelection(room, hour)}
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

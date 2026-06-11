"use client"

import { useState } from "react"
import { useBooking } from "@/context/BookingContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function AdminPanel() {
    const { bookings, updateBookingStatus } = useBooking()
    const [rejectIds, setRejectIds] = useState<string[] | null>(null)
    const [rejectReason, setRejectReason] = useState("")

    const pendingBookings = bookings.filter(b => b.status === "Menunggu")

    // Group bookings logic
    const groupBookings = (bookings: typeof pendingBookings) => {
        const groups: Record<string, {
            ids: string[],
            times: string[],
            details: any,
            user: string,
            date: string,
            room: string,
            tipePeminjam: string,
            organisasi?: string
        }> = {}

        bookings.forEach(booking => {
            const key = `${booking.date}-${booking.room}-${booking.user}-${booking.details.keperluan}`

            if (!groups[key]) {
                groups[key] = {
                    ids: [],
                    times: [],
                    details: booking.details,
                    user: booking.user,
                    date: booking.date,
                    room: booking.room,
                    tipePeminjam: booking.tipePeminjam,
                    organisasi: booking.organisasi
                }
            }
            groups[key].ids.push(booking.id)
            groups[key].times.push(booking.time)
        })

        return Object.values(groups).map(group => {
            const sortedTimes = group.times.sort()
            const startTime = sortedTimes[0]
            // Simple logic: last time + 1 hour. 
            // Assumption: slots are hourly "HH:00". 
            // If time is "08:00", end is "09:00".
            const lastTime = sortedTimes[sortedTimes.length - 1]
            const [lastHour] = lastTime.split(':')
            const endHour = parseInt(lastHour) + 1
            const endTime = `${endHour.toString().padStart(2, '0')}:00`

            return {
                ...group,
                startTime,
                endTime
            }
        })
    }

    const groupedBookings = groupBookings(pendingBookings)

    const safeRenderAlat = (alat: any) => {
        if (!alat) return '-'
        if (Array.isArray(alat)) return alat.join(', ')
        if (typeof alat === 'string') {
            if (alat.startsWith('[')) {
                try {
                    const parsed = JSON.parse(alat)
                    return Array.isArray(parsed) ? parsed.join(', ') : parsed
                } catch {
                    return alat
                }
            }
            return alat
        }
        return '-'
    }


    const handleRejectClick = (ids: string[]) => {
        setRejectIds(ids)
        setRejectReason("")
    }

    const confirmReject = async () => {
        if (rejectIds && rejectReason.trim()) {
            // Process all rejections
            await Promise.all(rejectIds.map(id =>
                updateBookingStatus(id, "Ditolak", rejectReason)
            ))
            setRejectIds(null)
        }
    }

    const handleBulkApprove = async (ids: string[]) => {
        await Promise.all(ids.map(id =>
            updateBookingStatus(id, "Disetujui")
        ))
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Daftar Persetujuan Peminjaman</h2>
            {groupedBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    Tidak ada permintaan peminjaman yang menunggu persetujuan.
                </div>
            ) : (
                <div className="grid gap-4">
                    {groupedBookings.map((group, index) => (
                        <Card key={`${group.date}-${group.room}-${index}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{group.room}</CardTitle>
                                        <CardDescription>
                                            {group.date} | {group.startTime} - {group.endTime}
                                        </CardDescription>
                                    </div>
                                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                        Menunggu ({group.ids.length} Slot)
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Peminjam:</span> {group.user}
                                    </div>
                                    {group.tipePeminjam === "ukm" && (
                                        <div>
                                            <span className="font-medium">Asal UKM:</span> {group.organisasi}
                                        </div>
                                    )}
                                    {group.tipePeminjam === "ormawa" && (
                                        <div>
                                            <span className="font-medium">Asal Himpunan:</span> {group.organisasi}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Keperluan:</span> {group.details.keperluan}
                                    </div>
                                    <div>
                                        <span className="font-medium">Alat:</span> {safeRenderAlat(group.details.alat)}
                                    </div>
                                    {group.details.kakFile && (
                                        <div>
                                            <span className="font-medium">File KAK:</span> {group.details.kakFile}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRejectClick(group.ids)}
                                    >
                                        <X className="w-4 h-4 mr-1" /> Tolak
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleBulkApprove(group.ids)}
                                    >
                                        <Check className="w-4 h-4 mr-1" /> Setujui
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!rejectIds} onOpenChange={(open) => !open && setRejectIds(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masukkan Alasan Penolakan</DialogTitle>
                        <DialogDescription>
                            Jelaskan mengapa permohonan ini ditolak (akan diterapkan pada {rejectIds?.length} slot yang dipilih).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Alasan</Label>
                            <Textarea
                                id="reason"
                                placeholder="Contoh: Ruangan sedang direnovasi, Jadwal bentrok dengan kegiatan fakultas, dll."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectIds(null)}>Batal</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={!rejectReason.trim()}
                        >
                            Kirim Penolakan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

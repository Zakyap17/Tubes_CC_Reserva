"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface Booking {
    id: string
    room: string
    date: string // YYYY-MM-DD
    time: string // HH:MM
    user: string
    status: "Menunggu" | "Disetujui" | "Ditolak"
    tipePeminjam: "individu" | "ukm" | "ormawa"
    organisasi?: string
    alasanPenolakan?: string
    details: {
        keperluan: string
        alat: string[]
        kakFile?: string
    }
}

interface BookingContextType {
    bookings: Booking[]
    isLoading: boolean
    addBooking: (booking: Omit<Booking, "id" | "status"> | Omit<Booking, "id" | "status">[]) => Promise<void>
    updateBookingStatus: (id: string, status: Booking["status"], reason?: string) => Promise<void>
    cancelBooking: (id: string) => Promise<void>
    refreshBookings: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

function parseAlat(raw: unknown): string[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as string[]
    if (typeof raw === "string") {
        if (raw.startsWith("[")) {
            try { return JSON.parse(raw) } catch { /* fall through */ }
        }
        return raw ? [raw] : []
    }
    return []
}

function mapRowToBooking(row: Record<string, unknown>): Booking {
    const dateObj = new Date(row.waktu_mulai as string)
    const date = dateObj.toISOString().split("T")[0]
    const time = dateObj.toTimeString().slice(0, 5) // HH:MM

    return {
        id: String(row.id),
        room: row.ruangan as string,
        date,
        time,
        user: row.nama_peminjam as string,
        status: row.status as Booking["status"],
        tipePeminjam: row.tipe_peminjam as Booking["tipePeminjam"],
        organisasi: (row.organisasi as string) ?? undefined,
        alasanPenolakan: (row.alasan_penolakan as string) ?? undefined,
        details: {
            keperluan: row.keperluan as string,
            alat: parseAlat(row.alat),
            kakFile: undefined,
        },
    }
}

const POLL_INTERVAL_MS = 10_000 // 10 detik

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch("/api/bookings")
            if (!res.ok) {
                const { error } = await res.json()
                console.error("Gagal fetch bookings:", error)
                return
            }
            const rows: Record<string, unknown>[] = await res.json()
            setBookings(rows.map(mapRowToBooking))
        } catch (err) {
            console.error("Error saat fetch bookings:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch awal + polling tiap 10 detik sebagai pengganti realtime
    useEffect(() => {
        fetchBookings()
        const interval = setInterval(fetchBookings, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [fetchBookings])

    const addBooking = async (
        bookingData: Omit<Booking, "id" | "status"> | Omit<Booking, "id" | "status">[]
    ) => {
        const newBookingsData = Array.isArray(bookingData) ? bookingData : [bookingData]

        const dbPayloads = newBookingsData.map((b) => ({
            ruangan: b.room,
            waktu_mulai: `${b.date}T${b.time}:00`,
            tipe_peminjam: b.tipePeminjam,
            nama_peminjam: b.user,
            nim_peminjam: "-",
            organisasi: b.organisasi ?? null,
            keperluan: b.details.keperluan,
            alat: b.details.alat,
            status: "Menunggu",
        }))

        const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbPayloads),
        })

        if (!res.ok) {
            const { error } = await res.json()
            console.error("Error addBooking:", error)
            alert("Gagal menambah booking: " + error)
            return
        }

        await fetchBookings()
    }

    const updateBookingStatus = async (
        id: string,
        status: Booking["status"],
        reason?: string
    ) => {
        const res = await fetch(`/api/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, alasan_penolakan: reason ?? null }),
        })

        if (!res.ok) {
            const { error } = await res.json()
            console.error("Error updateBookingStatus:", error)
            alert("Gagal update status: " + error)
            return
        }

        await fetchBookings()
    }

    const cancelBooking = async (id: string) => {
        const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" })

        if (!res.ok) {
            const { error } = await res.json()
            console.error("Error cancelBooking:", error)
            alert("Gagal menghapus booking: " + error)
            return
        }

        await fetchBookings()
    }

    return (
        <BookingContext.Provider
            value={{ bookings, isLoading, addBooking, updateBookingStatus, cancelBooking, refreshBookings: fetchBookings }}
        >
            {children}
        </BookingContext.Provider>
    )
}

export function useBooking() {
    const context = useContext(BookingContext)
    if (context === undefined) {
        throw new Error("useBooking must be used within a BookingProvider")
    }
    return context
}

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
    try {
        const result = await pool.query(
            'SELECT * FROM bookings ORDER BY waktu_mulai DESC'
        )
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('GET /api/bookings error:', error)
        return NextResponse.json({ error: 'Gagal mengambil data bookings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const bookingsArray = Array.isArray(body) ? body : [body]

        for (const booking of bookingsArray) {
            await pool.query(
                `INSERT INTO bookings
                    (ruangan, waktu_mulai, tipe_peminjam, nama_peminjam, nim_peminjam, organisasi, keperluan, alat, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    booking.ruangan,
                    booking.waktu_mulai,
                    booking.tipe_peminjam,
                    booking.nama_peminjam,
                    booking.nim_peminjam ?? '-',
                    booking.organisasi ?? null,
                    booking.keperluan,
                    booking.alat ?? [],
                    booking.status ?? 'Menunggu',
                ]
            )
        }

        return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
        console.error('POST /api/bookings error:', error)
        return NextResponse.json({ error: 'Gagal menambah booking' }, { status: 500 })
    }
}

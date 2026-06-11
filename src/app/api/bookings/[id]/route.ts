import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { status, alasan_penolakan } = await request.json()

        if (!status) {
            return NextResponse.json({ error: 'Field status wajib diisi' }, { status: 400 })
        }

        await pool.query(
            'UPDATE bookings SET status = $1, alasan_penolakan = $2 WHERE id = $3',
            [status, alasan_penolakan ?? null, id]
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PATCH /api/bookings/[id] error:', error)
        return NextResponse.json({ error: 'Gagal mengupdate status booking' }, { status: 500 })
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const result = await pool.query(
            'DELETE FROM bookings WHERE id = $1 RETURNING id',
            [id]
        )

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/bookings/[id] error:', error)
        return NextResponse.json({ error: 'Gagal menghapus booking' }, { status: 500 })
    }
}

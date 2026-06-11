-- Jalankan file ini di server PostgreSQL Anda untuk membuat database PINTU
-- Perintah: psql -U postgres -d pintu_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS bookings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruangan       TEXT        NOT NULL,
    waktu_mulai   TIMESTAMP   NOT NULL,
    tipe_peminjam TEXT        NOT NULL CHECK (tipe_peminjam IN ('individu', 'ukm', 'ormawa')),
    nama_peminjam TEXT        NOT NULL,
    nim_peminjam  TEXT        NOT NULL DEFAULT '-',
    organisasi    TEXT,
    keperluan     TEXT        NOT NULL,
    alat          TEXT[]      NOT NULL DEFAULT '{}',
    status        TEXT        NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Disetujui', 'Ditolak')),
    alasan_penolakan TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk mempercepat query umum
CREATE INDEX IF NOT EXISTS idx_bookings_waktu_mulai ON bookings (waktu_mulai DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_nama        ON bookings (nama_peminjam);

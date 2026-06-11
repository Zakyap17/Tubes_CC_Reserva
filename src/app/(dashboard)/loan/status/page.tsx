"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"

interface Loan {
    id: string | number
    ruangan: string
    tanggalMulai: string
    status: string
    date: string
}

export default function LoanStatusPage() {
    const [myLoans, setMyLoans] = useState<Loan[]>([])

    useEffect(() => {
        // Load from local storage or use dummy data
        const storedLoans = JSON.parse(localStorage.getItem("loans") || "[]")

        // Add some dummy data if empty for demo purposes
        if (storedLoans.length === 0) {
            const dummyLoans = [
                {
                    id: "dummy-1",
                    ruangan: "Aula Utama",
                    tanggalMulai: "2023-12-10",
                    status: "Disetujui",
                    date: new Date().toISOString(),
                },
                {
                    id: "dummy-2",
                    ruangan: "Lab Komputer",
                    tanggalMulai: "2023-12-12",
                    status: "Menunggu",
                    date: new Date().toISOString(),
                },
                {
                    id: "dummy-3",
                    ruangan: "Ruang Rapat 2",
                    tanggalMulai: "2023-11-20",
                    status: "Ditolak",
                    date: new Date().toISOString(),
                },
            ]
            setMyLoans(dummyLoans)
        } else {
            setMyLoans(storedLoans)
        }
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Disetujui":
                return <Badge variant="success">Disetujui</Badge>
            case "Ditolak":
                return <Badge variant="destructive">Ditolak</Badge>
            default:
                return <Badge variant="warning">Menunggu</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Progres Peminjaman Saya</CardTitle>
                    <CardDescription>
                        Pantau status pengajuan peminjaman Anda di sini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {myLoans.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Belum ada pengajuan peminjaman.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal Pengajuan</TableHead>
                                    <TableHead>Ruangan</TableHead>
                                    <TableHead>Tanggal Pinjam</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myLoans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(loan.date).toLocaleDateString("id-ID")}
                                        </TableCell>
                                        <TableCell className="font-medium">{loan.ruangan}</TableCell>
                                        <TableCell>{loan.tanggalMulai}</TableCell>
                                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {loan.status === "Disetujui" && (
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Bukti</span>
                                                </Button>
                                            )}
                                            {loan.status === "Menunggu" && (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Sedang diproses
                                                </span>
                                            )}
                                            {loan.status === "Ditolak" && (
                                                <span className="text-xs text-destructive italic">
                                                    Hubungi Admin
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

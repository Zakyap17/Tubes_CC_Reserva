import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoanHistoryPage() {
    // Dummy data for history
    const historyData = [
        {
            id: 1,
            ruangan: "Aula Utama",
            peminjam: "BEM Fakultas",
            tanggal: "2023-12-01",
            waktu: "08:00 - 12:00",
            status: "Sedang Berlangsung",
        },
        {
            id: 2,
            ruangan: "Lab Komputer",
            peminjam: "UKM Robotik",
            tanggal: "2023-12-01",
            waktu: "13:00 - 15:00",
            status: "Terjadwal",
        },
        {
            id: 3,
            ruangan: "Ruang Rapat 1",
            peminjam: "Himpunan Mahasiswa Informatika",
            tanggal: "2023-12-02",
            waktu: "09:00 - 11:00",
            status: "Terjadwal",
        },
        {
            id: 4,
            ruangan: "Auditorium",
            peminjam: "UKM Tari",
            tanggal: "2023-12-03",
            waktu: "10:00 - 14:00",
            status: "Terjadwal",
        },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Peminjaman Aktif</CardTitle>
                    <CardDescription>
                        Berikut adalah daftar ruangan dan alat yang sedang atau akan dipinjam.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Peminjam</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.ruangan}</TableCell>
                                    <TableCell>{item.peminjam}</TableCell>
                                    <TableCell>{item.tanggal}</TableCell>
                                    <TableCell>{item.waktu}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === "Sedang Berlangsung" ? "destructive" : "secondary"}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

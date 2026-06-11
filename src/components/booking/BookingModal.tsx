"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, User, Users, Building2, ArrowLeft } from "lucide-react"

const daftarUKM = [
    "UKM GIBEI", "UKM STIMBARA", "UKM PSM", "UKM BASKET", "UKM BADMINTON",
    "UKM SIMS", "UKM ESPORTS", "UKM FUTSAL", "UKM PSHT", "UKM VOLI", "UKM LDK"
]

const daftarOrmawa = [
    "SEMA", "BEM", "HIMA SISTEM INFORMASI", "HIMA EKONOMI SYARIAH",
    "HIMPUNAN ARGO INDUSTRI", "HIMPUNAN TEKNIK LOGISTIK", "HIMPUNAN MANAJEMEN",
    "HIMPUNAN INFORMATIKA", "HIMPUNAN AKUNTANSI", "HIMPUNAN MANAJEMEN REKAYASA",
    "HIMPUNAN DKV", "HIMPUNAN TEKNIK KIMIA"
]

type BorrowerType = "individu" | "ukm" | "ormawa"
type Step = "selection" | "form"

export function BookingModal({ isOpen, onClose, onSubmit, selectedSlots }: {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (data: any) => void,
    selectedSlots: { room: string, time: string }[]
}) {
    const [step, setStep] = useState<Step>("selection")
    const [tipePeminjam, setTipePeminjam] = useState<BorrowerType | null>(null)
    const [organization, setOrganization] = useState("")

    const [keperluan, setKeperluan] = useState("")
    const [alat, setAlat] = useState<string[]>([])

    const [kakFile, setKakFile] = useState<File | null>(null)
    const [startMinute, setStartMinute] = useState<number>(0)

    // Calculate earliest start hour from selectedSlots
    const getStartHour = () => {
        if (!selectedSlots.length) return "00"
        const sortedTimes = selectedSlots.map(s => s.time).sort()
        return sortedTimes[0].split(":")[0]
    }
    const startHour = getStartHour()

    const equipmentOptions = ["Proyektor", "Sound System", "Kabel HDMI", "Kamera"]

    const resetForm = () => {
        setStep("selection")
        setTipePeminjam(null)
        setOrganization("")
        setKeperluan("")
        setAlat([])

        setKakFile(null)
        setStartMinute(0)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleBorrowerSelect = (type: BorrowerType) => {
        setTipePeminjam(type)
        setStep("form")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            tipePeminjam,
            organisasi: tipePeminjam === "individu" ? undefined : organization,
            keperluan,
            alat,

            kakFile: kakFile ? kakFile.name : undefined,
            waktuMulai: `${startHour}:${startMinute.toString().padStart(2, '0')}`
        })
        handleClose()
    }

    const handleEquipmentChange = (item: string) => {
        setAlat(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        )
    }

    // Group slots by room for display
    const slotsByRoom = selectedSlots.reduce((acc, slot) => {
        if (!acc[slot.room]) acc[slot.room] = []
        acc[slot.room].push(slot.time)
        return acc
    }, {} as Record<string, string[]>)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === "selection" ? "Pilih Tipe Peminjam" : "Formulir Peminjaman"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "selection"
                            ? "Silakan pilih kategori peminjam yang sesuai."
                            : "Lengkapi detail peminjaman di bawah ini."}
                    </DialogDescription>
                </DialogHeader>

                {step === "selection" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                        <div
                            onClick={() => handleBorrowerSelect("individu")}
                            className="cursor-pointer border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <User className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                            </div>
                            <span className="font-semibold text-slate-700 group-hover:text-blue-700">Individu</span>
                        </div>

                        <div
                            onClick={() => handleBorrowerSelect("ukm")}
                            className="cursor-pointer border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <Users className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
                            </div>
                            <span className="font-semibold text-slate-700 group-hover:text-emerald-700">UKM</span>
                        </div>

                        <div
                            onClick={() => handleBorrowerSelect("ormawa")}
                            className="cursor-pointer border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <Building2 className="w-6 h-6 text-slate-600 group-hover:text-purple-600" />
                            </div>
                            <span className="font-semibold text-slate-700 group-hover:text-purple-700">Ormawa</span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep("selection")}
                                className="h-8 px-2 text-muted-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali
                            </Button>
                            <div className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full capitalize">
                                Tipe: {tipePeminjam}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
                            <p className="font-medium text-slate-900">Ringkasan Peminjaman:</p>
                            {Object.entries(slotsByRoom).map(([room, times]) => (
                                <div key={room} className="flex flex-col">
                                    <span className="font-semibold">{room}</span>
                                    <span className="text-slate-600">Jam: {times.sort().join(", ")}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                            <Label className="font-medium text-slate-900">Detail Waktu Mulai</Label>
                            <div className="flex items-end gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Jam (Awal)</Label>
                                    <Input
                                        value={startHour}
                                        disabled
                                        className="bg-slate-100 font-mono text-center"
                                    />
                                </div>
                                <span className="pb-2 font-bold text-slate-400">:</span>
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Menit</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={startMinute}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            if (!isNaN(val) && val >= 0 && val <= 59) {
                                                setStartMinute(val)
                                            } else if (e.target.value === "") {
                                                // Allow empty temporarily while typing, or handle as 0
                                                // But for controlled input number, usually better to keep valid
                                                // user might backspace everything. Let's just handle valid range or reset.
                                                // Simple validation:
                                            }
                                        }}
                                        // Better handler for number input to allow typing cleanly
                                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            let val = parseInt(e.target.value)
                                            if (val < 0) val = 0
                                            if (val > 59) val = 59
                                            // This onInput approach might fight with React's onChange slightly if not careful
                                            // Let's stick to standard onChange with clamp logic or just valid number check
                                        }}
                                        className="font-mono text-center"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                *Masuk lebih awal (misal {startHour}:15)
                            </p>
                        </div>

                        {tipePeminjam === "ukm" && (
                            <div className="space-y-2">
                                <Label htmlFor="ukm-select">Pilih UKM</Label>
                                <select
                                    id="ukm-select"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Pilih UKM...</option>
                                    {daftarUKM.map(ukm => (
                                        <option key={ukm} value={ukm}>{ukm}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tipePeminjam === "ormawa" && (
                            <div className="space-y-2">
                                <Label htmlFor="ormawa-select">Pilih Ormawa/Himpunan</Label>
                                <select
                                    id="ormawa-select"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Pilih Ormawa...</option>
                                    {daftarOrmawa.map(ormawa => (
                                        <option key={ormawa} value={ormawa}>{ormawa}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="keperluan">Keperluan</Label>
                            <Textarea
                                id="keperluan"
                                value={keperluan}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeperluan(e.target.value)}
                                placeholder="Contoh: Rapat Rutin, Seminar, dll."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Peralatan Tambahan</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {equipmentOptions.map((item) => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`equip-${item}`}
                                            checked={alat.includes(item)}
                                            onCheckedChange={() => handleEquipmentChange(item)}
                                        />
                                        <Label htmlFor={`equip-${item}`} className="text-sm font-normal cursor-pointer">
                                            {item}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {tipePeminjam !== "individu" && (
                            <div className="space-y-2">
                                <Label htmlFor="kak">Upload KAK</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">
                                        Upload PDF/DOCX
                                    </span>
                                    <Input
                                        id="kak"
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKakFile(e.target.files?.[0] || null)}
                                    />
                                    {kakFile && (
                                        <span className="text-xs text-primary font-medium mt-1 z-10">
                                            {kakFile.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" className="w-full">Ajukan Peminjaman</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

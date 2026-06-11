"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const success = login(username, password)
        if (success) {
            router.push("/") // Redirect to the dashboard
        } else {
            setError("Username atau password salah!")
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Masukan kredensial akun universitas Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                placeholder="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full">
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-6 rounded-lg bg-slate-100 p-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <p className="font-bold mb-2">Hint Credential (Demo):</p>
                        <ul className="space-y-1 list-disc pl-4">
                            <li>User: <span className="font-mono">mahasiswa1@gmail.com</span>, Pass: <span className="font-mono">mahasiswa1</span></li>
                            <li>User: <span className="font-mono">mahasiswa2@gmail.com</span>, Pass: <span className="font-mono">mahasiswa2</span></li>
                            <li>User: <span className="font-mono">admin</span>, Pass: <span className="font-mono">admin</span></li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

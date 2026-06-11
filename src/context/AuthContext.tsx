"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type UserRole = "mahasiswa" | "admin"

interface User {
    username: string
    role: UserRole
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (username: string, pass: string) => boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (username: string, pass: string) => {
        if (username === "mahasiswa1@gmail.com" && pass === "mahasiswa1") {
            const newUser: User = { username: "Mahasiswa1", role: "mahasiswa" }
            setUser(newUser)
            localStorage.setItem("user", JSON.stringify(newUser))
            return true
        }
        if (username === "mahasiswa2@gmail.com" && pass === "mahasiswa2") {
            const newUser: User = { username: "Mahasiswa2", role: "mahasiswa" }
            setUser(newUser)
            localStorage.setItem("user", JSON.stringify(newUser))
            return true
        }
        if (username === "admin" && pass === "admin") {
            const newUser: User = { username: "Admin", role: "admin" }
            setUser(newUser)
            localStorage.setItem("user", JSON.stringify(newUser))
            return true
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


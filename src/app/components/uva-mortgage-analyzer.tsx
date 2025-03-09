"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { UvaMortgageParams, PastPrepayment } from "../lib/uva-types"
import DatePicker from "@/components/ui/date-picker"

interface UvaMortgageAnalyzerProps {
    onAnalyze: (params: UvaMortgageParams) => void
    showPrepaymentOptions: boolean
    setShowPrepaymentOptions: (show: boolean) => void
}

export function UvaMortgageAnalyzer({
    onAnalyze,
    showPrepaymentOptions,
    setShowPrepaymentOptions,
}: UvaMortgageAnalyzerProps) {
    const [formData, setFormData] = useState<Partial<UvaMortgageParams>>({})
    const [formattedValues, setFormattedValues] = useState<Record<string, string>>({})
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [currentUvaValue, setCurrentUvaValue] = useState<number | null>(null)
    const [isLoadingUva, setIsLoadingUva] = useState(false)
    const [pastPrepayments, setPastPrepayments] = useState<PastPrepayment[]>([])
    const [newPrepayment, setNewPrepayment] = useState<Partial<PastPrepayment>>({})
    const [newPrepaymentDate, setNewPrepaymentDate] = useState<Date | undefined>(undefined)

    // Estados para el modo de precancelación
    const [prepaymentMode, setPrepaymentMode] = useState<"detailed" | "total">("detailed")
    const [totalPrepaymentAmount, setTotalPrepaymentAmount] = useState<number | any>(undefined)
    const [totalPrepaymentUnit, setTotalPrepaymentUnit] = useState<"pesos" | "uvas">("pesos")

    // Función para formatear números con separadores de miles y decimales
    const formatNumber = (value: any | undefined, decimals = 0): string => {
        if (value === undefined) return ""

        // Convertir a string con el número de decimales especificado
        const parts = value.toFixed(decimals).split(".")

        // Formatear la parte entera con separadores de miles
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")

        // Unir con coma como separador decimal si hay decimales
        return parts.length > 1 ? parts.join(",") : parts[0]
    }

    // Función para parsear un string formateado a número
    const parseFormattedNumber = (formattedValue: string): number => {
        if (!formattedValue) return 0

        // Reemplazar puntos y convertir comas a puntos para el parseo
        const normalizedValue = formattedValue.replace(/\./g, "").replace(",", ".")
        return Number.parseFloat(normalizedValue) || 0
    }

    useEffect(() => {
        const fetchUvaValue = async () => {
            setIsLoadingUva(true)
            try {
                // En Next.js 15, las rutas API se manejan diferente
                const response = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/uva')

                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.status}`);
                }

                const data = await response.json();

                // Obtenemos el último valor de UVA (el más reciente)
                const latestUvaData = data[data.length - 1];
                const latestUvaValue = latestUvaData?.valor || 0;

                setCurrentUvaValue(latestUvaValue);

                // Actualizar el valor de UVA en el formulario
                setFormData((prev) => ({
                    ...prev,
                    currentUvaValue: latestUvaValue,
                }));

            } catch (error) {
                console.error("Error al obtener el valor de UVA:", error);

                // En caso de error, usamos un valor por defecto
                const fallbackValue = 420.75;
                setCurrentUvaValue(fallbackValue);

                setFormData((prev) => ({
                    ...prev,
                    currentUvaValue: fallbackValue,
                }));

            } finally {
                setIsLoadingUva(false);
            }
        }

        fetchUvaValue();
    }, []);

    // Inicializar los valores formateados cuando cambian los datos del formulario
    useEffect(() => {
        const newFormattedValues: Record<string, string> = {}

        if (formData.uvaAmount !== undefined) {
            newFormattedValues.uvaAmount = formatNumber(formData.uvaAmount, 0)
        }

        if (formData.annualInterestRate !== undefined) {
            newFormattedValues.annualInterestRate = formatNumber(formData.annualInterestRate, 2)
        }

        if (formData.loanTermYears !== undefined) {
            newFormattedValues.loanTermYears = formatNumber(formData.loanTermYears, 0)
        }

        if (formData.currentUvaValue !== undefined) {
            newFormattedValues.currentUvaValue = formatNumber(formData.currentUvaValue, 2)
        }

        if (formData.futurePrepaymentAmount !== undefined) {
            newFormattedValues.futurePrepaymentAmount = formatNumber(formData.futurePrepaymentAmount, 0)
        }

        if (formData.futurePrepaymentFrequencyMonths !== undefined) {
            newFormattedValues.futurePrepaymentFrequencyMonths = formatNumber(formData.futurePrepaymentFrequencyMonths, 0)
        }

        if (formData.futurePrepaymentFeePercentage !== undefined) {
            newFormattedValues.futurePrepaymentFeePercentage = formatNumber(formData.futurePrepaymentFeePercentage, 2)
        }

        setFormattedValues(newFormattedValues)
    }, [formData])

    // Inicializar los valores formateados para el nuevo prepago
    useEffect(() => {
        const newFormattedPrepayment: Record<string, string> = {}

        if (newPrepayment.amount !== undefined) {
            newFormattedPrepayment.amount = formatNumber(newPrepayment.amount, 0)
        }

        setFormattedValues((prev) => ({
            ...prev,
            newPrepaymentAmount: newFormattedPrepayment.amount || "",
        }))
    }, [newPrepayment])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        // Si el valor está vacío, actualizar ambos estados
        if (value === "") {
            setFormData((prev) => ({ ...prev, [name]: undefined }))
            setFormattedValues((prev) => ({ ...prev, [name]: "" }))
            return
        }

        // Para valores que no están vacíos, intentamos parsear
        try {
            // Permitir la entrada de caracteres válidos para el formato
            if (/^[0-9.,]*$/.test(value)) {
                setFormattedValues((prev) => ({ ...prev, [name]: value }))

                // Solo actualizar el valor numérico si es un número válido
                const numericValue = parseFormattedNumber(value)
                if (!isNaN(numericValue)) {
                    setFormData((prev) => ({ ...prev, [name]: numericValue }))
                }
            }
        } catch (error) {
            console.error("Error parsing number:", error)
        }
    }

    const handleNewPrepaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === "newPrepaymentAmount") {
            // Si el valor está vacío, limpiar el estado
            if (value === "") {
                setNewPrepayment((prev) => ({ ...prev, amount: undefined }))
                setFormattedValues((prev) => ({ ...prev, newPrepaymentAmount: "" }))
                return
            }

            // Para valores que no están vacíos, intentamos parsear
            try {
                if (/^[0-9.,]*$/.test(value)) {
                    setFormattedValues((prev) => ({ ...prev, newPrepaymentAmount: value }))

                    const numericValue = parseFormattedNumber(value)
                    if (!isNaN(numericValue)) {
                        setNewPrepayment((prev) => ({ ...prev, amount: numericValue }))
                    }
                }
            } catch (error) {
                console.error("Error parsing number:", error)
            }
        }
    }

    const handleTotalPrepaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target

        if (value === "") {
            setTotalPrepaymentAmount(undefined)
            setFormattedValues((prev) => ({ ...prev, totalPrepaymentAmount: "" }))
            return
        }

        try {
            if (/^[0-9.,]*$/.test(value)) {
                setFormattedValues((prev) => ({ ...prev, totalPrepaymentAmount: value }))

                const numericValue = parseFormattedNumber(value)
                if (!isNaN(numericValue)) {
                    setTotalPrepaymentAmount(numericValue)
                }
            }
        } catch (error) {
            console.error("Error parsing number:", error)
        }
    }

    const handleTotalPrepaymentBlur = () => {
        if (totalPrepaymentAmount !== undefined) {
            setFormattedValues((prev) => ({
                ...prev,
                totalPrepaymentAmount: formatNumber(totalPrepaymentAmount, 0),
            }))
        }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target
        const value = formData[name as keyof UvaMortgageParams]

        if (value !== undefined) {
            const decimals =
                name === "annualInterestRate" || name === "currentUvaValue" || name === "futurePrepaymentFeePercentage" ? 2 : 0
            setFormattedValues((prev) => ({
                ...prev,
                [name]: formatNumber(value, decimals),
            }))
        }
    }

    const handleNewPrepaymentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.name === "newPrepaymentAmount" && newPrepayment.amount !== undefined) {
            setFormattedValues((prev) => ({
                ...prev,
                newPrepaymentAmount: formatNumber(newPrepayment.amount, 0),
            }))
        }
    }

    const handleDateChange = (date: Date | undefined) => {
        setStartDate(date)
        if (date) {
            setFormData((prev) => ({
                ...prev,
                startDate: date,
            }))
        }
    }

    const handleNewPrepaymentDateChange = (date: Date | undefined) => {
        setNewPrepaymentDate(date)
        if (date) {
            setNewPrepayment((prev) => ({
                ...prev,
                date: date,
            }))
        }
    }

    const handleAddPrepayment = () => {
        if (newPrepayment.amount && newPrepayment.date) {
            const newPrepaymentItem: PastPrepayment = {
                amount: newPrepayment.amount,
                date: newPrepayment.date,
            }

            setPastPrepayments((prev) => [...prev, newPrepaymentItem])

            // Limpiar el formulario de nuevo prepago
            setNewPrepayment({})
            setNewPrepaymentDate(undefined)
            setFormattedValues((prev) => ({
                ...prev,
                newPrepaymentAmount: "",
            }))
        }
    }

    const handleRemovePrepayment = (index: number) => {
        setPastPrepayments((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!startDate) return

        // Crear una copia de las precancelaciones existentes
        let prepayments = [...pastPrepayments]

        // Si estamos en modo "total" y hay un monto total, crear una precancelación única
        if (prepaymentMode === "total" && totalPrepaymentAmount && totalPrepaymentAmount > 0) {
            // Usar la fecha actual para la precancelación total
            const today = new Date()

            if (totalPrepaymentUnit === "pesos") {
                prepayments = [
                    {
                        amount: totalPrepaymentAmount,
                        date: today,
                    },
                ]
            } else {
                // UVAs
                // Convertir UVAs a pesos usando el valor actual
                const amountInPesos = totalPrepaymentAmount * (currentUvaValue || 0)
                prepayments = [
                    {
                        amount: amountInPesos,
                        date: today,
                    },
                ]
            }
        }

        const params: UvaMortgageParams = {
            uvaAmount: formData.uvaAmount || 0,
            annualInterestRate: formData.annualInterestRate || 0,
            loanTermYears: formData.loanTermYears || 0,
            startDate: startDate,
            currentUvaValue: formData.currentUvaValue || currentUvaValue || 0,
            pastPrepayments: prepayments,
            enableFuturePrepayments: showPrepaymentOptions,
            futurePrepaymentAmount: showPrepaymentOptions ? formData.futurePrepaymentAmount || 0 : 0,
            futurePrepaymentFrequencyMonths: showPrepaymentOptions ? formData.futurePrepaymentFrequencyMonths || 0 : 0,
            futurePrepaymentFeePercentage: showPrepaymentOptions ? formData.futurePrepaymentFeePercentage || 0 : 0,
        }

        onAnalyze(params)
    }

    function calculateBtnIsEnabled() {
        const requiredFields: (keyof UvaMortgageParams)[] = [
            "uvaAmount",
            "annualInterestRate",
            "loanTermYears",
            "currentUvaValue",
        ]

        const isEnabled =
            requiredFields.every((field) => formData[field] !== undefined && formData[field] !== null) &&
            startDate !== undefined

        return !isEnabled
    }

    const isPrepaymentAddEnabled =
        newPrepayment.amount !== undefined && newPrepayment.amount > 0 && newPrepaymentDate !== undefined

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis de Crédito UVA Existente</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="uvaAmount">Monto en UVAs Solicitado</Label>
                        <Input
                            id="uvaAmount"
                            name="uvaAmount"
                            type="text"
                            value={formattedValues.uvaAmount || ""}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Ingrese el monto en UVAs"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="annualInterestRate">TNA (%)</Label>
                        <Input
                            id="annualInterestRate"
                            name="annualInterestRate"
                            type="text"
                            value={formattedValues.annualInterestRate || ""}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Ingrese la tasa anual"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="loanTermYears">Plazo (Años)</Label>
                        <Input
                            id="loanTermYears"
                            name="loanTermYears"
                            type="text"
                            value={formattedValues.loanTermYears || ""}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Ingrese el plazo en años"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de Inicio de Pago</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <DatePicker date={startDate} setDate={handleDateChange} />
                            </PopoverTrigger>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentUvaValue">Valor Actual de UVA</Label>
                        <div className="relative">
                            <Input
                                id="currentUvaValue"
                                name="currentUvaValue"
                                type="text"
                                value={formattedValues.currentUvaValue || ""}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Cargando valor de UVA..."
                                disabled={isLoadingUva}
                                required
                            />
                            {isLoadingUva && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor actualizado automáticamente. Puede modificarlo si lo desea.
                        </p>
                    </div>

                    {/* Sección de Precancelaciones Pasadas */}
                    <Separator className="my-4" />
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Precancelaciones Realizadas</h3>

                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="mode-detailed"
                                        name="prepayment-mode"
                                        className="h-4 w-4 text-primary border-primary rounded focus:ring-primary"
                                        checked={prepaymentMode === "detailed"}
                                        onChange={() => setPrepaymentMode("detailed")}
                                    />
                                    <Label htmlFor="mode-detailed">Detallado</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="mode-total"
                                        name="prepayment-mode"
                                        className="h-4 w-4 text-primary border-primary rounded focus:ring-primary"
                                        checked={prepaymentMode === "total"}
                                        onChange={() => setPrepaymentMode("total")}
                                    />
                                    <Label htmlFor="mode-total">Monto Total</Label>
                                </div>
                            </div>

                            {prepaymentMode === "detailed" ? (
                                <>
                                    {pastPrepayments.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="rounded-md border">
                                                <table className="min-w-full divide-y divide-border">
                                                    <thead>
                                                        <tr className="bg-muted/50">
                                                            <th className="px-4 py-2 text-left text-sm font-medium">Fecha</th>
                                                            <th className="px-4 py-2 text-left text-sm font-medium">Monto</th>
                                                            <th className="px-4 py-2 text-center text-sm font-medium">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {pastPrepayments.map((prepayment, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-sm">{format(prepayment.date, "dd/MM/yyyy")}</td>
                                                                <td className="px-4 py-2 text-sm">${formatNumber(prepayment.amount, 0)}</td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleRemovePrepayment(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No hay precancelaciones registradas. Agregue las precancelaciones que ya realizó.
                                        </p>
                                    )}

                                    <div className="space-y-4 rounded-md border p-4">
                                        <h4 className="text-sm font-medium">Agregar Precancelación</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPrepaymentDate">Fecha</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <DatePicker date={newPrepaymentDate} setDate={handleNewPrepaymentDateChange} />
                                                    </PopoverTrigger>
                                                </Popover>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPrepaymentAmount">Monto</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        id="newPrepaymentAmount"
                                                        name="newPrepaymentAmount"
                                                        type="text"
                                                        value={formattedValues.newPrepaymentAmount || ""}
                                                        onChange={handleNewPrepaymentChange}
                                                        onBlur={handleNewPrepaymentBlur}
                                                        placeholder="Ingrese el monto"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={handleAddPrepayment}
                                                        disabled={!isPrepaymentAddEnabled}
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 rounded-md border p-4">
                                    <h4 className="text-sm font-medium">Monto Total Precancelado</h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalPrepaymentAmount">Monto Total</Label>
                                            <Input
                                                id="totalPrepaymentAmount"
                                                name="totalPrepaymentAmount"
                                                type="text"
                                                value={formattedValues.totalPrepaymentAmount || ""}
                                                onChange={handleTotalPrepaymentChange}
                                                onBlur={handleTotalPrepaymentBlur}
                                                placeholder="Ingrese el monto total precancelado"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalPrepaymentUnit">Unidad</Label>
                                            <div className="flex items-center space-x-4 h-10">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="unit-pesos"
                                                        name="prepayment-unit"
                                                        className="h-4 w-4 text-primary border-primary rounded focus:ring-primary"
                                                        checked={totalPrepaymentUnit === "pesos"}
                                                        onChange={() => setTotalPrepaymentUnit("pesos")}
                                                    />
                                                    <Label htmlFor="unit-pesos">Pesos</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="unit-uvas"
                                                        name="prepayment-unit"
                                                        className="h-4 w-4 text-primary border-primary rounded focus:ring-primary"
                                                        checked={totalPrepaymentUnit === "uvas"}
                                                        onChange={() => setTotalPrepaymentUnit("uvas")}
                                                    />
                                                    <Label htmlFor="unit-uvas">UVAs</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            El monto total se distribuirá automáticamente en el análisis del crédito.
                                            {totalPrepaymentUnit === "uvas" && currentUvaValue && totalPrepaymentAmount > 0 && (
                                                <>
                                                    {" "}
                                                    Equivalente a aproximadamente ${formatNumber(totalPrepaymentAmount * currentUvaValue, 0)}{" "}
                                                    pesos al valor UVA actual.
                                                </>
                                            )}
                                            {totalPrepaymentUnit === "pesos" && currentUvaValue && totalPrepaymentAmount > 0 && (
                                                <>
                                                    {" "}
                                                    Equivalente a aproximadamente {formatNumber(totalPrepaymentAmount / currentUvaValue, 2)} UVAs
                                                    al valor UVA actual.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de Precancelaciones Futuras */}
                    <Separator className="my-4" />
                    <div className="flex items-center space-x-2 pt-2 mb-3.5">
                        <Switch
                            id="future-prepayment-options"
                            checked={showPrepaymentOptions}
                            onCheckedChange={setShowPrepaymentOptions}
                        />
                        <Label htmlFor="future-prepayment-options">Habilitar Precancelaciones Futuras</Label>
                    </div>

                    {showPrepaymentOptions && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="futurePrepaymentAmount">Monto de Precancelación</Label>
                                <Input
                                    id="futurePrepaymentAmount"
                                    name="futurePrepaymentAmount"
                                    type="text"
                                    value={formattedValues.futurePrepaymentAmount || ""}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Ingrese el monto a precancelar"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="futurePrepaymentFrequencyMonths">Frecuencia de Precancelación (Meses)</Label>
                                <Input
                                    id="futurePrepaymentFrequencyMonths"
                                    name="futurePrepaymentFrequencyMonths"
                                    type="text"
                                    value={formattedValues.futurePrepaymentFrequencyMonths || ""}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Ingrese la frecuencia de precancelamiento"
                                />
                            </div>
                            <div className="space-y-2 mb-3.5">
                                <Label htmlFor="futurePrepaymentFeePercentage">Comisión de Precancelación (%)</Label>
                                <Input
                                    id="futurePrepaymentFeePercentage"
                                    name="futurePrepaymentFeePercentage"
                                    type="text"
                                    value={formattedValues.futurePrepaymentFeePercentage || ""}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Ingrese el porcentaje de cobro de precancelación"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button disabled={calculateBtnIsEnabled()} type="submit" className="w-full">
                        Analizar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}


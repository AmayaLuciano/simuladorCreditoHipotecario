"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import type { MortgageParams } from "../lib/types"

interface MortgageCalculatorProps {
    onCalculate: (params: MortgageParams) => void
    showPrepaymentOptions: boolean;
    setShowPrepaymentOptions: any;
}

export function MortgageCalculator({ onCalculate, showPrepaymentOptions, setShowPrepaymentOptions }: MortgageCalculatorProps) {
    const [formData, setFormData] = useState<Partial<MortgageParams>>({})

    const formatNumberWithDotsAndCommas = (value: string) => {
        let numericValue = value.replace(/[^0-9,]/g, "");

        let [integerPart, decimalPart] = numericValue.split(",");

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return decimalPart !== undefined ? `${integerPart},${decimalPart}` : integerPart;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const formattedValue = value === "" ? undefined : formatNumberWithDotsAndCommas(value);

        setFormData({
            ...formData,
            [name]: formattedValue,
        });
    };

    const convertFormDataToNumbers = (formData: Partial<MortgageParams>) => {
        return {
            loanAmount: Number(formData.loanAmount?.toString().replace(/\./g, "").replace(",", ".")) || 0,
            annualInterestRate: Number(formData.annualInterestRate?.toString().replace(/\./g, "").replace(",", ".")) || 0,
            loanTermYears: Number(formData.loanTermYears?.toString().replace(/\./g, "").replace(",", ".")) || 0,
            prepaymentAmount: Number(formData.prepaymentAmount?.toString().replace(/\./g, "").replace(",", ".")) || 0,
            prepaymentFrequencyMonths: Number(formData.prepaymentFrequencyMonths?.toString().replace(/\./g, "").replace(",", ".")) || 0,
            prepaymentFeePercentage: Number(formData.prepaymentFeePercentage?.toString().replace(/\./g, "").replace(",", ".")) || 0,
        };
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const params: MortgageParams = {
            loanAmount: formData.loanAmount || 0,
            annualInterestRate: formData.annualInterestRate || 0,
            loanTermYears: formData.loanTermYears || 0,
            prepaymentAmount: formData.prepaymentAmount || 0,
            prepaymentFrequencyMonths: formData.prepaymentFrequencyMonths || 0,
            prepaymentFeePercentage: formData.prepaymentFeePercentage || 0,
        }
        const formattedData = convertFormDataToNumbers(formData);

        onCalculate(formattedData)
    }

    function calculateBtnIsEnabled() {
        const requiredFields: (keyof MortgageParams)[] = [
            "loanAmount",
            "annualInterestRate",
            "loanTermYears",
        ];
        const isEnabled = requiredFields.every((field) => formData[field] !== undefined && formData[field] !== null);
        return !isEnabled
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalles del Crédito Hipotecario</CardTitle>
                {/* <CardDescription>Enter the details of your mortgage loan</CardDescription> */}
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="loanAmount">Monto a Solicitar</Label>
                        <Input
                            id="loanAmount"
                            name="loanAmount"
                            value={formData.loanAmount || ""}
                            onChange={handleInputChange}
                            placeholder="Ingrese un monto"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="annualInterestRate">TNA (%)</Label>
                        <Input
                            id="annualInterestRate"
                            name="annualInterestRate"
                            step="0.01"
                            value={formData.annualInterestRate || ""}
                            onChange={handleInputChange}
                            placeholder="Ingrese una tasa anual"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="loanTermYears">Plazo (Años)</Label>
                        <Input
                            id="loanTermYears"
                            name="loanTermYears"
                            value={formData.loanTermYears || ""}
                            onChange={handleInputChange}
                            placeholder="Ingrese la cantidad de años"
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-4 mb-3">
                        <Switch
                            id="prepayment-options"
                            checked={showPrepaymentOptions}
                            onCheckedChange={setShowPrepaymentOptions}
                        />
                        <Label htmlFor="prepayment-options">Habilitar Pagos de Precancelación</Label>
                    </div>

                    {showPrepaymentOptions && (
                        <>
                            <Separator className="my-2" />
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="prepaymentAmount">Monto a Precancelar</Label>
                                    <Input
                                        id="prepaymentAmount"
                                        name="prepaymentAmount"
                                        value={formData.prepaymentAmount || ""}
                                        placeholder="Ingrese el monto a precancelar"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prepaymentFrequencyMonths">Frecuencia de Precancelación (Meses)</Label>
                                    <Input
                                        id="prepaymentFrequencyMonths"
                                        name="prepaymentFrequencyMonths"
                                        value={formData.prepaymentFrequencyMonths || ""}
                                        onChange={handleInputChange}
                                        placeholder="Ingrese la frecuencia de precancelamiento"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prepaymentFeePercentage">Comisión por Precancelación (%)</Label>
                                    <Input
                                        id="prepaymentFeePercentage"
                                        name="prepaymentFeePercentage"
                                        step="0.01"
                                        value={formData.prepaymentFeePercentage || ""}
                                        onChange={handleInputChange}
                                        placeholder="Ingrese la comisión por precancelación"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button disabled={calculateBtnIsEnabled()} type="submit" className="w-full">
                        Calculate
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}


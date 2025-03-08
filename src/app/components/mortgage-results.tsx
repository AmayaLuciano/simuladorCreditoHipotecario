"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "../lib/utils"
import type { MortgageResults as MortgageResultsType } from "../lib/types"
import { TabsContent, TabsTrigger, Tabs, TabsList } from "@/components/ui/tabs"

interface MortgageResultsProps {
    results: MortgageResultsType
    showPrepaymentOptions: boolean;
}

export function MortgageResults({ results, showPrepaymentOptions }: MortgageResultsProps) {
    const [activeTab, setActiveTab] = useState("summary")

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resultados de tu Crédito Hipotecario</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Resumen</TabsTrigger>
                        <TabsTrigger value="monthly">Desglose Mensual</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pago Mensual</p>
                                <p className="text-xl font-semibold">{formatCurrency(results.monthlyPayment)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Tiempo de Pago</p>
                                <p className="text-xl font-semibold">
                                    {results.monthsUntilPayoff} meses ({(results.monthsUntilPayoff / 12).toFixed(1)} años)
                                </p>
                            </div>
                        </div>
                        {showPrepaymentOptions &&
                            <div className="rounded-lg bg-muted p-4 mt-4">
                                <h3 className="font-medium mb-2">Con Precancelaciones</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total Pagado</p>
                                        <p className="font-medium">{formatCurrency(results.totalPaid)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total de Interéses</p>
                                        <p className="font-medium">{formatCurrency(results.totalInterest)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total Precancelado</p>
                                        <p className="font-medium">{formatCurrency(results.totalPrepaid)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Comision de Precancelación</p>
                                        <p className="font-medium">{formatCurrency(results.totalPrepaymentFees)}</p>
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="rounded-lg bg-muted p-4">
                            <h3 className="font-medium mb-2">Sin Precancelaciones</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Pagado</p>
                                    <p className="font-medium">{formatCurrency(results.totalPaidWithoutPrepayments)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total de Intereses</p>
                                    <p className="font-medium">{formatCurrency(results.totalInterestWithoutPrepayments)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-primary/10 p-4">
                            <h3 className="font-medium mb-2">Ahorros</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
                                    <p className="font-medium">
                                        {results.timeSavedMonths} meses ({(results.timeSavedMonths / 12).toFixed(1)} años)
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Intereses Ahorrados</p>
                                    <p className="font-medium">{formatCurrency(results.interestSaved)}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="monthly" className="pt-4">
                        <div className="rounded-md border max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mes</TableHead>
                                        <TableHead>Pago</TableHead>
                                        <TableHead>Interés</TableHead>
                                        <TableHead>Principal</TableHead>
                                        <TableHead>Precancelado</TableHead>
                                        <TableHead>Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.monthlyData.map((month) => (
                                        <TableRow key={month.month}>
                                            <TableCell>{month.month}</TableCell>
                                            <TableCell>{formatCurrency(month.payment)}</TableCell>
                                            <TableCell>{formatCurrency(month.interest)}</TableCell>
                                            <TableCell>{formatCurrency(month.principal)}</TableCell>
                                            <TableCell>{month.prepayment > 0 ? formatCurrency(month.prepayment) : "-"}</TableCell>
                                            <TableCell>{formatCurrency(month.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}


"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "../lib/utils"
import type { UvaMortgageResults as UvaMortgageResultsType } from "../lib/uva-types"
interface UvaMortgageResultsProps {
    results: UvaMortgageResultsType
}

export function UvaMortgageResults({ results }: UvaMortgageResultsProps) {
    const [activeTab, setActiveTab] = useState("summary")

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis de Crédito UVA</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Resumen</TabsTrigger>
                        <TabsTrigger value="monthly">Detalle Mensual</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Cuota Inicial (UVAs)</p>
                                <p className="text-xl font-semibold">{formatNumber(results.initialUvaPayment, 2)} UVAs</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Cuota Actual (UVAs)</p>
                                <p className="text-xl font-semibold">{formatNumber(results.currentUvaPayment, 2)} UVAs</p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted p-4 mt-4">
                            <h3 className="font-medium mb-2">Situación Actual</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Cuota Actual ($)</p>
                                    <p className="font-medium">{formatCurrency(results.currentPaymentAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Saldo Pendiente (UVAs)</p>
                                    <p className="font-medium">{formatNumber(results.remainingUvaBalance, 2)} UVAs</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Saldo Pendiente ($)</p>
                                    <p className="font-medium">{formatCurrency(results.remainingPesoBalance)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Cuotas Pagadas</p>
                                    <p className="font-medium">
                                        {results.paidInstallments} de {results.totalInstallments}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                            <h3 className="font-medium mb-2">Evolución del Crédito</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Monto Original ($)</p>
                                    <p className="font-medium">{formatCurrency(results.originalLoanAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Valor UVA Inicial</p>
                                    <p className="font-medium">{formatNumber(results.initialUvaValue, 2)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Valor UVA Actual</p>
                                    <p className="font-medium">{formatNumber(results.currentUvaValue, 2)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Variación UVA</p>
                                    <p className="font-medium">{formatNumber(results.uvaVariationPercentage, 2)}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Precancelaciones Pasadas */}
                        {results.pastPrepayments && results.pastPrepayments.length > 0 ? (
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="font-medium mb-2">Precancelaciones Realizadas</h3>
                                <div className="space-y-4">
                                    <div className="rounded-md border bg-card">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Monto ($)</TableHead>
                                                    <TableHead>Equivalente (UVAs)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.pastPrepayments.map((prepayment, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{formatCurrency(prepayment.amount)}</TableCell>
                                                        <TableCell>{formatNumber(prepayment.uvaAmount, 2)} UVAs</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total Precancelado ($)</p>
                                            <p className="font-medium">{formatCurrency(results.totalPastPrepayments)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total Precancelado (UVAs)</p>
                                            <p className="font-medium">{formatNumber(results.totalPastPrepaymentUvas, 2)} UVAs</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
                                            <p className="font-medium">{results.timeAlreadySavedMonths} meses</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Intereses Ahorrados</p>
                                            <p className="font-medium">{formatCurrency(results.interestAlreadySaved)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="font-medium mb-2">Precancelaciones Realizadas</h3>
                                <p className="text-sm text-muted-foreground">No se han registrado precancelaciones pasadas.</p>
                            </div>
                        )}

                        {/* Sección de Precancelaciones Futuras */}
                        {results.enableFuturePrepayments && (
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="font-medium mb-2">Precancelaciones Futuras</h3>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Monto a Precancelar</p>
                                        <p className="font-medium">{formatCurrency(results.futurePrepaymentAmount)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Frecuencia</p>
                                        <p className="font-medium">Cada {results.futurePrepaymentFrequencyMonths} meses</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Comisión</p>
                                        <p className="font-medium">{formatNumber(results.futurePrepaymentFeePercentage, 2)}%</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total Comisiones</p>
                                        <p className="font-medium">{formatCurrency(results.totalFuturePrepaymentFees)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg bg-primary/10 p-4">
                            <h3 className="font-medium mb-2">Proyección</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {results.enableFuturePrepayments ? (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Tiempo Restante (sin precancelaciones)</p>
                                            <p className="font-medium">
                                                {results.remainingMonths} meses ({(results.remainingMonths / 12).toFixed(1)} años)
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Tiempo Restante (con precancelaciones)</p>
                                            <p className="font-medium">
                                                {results.remainingMonthsWithPrepayments} meses (
                                                {(results.remainingMonthsWithPrepayments / 12).toFixed(1)} años)
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
                                            <p className="font-medium">{results.timeSavedWithFuturePrepayments} meses</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Intereses Ahorrados</p>
                                            <p className="font-medium">{formatCurrency(results.interestSavedWithFuturePrepayments)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total a Pagar (sin precancelaciones)</p>
                                            <p className="font-medium">{formatCurrency(results.totalRemainingPayments)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total a Pagar (con precancelaciones)</p>
                                            <p className="font-medium">{formatCurrency(results.totalRemainingWithPrepayments)}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Tiempo Restante</p>
                                            <p className="font-medium">
                                                {results.remainingMonths} meses ({(results.remainingMonths / 12).toFixed(1)} años)
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total a Pagar ($)</p>
                                            <p className="font-medium">{formatCurrency(results.totalRemainingPayments)}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="monthly" className="pt-4">
                        <div className="rounded-md border max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mes</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Cuota (UVAs)</TableHead>
                                        <TableHead>Cuota ($)</TableHead>
                                        <TableHead>Capital (UVAs)</TableHead>
                                        <TableHead>Interés (UVAs)</TableHead>
                                        <TableHead>Precancelación</TableHead>
                                        <TableHead>Saldo (UVAs)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.monthlyData.map((month) => (
                                        <TableRow key={month.month} className={month.isPaid ? "bg-muted/50" : ""}>
                                            <TableCell>{month.month}</TableCell>
                                            <TableCell>{month.date}</TableCell>
                                            <TableCell>{formatNumber(month.uvaPayment, 2)}</TableCell>
                                            <TableCell>{formatCurrency(month.pesoPayment)}</TableCell>
                                            <TableCell>{formatNumber(month.uvaPrincipal, 2)}</TableCell>
                                            <TableCell>{formatNumber(month.uvaInterest, 2)}</TableCell>
                                            <TableCell>
                                                {month.prepayment > 0 ? (
                                                    <span className="text-green-600">{formatCurrency(month.prepayment)}</span>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>{formatNumber(month.uvaBalance, 2)}</TableCell>
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
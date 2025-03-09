import { format, addMonths, differenceInMonths, isBefore } from "date-fns"
import type { UvaMortgageParams, UvaMortgageResults, UvaMonthlyData, ProcessedPastPrepayment } from "./uva-types"

// Valor inicial de UVA (simulado)
const INITIAL_UVA_VALUE = 97.5

// Función para estimar el valor de UVA en una fecha pasada (simulado)
function estimateUvaValueAtDate(date: Date, currentUvaValue: number): number {
    const today = new Date()
    const monthsDifference = differenceInMonths(today, date)

    // Simulamos una evolución del valor UVA con una tasa mensual promedio
    // En un caso real, esto debería usar datos históricos reales
    const monthlyUvaGrowthRate = 0.035 // 3.5% mensual promedio (simulado)

    return currentUvaValue / Math.pow(1 + monthlyUvaGrowthRate, monthsDifference)
}

export function simulateExistingUvaMortgage(params: UvaMortgageParams): UvaMortgageResults {
    const {
        uvaAmount,
        annualInterestRate,
        loanTermYears,
        startDate,
        currentUvaValue,
        pastPrepayments = [],
        enableFuturePrepayments = false,
        futurePrepaymentAmount = 0,
        futurePrepaymentFrequencyMonths = 0,
        futurePrepaymentFeePercentage = 0,
    } = params

    // Convertir tasa anual a mensual
    const monthlyInterestRate = annualInterestRate / 100 / 12
    const totalMonths = loanTermYears * 12

    // Calcular cuota mensual en UVAs (sistema francés)
    const monthlyUvaPayment = (uvaAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -totalMonths))

    // Calcular cuántas cuotas ya se pagaron
    const today = new Date()
    const paidInstallments = Math.min(Math.max(0, differenceInMonths(today, startDate)), totalMonths)

    // Procesar precancelaciones pasadas
    const processedPastPrepayments: ProcessedPastPrepayment[] = pastPrepayments.map((prepayment) => {
        const prepaymentUvaValue = estimateUvaValueAtDate(prepayment.date, currentUvaValue)
        const uvaAmount = prepayment.amount / prepaymentUvaValue

        return {
            date: format(prepayment.date, "dd/MM/yyyy"),
            amount: prepayment.amount,
            uvaAmount,
        }
    })

    // Ordenar precancelaciones por fecha
    processedPastPrepayments.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    // Si hay una sola precancelación grande (posiblemente del modo "total"),
    // distribuirla proporcionalmente a lo largo del tiempo ya pagado
    if (
        processedPastPrepayments.length === 1 &&
        processedPastPrepayments[0].amount > monthlyUvaPayment * currentUvaValue * 3
    ) {
        const singlePrepayment = processedPastPrepayments[0]
        processedPastPrepayments.length = 0 // Limpiar el array

        // Distribuir en hasta 4 pagos a lo largo del período ya pagado
        const numPayments = Math.min(4, Math.floor(paidInstallments / 3))
        if (numPayments > 0) {
            const amountPerPayment = singlePrepayment.amount / numPayments
            const uvaAmountPerPayment = singlePrepayment.uvaAmount / numPayments

            for (let i = 0; i < numPayments; i++) {
                // Distribuir las fechas uniformemente en el período pagado
                const paymentMonth = Math.floor((paidInstallments * (i + 1)) / (numPayments + 1))
                const paymentDate = addMonths(startDate, paymentMonth)

                processedPastPrepayments.push({
                    date: format(paymentDate, "dd/MM/yyyy"),
                    amount: amountPerPayment,
                    uvaAmount: uvaAmountPerPayment,
                })
            }
        } else {
            // Si no hay suficientes cuotas pagadas, mantener la precancelación única
            processedPastPrepayments.push(singlePrepayment)
        }
    }

    // Crear una copia de las precancelaciones procesadas para usar en los cálculos
    const workingPastPrepayments = [...processedPastPrepayments]

    // Calcular saldo pendiente en UVAs considerando precancelaciones pasadas
    let remainingUvaBalance = uvaAmount
    let remainingUvaBalanceWithoutPrepayments = uvaAmount
    let totalPastPrepaymentUvas = 0

    // Simulación para calcular el impacto de las precancelaciones pasadas
    for (let i = 1; i <= paidInstallments; i++) {
        const paymentDate = addMonths(startDate, i - 1)

        // Calcular interés y capital para el mes actual
        const interestForMonth = remainingUvaBalance * monthlyInterestRate
        const principalForMonth = monthlyUvaPayment - interestForMonth

        // Actualizar saldo
        remainingUvaBalance -= principalForMonth

        // Calcular lo mismo sin precancelaciones para comparar
        const interestWithoutPrepayments = remainingUvaBalanceWithoutPrepayments * monthlyInterestRate
        const principalWithoutPrepayments = monthlyUvaPayment - interestWithoutPrepayments
        remainingUvaBalanceWithoutPrepayments -= principalWithoutPrepayments

        // Aplicar precancelaciones pasadas si corresponde
        for (let j = 0; j < workingPastPrepayments.length; j++) {
            const prepayment = workingPastPrepayments[j]
            const prepaymentDate = new Date(prepayment.date)

            if (
                isBefore(prepaymentDate, paymentDate) ||
                format(prepaymentDate, "yyyy-MM") === format(paymentDate, "yyyy-MM")
            ) {
                remainingUvaBalance -= prepayment.uvaAmount
                totalPastPrepaymentUvas += prepayment.uvaAmount

                // Eliminar esta precancelación para no procesarla nuevamente
                workingPastPrepayments.splice(j, 1)
                j-- // Ajustar el índice ya que modificamos el array
                break
            }
        }

        // Asegurar que el saldo no sea negativo
        remainingUvaBalance = Math.max(0, remainingUvaBalance)
    }

    // Calcular el ahorro de tiempo e intereses por precancelaciones pasadas
    const totalPastPrepayments = pastPrepayments.reduce((sum, p) => sum + p.amount, 0)

    // Simulación completa sin precancelaciones para calcular el ahorro total
    let fullSimulationBalanceWithoutPrepayments = uvaAmount
    let fullSimulationMonthsWithoutPrepayments = 0
    let fullSimulationInterestWithoutPrepayments = 0

    while (fullSimulationBalanceWithoutPrepayments > 0 && fullSimulationMonthsWithoutPrepayments < totalMonths) {
        fullSimulationMonthsWithoutPrepayments++
        const interestForMonth = fullSimulationBalanceWithoutPrepayments * monthlyInterestRate
        fullSimulationInterestWithoutPrepayments += interestForMonth

        const principalForMonth = monthlyUvaPayment - interestForMonth
        fullSimulationBalanceWithoutPrepayments -= principalForMonth
    }

    // Simulación completa con precancelaciones para calcular el ahorro total
    let fullSimulationBalanceWithPrepayments = uvaAmount
    let fullSimulationMonthsWithPrepayments = 0
    let fullSimulationInterestWithPrepayments = 0
    const fullSimulationPastPrepayments = [...processedPastPrepayments]

    for (let month = 1; month <= totalMonths; month++) {
        if (fullSimulationBalanceWithPrepayments <= 0) break

        fullSimulationMonthsWithPrepayments++
        const paymentDate = addMonths(startDate, month - 1)

        const interestForMonth = fullSimulationBalanceWithPrepayments * monthlyInterestRate
        fullSimulationInterestWithPrepayments += interestForMonth

        const principalForMonth = monthlyUvaPayment - interestForMonth
        fullSimulationBalanceWithPrepayments -= principalForMonth

        // Aplicar precancelaciones pasadas
        for (let j = 0; j < fullSimulationPastPrepayments.length; j++) {
            const prepayment = fullSimulationPastPrepayments[j]
            const prepaymentDate = new Date(prepayment.date)

            if (
                isBefore(prepaymentDate, paymentDate) ||
                format(prepaymentDate, "yyyy-MM") === format(paymentDate, "yyyy-MM")
            ) {
                fullSimulationBalanceWithPrepayments -= prepayment.uvaAmount

                // Eliminar esta precancelación para no procesarla nuevamente
                fullSimulationPastPrepayments.splice(j, 1)
                j-- // Ajustar el índice ya que modificamos el array
                break
            }
        }

        fullSimulationBalanceWithPrepayments = Math.max(0, fullSimulationBalanceWithPrepayments)
    }

    // Calcular el ahorro total de tiempo e intereses
    const timeAlreadySavedMonths = fullSimulationMonthsWithoutPrepayments - fullSimulationMonthsWithPrepayments
    const interestAlreadySaved =
        (fullSimulationInterestWithoutPrepayments - fullSimulationInterestWithPrepayments) * currentUvaValue

    // Calcular meses restantes considerando el ahorro por precancelaciones
    const remainingMonths = Math.max(0, fullSimulationMonthsWithPrepayments - paidInstallments)

    // Calcular montos en pesos
    const originalLoanAmount = uvaAmount * INITIAL_UVA_VALUE
    const remainingPesoBalance = remainingUvaBalance * currentUvaValue
    const currentPaymentAmount = monthlyUvaPayment * currentUvaValue

    // Calcular variación de UVA
    const uvaVariationPercentage = ((currentUvaValue - INITIAL_UVA_VALUE) / INITIAL_UVA_VALUE) * 100

    // Calcular total a pagar restante (estimado)
    const totalRemainingPayments = monthlyUvaPayment * remainingMonths * currentUvaValue

    // Simulación con precancelaciones futuras
    let remainingMonthsWithPrepayments = remainingMonths
    let totalRemainingWithPrepayments = 0
    let totalFuturePrepaymentFees = 0
    let interestSavedWithFuturePrepayments = 0

    if (enableFuturePrepayments && futurePrepaymentAmount > 0 && futurePrepaymentFrequencyMonths > 0) {
        // Simulación sin precancelaciones futuras
        let balanceWithoutFuturePrepayments = remainingUvaBalance
        let totalInterestWithoutFuturePrepayments = 0

        for (let i = 0; i < remainingMonths; i++) {
            const interestForMonth = balanceWithoutFuturePrepayments * monthlyInterestRate
            totalInterestWithoutFuturePrepayments += interestForMonth

            const principalForMonth = monthlyUvaPayment - interestForMonth
            balanceWithoutFuturePrepayments -= principalForMonth

            if (balanceWithoutFuturePrepayments <= 0) break
        }

        // Simulación con precancelaciones futuras
        let balanceWithFuturePrepayments = remainingUvaBalance
        let monthsWithFuturePrepayments = 0
        let totalInterestWithFuturePrepayments = 0
        let totalPrepaymentAmount = 0

        while (balanceWithFuturePrepayments > 0 && monthsWithFuturePrepayments < remainingMonths) {
            monthsWithFuturePrepayments++

            const interestForMonth = balanceWithFuturePrepayments * monthlyInterestRate
            totalInterestWithFuturePrepayments += interestForMonth

            const principalForMonth = monthlyUvaPayment - interestForMonth
            balanceWithFuturePrepayments -= principalForMonth

            // Aplicar precancelación si corresponde
            if (monthsWithFuturePrepayments % futurePrepaymentFrequencyMonths === 0) {
                const uvaEquivalent = futurePrepaymentAmount / currentUvaValue
                const effectiveAmount = Math.min(uvaEquivalent, balanceWithFuturePrepayments)

                if (effectiveAmount > 0) {
                    // Calcular comisión
                    const prepaymentFee = futurePrepaymentAmount * (futurePrepaymentFeePercentage / 100)
                    totalFuturePrepaymentFees += prepaymentFee

                    balanceWithFuturePrepayments -= effectiveAmount
                    totalPrepaymentAmount += futurePrepaymentAmount
                }
            }

            if (balanceWithFuturePrepayments <= 0) break
        }

        remainingMonthsWithPrepayments = monthsWithFuturePrepayments
        totalRemainingWithPrepayments =
            monthlyUvaPayment * monthsWithFuturePrepayments * currentUvaValue +
            totalPrepaymentAmount +
            totalFuturePrepaymentFees

        interestSavedWithFuturePrepayments =
            (totalInterestWithoutFuturePrepayments - totalInterestWithFuturePrepayments) * currentUvaValue
    } else {
        // Si no hay precancelaciones futuras, los valores son los mismos que sin precancelaciones
        remainingMonthsWithPrepayments = remainingMonths
        totalRemainingWithPrepayments = totalRemainingPayments
        interestSavedWithFuturePrepayments = 0
    }

    const timeSavedWithFuturePrepayments = remainingMonths - remainingMonthsWithPrepayments

    // Generar datos mensuales
    const monthlyData: UvaMonthlyData[] = []
    let simulationBalance = uvaAmount

    // Mapa para precancelaciones pasadas por fecha
    const pastPrepaymentsByDate = new Map<string, number>()
    if (pastPrepayments.length > 0) {
        pastPrepayments.forEach((prepayment) => {
            const dateKey = format(prepayment.date, "yyyy-MM")
            const existingAmount = pastPrepaymentsByDate.get(dateKey) || 0
            pastPrepaymentsByDate.set(dateKey, existingAmount + prepayment.amount)
        })
    }

    for (let month = 1; month <= totalMonths; month++) {
        const paymentDate = addMonths(startDate, month - 1)
        const isPaid = month <= paidInstallments
        const dateKey = format(paymentDate, "yyyy-MM")

        const interestForMonth = simulationBalance * monthlyInterestRate
        const principalForMonth = monthlyUvaPayment - interestForMonth

        // Aplicar pago regular
        simulationBalance -= principalForMonth

        // Verificar si hay precancelación pasada en este mes
        let prepaymentAmount = 0
        if (pastPrepaymentsByDate.has(dateKey)) {
            prepaymentAmount = pastPrepaymentsByDate.get(dateKey) || 0
            const uvaValueAtDate = estimateUvaValueAtDate(paymentDate, currentUvaValue)
            const uvaEquivalent = prepaymentAmount / uvaValueAtDate
            simulationBalance -= uvaEquivalent
        }

        // Verificar si hay precancelación futura en este mes
        if (!isPaid && enableFuturePrepayments && futurePrepaymentFrequencyMonths > 0) {
            const monthsSinceNow = month - paidInstallments
            if (monthsSinceNow > 0 && monthsSinceNow % futurePrepaymentFrequencyMonths === 0) {
                prepaymentAmount = futurePrepaymentAmount
                const uvaEquivalent = futurePrepaymentAmount / currentUvaValue
                simulationBalance -= uvaEquivalent
            }
        }

        simulationBalance = Math.max(0, simulationBalance)

        // Usar valor UVA actual para pagos futuros (en un caso real, se proyectaría)
        const pesoPayment = monthlyUvaPayment * currentUvaValue

        monthlyData.push({
            month,
            date: format(paymentDate, "dd/MM/yyyy"),
            uvaPayment: monthlyUvaPayment,
            pesoPayment,
            uvaPrincipal: principalForMonth,
            uvaInterest: interestForMonth,
            uvaBalance: simulationBalance,
            prepayment: prepaymentAmount,
            isPaid,
        })

        // Si el saldo llegó a cero, terminar la simulación
        if (simulationBalance <= 0) {
            break
        }
    }

    return {
        initialUvaPayment: monthlyUvaPayment,
        currentUvaPayment: monthlyUvaPayment,
        currentPaymentAmount,
        remainingUvaBalance,
        remainingPesoBalance,
        paidInstallments,
        totalInstallments: totalMonths,
        originalLoanAmount,
        initialUvaValue: INITIAL_UVA_VALUE,
        currentUvaValue,
        uvaVariationPercentage,
        remainingMonths,
        totalRemainingPayments,

        // Precancelaciones pasadas
        pastPrepayments: processedPastPrepayments,
        totalPastPrepayments,
        totalPastPrepaymentUvas,
        timeAlreadySavedMonths,
        interestAlreadySaved,

        // Precancelaciones futuras
        enableFuturePrepayments,
        futurePrepaymentAmount,
        futurePrepaymentFrequencyMonths,
        futurePrepaymentFeePercentage,
        totalFuturePrepaymentFees,
        remainingMonthsWithPrepayments,
        timeSavedWithFuturePrepayments,
        totalRemainingWithPrepayments,
        interestSavedWithFuturePrepayments,

        monthlyData,
    }
}


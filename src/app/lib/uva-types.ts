export interface PastPrepayment {
    date: Date
    amount: number
}

export interface UvaMortgageParams {
    uvaAmount: number
    annualInterestRate: number
    loanTermYears: number
    startDate: Date
    currentUvaValue: number
    pastPrepayments?: PastPrepayment[]
    enableFuturePrepayments?: boolean
    futurePrepaymentAmount?: number
    futurePrepaymentFrequencyMonths?: number
    futurePrepaymentFeePercentage?: number
}

export interface UvaMonthlyData {
    month: number
    date: string
    uvaPayment: number
    pesoPayment: number
    uvaPrincipal: number
    uvaInterest: number
    uvaBalance: number
    prepayment: number
    isPaid: boolean
}

export interface ProcessedPastPrepayment {
    date: string
    amount: number
    uvaAmount: number
}

export interface UvaMortgageResults {
    initialUvaPayment: number
    currentUvaPayment: number
    currentPaymentAmount: number
    remainingUvaBalance: number
    remainingPesoBalance: number
    paidInstallments: number
    totalInstallments: number
    originalLoanAmount: number
    initialUvaValue: number
    currentUvaValue: number
    uvaVariationPercentage: number
    remainingMonths: number
    totalRemainingPayments: number

    // Precancelaciones pasadas
    pastPrepayments?: ProcessedPastPrepayment[]
    totalPastPrepayments: number
    totalPastPrepaymentUvas: number
    timeAlreadySavedMonths: number
    interestAlreadySaved: number

    // Precancelaciones futuras
    enableFuturePrepayments: boolean
    futurePrepaymentAmount: number
    futurePrepaymentFrequencyMonths: number
    futurePrepaymentFeePercentage: number
    totalFuturePrepaymentFees: number
    remainingMonthsWithPrepayments: number
    timeSavedWithFuturePrepayments: number
    totalRemainingWithPrepayments: number
    interestSavedWithFuturePrepayments: number

    monthlyData: UvaMonthlyData[]
}


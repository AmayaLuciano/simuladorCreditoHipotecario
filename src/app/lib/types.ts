export interface MortgageParams {
    loanAmount: number
    annualInterestRate: number
    loanTermYears: number
    prepaymentAmount: number
    prepaymentFrequencyMonths: number
    prepaymentFeePercentage: number
}

export interface MonthlyData {
    month: number
    payment: number
    interest: number
    principal: number
    prepayment: number
    balance: number
}

export interface MortgageResults {
    monthlyPayment: number
    monthsUntilPayoff: number
    yearsUntilPayoff: number
    totalPaid: number
    totalInterest: number
    prepaymentsMade: number
    totalPrepaid: number
    totalPrepaymentFees: number
    timeSavedMonths: number
    timeSavedYears: number
    totalPaidWithoutPrepayments: number
    totalInterestWithoutPrepayments: number
    interestSaved: number
    monthlyData: MonthlyData[]
}


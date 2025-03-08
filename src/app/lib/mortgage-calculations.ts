import type { MortgageParams, MortgageResults, MonthlyData } from "./types"

export function simulateMortgageWithPrepayments(params: MortgageParams): MortgageResults {
    const {
        loanAmount,
        annualInterestRate,
        loanTermYears,
        prepaymentAmount,
        prepaymentFrequencyMonths,
        prepaymentFeePercentage,
    } = params

    // Convert annual rate to monthly
    const monthlyInterestRate = annualInterestRate / 100 / 12
    const totalMonths = loanTermYears * 12

    // Calculate monthly payment (French amortization system)
    const monthlyPayment = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -totalMonths))

    // Variables for tracking
    let remainingBalance = loanAmount
    let monthsUntilPayoff = 0
    let totalPaid = 0
    let totalInterest = 0
    let prepaymentsMade = 0
    let totalPrepaid = 0
    let totalPrepaymentFees = 0

    // Monthly data for detailed view
    const monthlyData: MonthlyData[] = []

    while (remainingBalance > 0) {
        monthsUntilPayoff++

        // Calculate interest and principal for the month
        const interestForMonth = remainingBalance * monthlyInterestRate
        const principalForMonth = Math.min(monthlyPayment - interestForMonth, remainingBalance)

        // Update balance and accumulators
        remainingBalance -= principalForMonth
        totalPaid += interestForMonth + principalForMonth
        totalInterest += interestForMonth

        // Record data for this month
        const monthData: MonthlyData = {
            month: monthsUntilPayoff,
            payment: interestForMonth + principalForMonth,
            interest: interestForMonth,
            principal: principalForMonth,
            prepayment: 0,
            balance: remainingBalance,
        }

        // Check if prepayment is due this month
        if (prepaymentAmount > 0 && prepaymentFrequencyMonths > 0 && monthsUntilPayoff % prepaymentFrequencyMonths === 0) {
            const effectiveAmount = Math.min(prepaymentAmount, remainingBalance)

            if (effectiveAmount > 0) {
                // Calculate prepayment fee
                const prepaymentFee = effectiveAmount * (prepaymentFeePercentage / 100)

                remainingBalance -= effectiveAmount
                totalPaid += effectiveAmount + prepaymentFee
                totalPrepaid += effectiveAmount
                totalPrepaymentFees += prepaymentFee
                prepaymentsMade++

                // Update the monthly data with prepayment
                monthData.prepayment = effectiveAmount
                monthData.balance = remainingBalance
            }
        }

        monthlyData.push(monthData)
    }

    // Simulation without prepayments for comparison
    let balanceWithoutPrepayments = loanAmount
    let totalPaidWithoutPrepayments = 0
    let totalInterestWithoutPrepayments = 0

    for (let month = 1; month <= totalMonths; month++) {
        const interestForMonth = balanceWithoutPrepayments * monthlyInterestRate
        const principalForMonth = monthlyPayment - interestForMonth

        balanceWithoutPrepayments -= principalForMonth
        totalPaidWithoutPrepayments += monthlyPayment
        totalInterestWithoutPrepayments += interestForMonth

        if (balanceWithoutPrepayments <= 0) {
            break
        }
    }

    // Calculate savings
    const timeSavedMonths = totalMonths - monthsUntilPayoff
    const interestSaved = totalInterestWithoutPrepayments - totalInterest

    return {
        monthlyPayment,
        monthsUntilPayoff,
        yearsUntilPayoff: monthsUntilPayoff / 12,
        totalPaid,
        totalInterest,
        prepaymentsMade,
        totalPrepaid,
        totalPrepaymentFees,
        timeSavedMonths,
        timeSavedYears: timeSavedMonths / 12,
        totalPaidWithoutPrepayments,
        totalInterestWithoutPrepayments,
        interestSaved,
        monthlyData,
    }
}


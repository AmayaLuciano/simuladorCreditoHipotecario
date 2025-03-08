"use client"

import { useState } from "react"
import { MortgageCalculator } from "./components/mortgage-calculator"
import { MortgageResults } from "./components/mortgage-results"
import { simulateMortgageWithPrepayments } from "./lib/mortgage-calculations"
import type { MortgageParams, MortgageResults as MortgageResultsType } from "./lib/types"

export default function Home() {
  const [results, setResults] = useState<MortgageResultsType | null>(null)
  const [showPrepaymentOptions, setShowPrepaymentOptions] = useState(false)

  const handleCalculate = (params: MortgageParams) => {
    const calculationResults = simulateMortgageWithPrepayments(params)
    setResults(calculationResults)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Calculador de Créditos Hipotecarios</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <MortgageCalculator
            showPrepaymentOptions={showPrepaymentOptions}
            setShowPrepaymentOptions={setShowPrepaymentOptions}
            onCalculate={handleCalculate} />
        </div>
        <div>{results && <MortgageResults results={results}
          showPrepaymentOptions={showPrepaymentOptions}
        />}
        </div>
      </div>
    </main>
  )
}


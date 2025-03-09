"use client"

import { useState } from "react"
import { MortgageCalculator } from "./components/mortgage-calculator"
import { MortgageResults } from "./components/mortgage-results"
import { simulateMortgageWithPrepayments } from "./lib/mortgage-calculations"
import type { MortgageParams, MortgageResults as MortgageResultsType } from "./lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UvaMortgageParams, UvaMortgageResults as UvaMortgageResultsType } from "./lib/uva-types"
import { simulateExistingUvaMortgage } from "./lib/uva-calculations"
import { UvaMortgageAnalyzer } from "./components/uva-mortgage-analyzer"
import { UvaMortgageResults } from "./components/uva-mortgage-results"

export default function Home() {
  const [activeTab, setActiveTab] = useState("new-mortgage")
  const [mortgageResults, setMortgageResults] = useState<MortgageResultsType | null>(null)
  const [uvaMortgageResults, setUvaMortgageResults] = useState<UvaMortgageResultsType | null>(null)
  const [showPrepaymentOptions, setShowPrepaymentOptions] = useState(false)

  const handleCalculateMortgage = (params: MortgageParams) => {
    const calculationResults = simulateMortgageWithPrepayments(params)
    setMortgageResults(calculationResults)
  }

  const handleAnalyzeUvaMortgage = (params: UvaMortgageParams) => {
    const analysisResults = simulateExistingUvaMortgage(params)
    setUvaMortgageResults(analysisResults)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Simulador de Crédito Hipotecario</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-mortgage">Simular Nuevo Crédito</TabsTrigger>
          <TabsTrigger value="existing-uva">Analizar Crédito UVA Existente</TabsTrigger>
        </TabsList>

        <TabsContent value="new-mortgage" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <MortgageCalculator
                onCalculate={handleCalculateMortgage}
                showPrepaymentOptions={showPrepaymentOptions}
                setShowPrepaymentOptions={setShowPrepaymentOptions}
              />
            </div>
            <div>{mortgageResults && <MortgageResults results={mortgageResults} showPrepaymentOptions={showPrepaymentOptions} />}</div>
          </div>
        </TabsContent>

        <TabsContent value="existing-uva" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <UvaMortgageAnalyzer
                onAnalyze={handleAnalyzeUvaMortgage}
                showPrepaymentOptions={showPrepaymentOptions}
                setShowPrepaymentOptions={setShowPrepaymentOptions}
              />
            </div>
            <div>{uvaMortgageResults && <UvaMortgageResults results={uvaMortgageResults} />}</div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

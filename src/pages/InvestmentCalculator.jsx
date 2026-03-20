import React from "react";
import InterestCalculator from "../components/InterestCalculator";

export default function InvestmentCalculator() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Investment Growth Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how your investments can grow over time with compound interest and regular contributions. 
            Adjust the values to match your financial goals and watch your future wealth build!
          </p>
        </div>

        <InterestCalculator />

        <div className="mt-12 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-[#1B2B5E] p-6 rounded-lg">
          <h3 className="font-bold text-lg text-gray-900 mb-2">💡 Pro Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Start early:</strong> Time is your biggest advantage with compound interest</li>
            <li>• <strong>Contribute regularly:</strong> Even small monthly contributions add up significantly</li>
            <li>• <strong>Be consistent:</strong> The power of compound interest grows exponentially over time</li>
            <li>• <strong>Average stock market return:</strong> Historically around 10% annually (though past performance doesn't guarantee future results)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
// Shared 2024 federal income tax brackets and pure calculation functions.
// Imported by ProgressiveTaxSlider and BracketMathViz.

export const BRACKETS_2024_SINGLE = [
  { upto:   11600, rate: 0.10 },
  { upto:   47150, rate: 0.12 },
  { upto:  100525, rate: 0.22 },
  { upto:  191950, rate: 0.24 },
  { upto:  243725, rate: 0.32 },
  { upto:  609350, rate: 0.35 },
  { upto: Infinity, rate: 0.37 },
];

export function federalTaxOwed(salary, brackets) {
  let tax = 0;
  let prev = 0;
  for (const { upto, rate } of brackets) {
    if (salary <= prev) break;
    tax += (Math.min(salary, upto) - prev) * rate;
    prev = upto;
  }
  return tax;
}

export function effectiveRate(salary, brackets) {
  return salary === 0 ? 0 : federalTaxOwed(salary, brackets) / salary;
}

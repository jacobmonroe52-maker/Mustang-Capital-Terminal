import type { DcfInputs, DcfResult } from '../../types';

export function runDcf(inputs: DcfInputs): DcfResult {
  const { base_fcf, fcf_growth_rate, years, wacc, terminal_growth, total_debt, cash, diluted_shares, current_price } = inputs;

  if (wacc <= terminal_growth) {
    return {
      error: `WACC (${(wacc * 100).toFixed(1)}%) must exceed terminal growth rate (${(terminal_growth * 100).toFixed(1)}%). Gordon Growth Model is undefined when WACC ≤ g.`,
      dcf_value_per_share: 0,
      enterprise_value: 0,
      equity_value: 0,
      terminal_value: 0,
      pv_fcfs: 0,
      pv_terminal: 0,
      upside_pct: 0,
      tv_pct_of_ev: 0,
      projected_fcfs: [],
    };
  }

  // Step 1: Project FCFs using a uniform growth rate
  const projected_fcfs: number[] = [];
  let fcf = base_fcf;
  for (let t = 0; t < years; t++) {
    fcf = fcf * (1 + fcf_growth_rate);
    projected_fcfs.push(fcf);
  }

  // Step 2: PV of explicit FCFs
  let pv_fcfs = 0;
  for (let t = 1; t <= years; t++) {
    pv_fcfs += projected_fcfs[t - 1] / Math.pow(1 + wacc, t);
  }

  // Step 3: Terminal value (Gordon Growth, applied at end of year N)
  const fcf_terminal = projected_fcfs[years - 1] * (1 + terminal_growth);
  const terminal_value = fcf_terminal / (wacc - terminal_growth);
  const pv_terminal = terminal_value / Math.pow(1 + wacc, years);

  // Step 4: Enterprise and equity value
  const enterprise_value = pv_fcfs + pv_terminal;
  const net_debt = total_debt - cash;
  const equity_value = enterprise_value - net_debt;
  const dcf_value_per_share = diluted_shares > 0 ? equity_value / diluted_shares : 0;
  const upside_pct = current_price > 0 ? dcf_value_per_share / current_price - 1 : 0;
  const tv_pct_of_ev = enterprise_value > 0 ? pv_terminal / enterprise_value : 0;

  return {
    dcf_value_per_share,
    enterprise_value,
    equity_value,
    terminal_value,
    pv_fcfs,
    pv_terminal,
    upside_pct,
    tv_pct_of_ev,
    projected_fcfs,
  };
}

// Sensitivity table: 5×5 grid of (wacc ±2%) × (terminal_growth ±1%)
export function buildSensitivityTable(inputs: DcfInputs): number[][] {
  const waccSteps = [-0.02, -0.01, 0, 0.01, 0.02];
  const gSteps = [0.01, 0.005, 0, -0.005, -0.01]; // rows: higher g at top
  return gSteps.map((dg) =>
    waccSteps.map((dw) =>
      runDcf({ ...inputs, wacc: inputs.wacc + dw, terminal_growth: inputs.terminal_growth + dg }).dcf_value_per_share
    )
  );
}

// Verification test: confirms the math is correct against a known hand-calc.
// Input: FCF=$100M, growth=10%, years=5, WACC=12%, terminalG=3%, debt=$200M, cash=$50M, shares=50M, price=$30
// Expected: value/share ≈ $27.40, EV ≈ $1519.86M, upside ≈ -8.7%
export function _verifyDcfMath() {
  const result = runDcf({
    base_fcf: 100, fcf_growth_rate: 0.10, years: 5,
    wacc: 0.12, terminal_growth: 0.03,
    total_debt: 200, cash: 50,
    diluted_shares: 50, current_price: 30,
  });
  console.assert(Math.abs(result.dcf_value_per_share - 27.40) < 0.05, `DCF per share: expected ~27.40, got ${result.dcf_value_per_share.toFixed(2)}`);
  console.assert(Math.abs(result.enterprise_value - 1519.86) < 1, `EV: expected ~1519.86, got ${result.enterprise_value.toFixed(2)}`);
  console.assert(Math.abs(result.upside_pct - (-0.087)) < 0.005, `Upside: expected ~-8.7%, got ${(result.upside_pct * 100).toFixed(1)}%`);
  return result;
}

import type { DcfInputs } from '../../types';
import { buildSensitivityTable } from './dcfMath';
import { fmtUSD, fmtPct } from '../../lib/format';

interface Props {
  inputs: DcfInputs;
  baseValue: number;
}

export function SensitivityTable({ inputs, baseValue: _baseValue }: Props) {
  const waccSteps = [-0.02, -0.01, 0, 0.01, 0.02];
  const gSteps = [0.01, 0.005, 0, -0.005, -0.01];
  const table = buildSensitivityTable(inputs);

  const cellClass = (val: number, isBase: boolean) => {
    if (!isFinite(val) || val <= 0) return 'bg-green-700/30 text-cream-400';
    const upside = inputs.current_price > 0 ? val / inputs.current_price - 1 : 0;
    if (isBase) return 'ring-1 ring-brass-500 bg-brass-500/10 text-brass-500 font-medium';
    if (upside > 0.15) return 'bg-gain/20 text-gain';
    if (upside > 0) return 'bg-gain/10 text-gain/80';
    if (upside > -0.15) return 'bg-loss/10 text-loss/80';
    return 'bg-loss/20 text-loss';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm text-cream-200 font-medium">Sensitivity: Value per Share</h3>
        <span className="text-xs text-cream-400">(WACC ± 2% across, Terminal g ± 1% down)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-cream-400 text-left font-medium">g \ WACC</th>
              {waccSteps.map((dw) => (
                <th key={dw} className="px-2 py-1.5 text-cream-400 font-mono text-center">
                  {fmtPct(inputs.wacc + dw)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gSteps.map((dg, ri) => (
              <tr key={dg}>
                <td className="px-2 py-1.5 text-cream-400 font-mono">
                  {fmtPct(inputs.terminal_growth + dg)}
                </td>
                {waccSteps.map((dw, ci) => {
                  const val = table[ri][ci];
                  const isBase = dg === 0 && dw === 0;
                  const isNa = inputs.wacc + dw <= inputs.terminal_growth + dg;
                  return (
                    <td
                      key={ci}
                      className={['px-2 py-1.5 text-center font-mono rounded transition-colors', isNa ? 'text-cream-400/40' : cellClass(val, isBase)].join(' ')}
                    >
                      {isNa ? 'N/A' : isFinite(val) && val > 0 ? fmtUSD(val) : 'N/A'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

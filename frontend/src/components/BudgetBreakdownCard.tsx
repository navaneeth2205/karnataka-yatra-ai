import React from 'react';
import { IndianRupee, AlertTriangle, CheckCircle2, BedDouble, Utensils, Car, Ticket, Shield, Users, Hotel } from 'lucide-react';
import { BudgetSummary } from '../types/travel';

interface Props {
  budget: BudgetSummary;
}

export const BudgetBreakdownCard: React.FC<Props> = ({ budget }) => {
  const {
    cost_breakdown,
    requested_budget,
    estimated_total_cost,
    remaining_buffer,
    is_within_budget,
    travelers_count = 1,
    rooms_allocated = Math.ceil((budget.travelers_count || 1) / 2),
    per_person_cost = Math.round(budget.estimated_total_cost / Math.max(1, budget.travelers_count || 1)),
  } = budget;

  // Calculate percentages for the stacked progress bar
  const total = Math.max(1, estimated_total_cost);
  const pStay = Math.round((cost_breakdown.accommodation / total) * 100);
  const pFood = Math.round((cost_breakdown.food / total) * 100);
  const pTransport = Math.round((cost_breakdown.transport / total) * 100);
  const pActivities = Math.round((cost_breakdown.activities_entry / total) * 100);
  const pBuffer = Math.max(0, 100 - pStay - pFood - pTransport - pActivities);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header with Title and Party Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Budget Allocation & Math
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Deterministic calculation scaled to party size & regional benchmarks
          </p>
        </div>

        {/* Status Pill */}
        <div>
          {is_within_budget ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Within Target (+₹{remaining_buffer.toLocaleString('en-IN')})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Over Target by ₹{Math.abs(remaining_buffer).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid (4 columns / cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Estimated Total */}
        <div className={`p-4 rounded-2xl border ${is_within_budget ? 'bg-amber-50/50 border-amber-200/70' : 'bg-red-50 border-red-200'}`}>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Estimated Total</span>
          <span className={`text-lg sm:text-xl font-black ${is_within_budget ? 'text-amber-950' : 'text-red-700'}`}>
            ₹{estimated_total_cost.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Cost per Traveler */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Per Traveler</span>
          <span className="text-lg sm:text-xl font-black text-stone-900">
            ₹{per_person_cost.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Requested Budget */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Target Budget</span>
          <span className="text-lg sm:text-xl font-black text-stone-800">
            ₹{requested_budget.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Party Allocation */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Allocation</span>
          <div className="flex items-center gap-1 text-xs font-bold text-stone-800 mt-1">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span>{travelers_count} {travelers_count === 1 ? 'Person' : 'People'}</span>
            <span className="text-stone-300">•</span>
            <Hotel className="w-3.5 h-3.5 text-stone-500" />
            <span>{rooms_allocated}R</span>
          </div>
        </div>
      </div>

      {/* Visual Stacked Bar with Proportions */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-stone-600">
          <span>Expense Distribution</span>
          <span className="text-stone-400">100% Deterministic Balance</span>
        </div>
        <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden flex shadow-inner">
          <div style={{ width: `${pStay}%` }} className="bg-amber-600 transition-all" title={`Accommodation: ${pStay}%`} />
          <div style={{ width: `${pFood}%` }} className="bg-emerald-600 transition-all" title={`Food: ${pFood}%`} />
          <div style={{ width: `${pTransport}%` }} className="bg-blue-600 transition-all" title={`Transit: ${pTransport}%`} />
          <div style={{ width: `${pActivities}%` }} className="bg-purple-600 transition-all" title={`Activities & Sightseeing: ${pActivities}%`} />
          <div style={{ width: `${pBuffer}%` }} className="bg-stone-400 transition-all" title={`Reserve: ${pBuffer}%`} />
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Stay */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Accommodation</p>
              <p className="text-[10px] text-stone-500">{rooms_allocated} room(s) • {pStay}%</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-stone-900">₹{cost_breakdown.accommodation.toLocaleString('en-IN')}</span>
        </div>

        {/* Food */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Food & Dining</p>
              <p className="text-[10px] text-stone-500">{travelers_count} people • {pFood}%</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-stone-900">₹{cost_breakdown.food.toLocaleString('en-IN')}</span>
        </div>

        {/* Transport */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Transit & Tolls</p>
              <p className="text-[10px] text-stone-500">{pTransport}% of total</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-stone-900">₹{cost_breakdown.transport.toLocaleString('en-IN')}</span>
        </div>

        {/* Sightseeing */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-purple-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Sightseeing & Entry</p>
              <p className="text-[10px] text-stone-500">Tickets x {travelers_count} • {pActivities}%</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-stone-900">₹{cost_breakdown.activities_entry.toLocaleString('en-IN')}</span>
        </div>

        {/* Safety Reserve */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 sm:col-span-2 lg:col-span-2 hover:border-stone-400 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Contingency & Incidentals</p>
              <p className="text-[10px] text-stone-500">{pBuffer}% emergency cushion for ghat detours or shopping</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-stone-900">₹{cost_breakdown.contingency_reserve.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-start gap-2 text-[11px] text-stone-500">
        <span className="font-semibold text-stone-700 shrink-0">Benchmark Policy:</span>
        <span>{budget.disclaimer}</span>
      </div>
    </div>
  );
};

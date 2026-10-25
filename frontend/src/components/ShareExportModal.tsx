import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Printer,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { TripPlanResponse } from '../types/travel';
import {
  formatWhatsAppItinerary,
  getWhatsAppShareUrl,
  formatMarkdownItinerary,
  downloadTripJson,
} from '../utils/shareUtils';

interface Props {
  trip: TripPlanResponse;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'whatsapp' | 'pdf' | 'markdown' | 'json';

export const ShareExportModal: React.FC<Props> = ({ trip, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const whatsAppText = formatWhatsAppItinerary(trip);
  const whatsAppUrl = getWhatsAppShareUrl(trip);
  const markdownText = formatMarkdownItinerary(trip);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const handlePrint = () => {
    onClose();
    // Allow modal animation to complete before opening print dialog
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">Export & Share Itinerary</h3>
              <p className="text-xs text-stone-400">
                {trip.title} • {trip.duration_days} Days
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 gap-2 overflow-x-auto text-xs font-semibold text-stone-600">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>PDF & Print Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'markdown'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-lg font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-stone-700" />
            <span>Markdown Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-lg font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Download className="w-4 h-4 text-stone-700" />
            <span>JSON Data</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Direct WhatsApp message preview:</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to Send
                </span>
              </div>

              {/* Chat Bubble Style Preview */}
              <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-stone-300">
                <div className="bg-[#dcf8c6] text-stone-900 text-xs font-mono p-4 rounded-2xl shadow-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all border border-emerald-300/40">
                  {whatsAppText}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCopy(whatsAppText, 'whatsapp')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  {copiedType === 'whatsapp' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: PDF & PRINT GUIDE */}
          {activeTab === 'pdf' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>Official Karnataka Yatra Printable Document</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Our print-optimized stylesheet automatically formats your itinerary with crisp borders,
                  Karnataka Yatra AI certification headers, day-by-day activity timelines, budget allocations,
                  and Kannada survival phrases, while cleanly hiding navigation panels and edit forms.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tip: In your browser print window, select destination <strong>"Save as PDF"</strong> for an offline document.</span>
                </div>
              </div>

              {/* Print Document Summary Preview */}
              <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-900">Print Package Contents:</span>
                  <span className="text-stone-500">{trip.days.length} Days • ₹{trip.budget.estimated_total_cost.toLocaleString()} Total</span>
                </div>
                <ul className="space-y-1.5 text-stone-600 pl-4 list-disc">
                  <li>Official Karnataka Yatra AI Header with Trip ID: #{trip.trip_id}</li>
                  <li>Full Day-by-Day Morning, Afternoon & Evening schedules with entry fees</li>
                  <li>Deterministic Budget Allocation with expense category percentages</li>
                  <li>Local Food Highlights & Travel Logistics tips</li>
                  <li>Essential Kannada Survival Phrases & Transliterations</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Print / Save as PDF Dialog</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Formatted Markdown for Notion, Obsidian, or Google Docs:</span>
              </div>

              <div className="bg-stone-900 text-stone-200 text-xs font-mono p-4 rounded-2xl shadow-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all border border-stone-800">
                {markdownText}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCopy(markdownText, 'markdown')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {copiedType === 'markdown' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied Markdown!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Markdown to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: JSON DATA */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Structured JSON representation conforming to TripPlanResponse schema:</span>
              </div>

              <div className="bg-stone-900 text-amber-300 text-xs font-mono p-4 rounded-2xl shadow-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all border border-stone-800">
                {JSON.stringify(trip, null, 2)}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(trip, null, 2), 'json')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  {copiedType === 'json' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadTripJson(trip)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json File</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

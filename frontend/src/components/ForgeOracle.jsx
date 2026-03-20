import React, { useEffect, useState } from "react";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import api from "../api/axios";

const ForgeOracle = () => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await api.get("/insights/generate");
        setInsight(res.data.data);
      } catch (err) {
        console.error("Failed to fetch Oracle insight", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, []);

  if (loading) {
    return (
      <div className="mx-4 mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black p-4 border border-gray-800 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3 py-4">
          <Loader2 className="animate-spin text-[#FF6B00]" size={24} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Reforging Insights...
          </p>
        </div>
      </div>
    );
  }

  if (error || !insight) return null;

  return (
    <div className="mx-4 mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0f08] to-black p-4 border border-[#FF6B00]/20 shadow-[0_0_15px_rgba(255,107,0,0.1)] group transition-all hover:border-[#FF6B00]/40">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-10" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-500/10">
          <div className="bg-[#FF6B00]/20 p-1.5 rounded-lg">
            <Brain size={16} className="text-[#FF6B00]" />
          </div>
          <h4 className="text-xs font-black text-orange-100 uppercase tracking-widest flex-1">
            The Oracle
          </h4>
          <Sparkles size={14} className="text-orange-400/50" />
        </div>

        <p className="text-xs font-medium text-gray-300 leading-relaxed space-y-2 italic">
          {insight.content.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>

        <div className="mt-4 flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
          <span>{insight.rawStats?.forgedCount || 0} Tasks Forged</span>
          {insight.generatedAt && (
            <span>
              Updated {new Date(insight.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgeOracle;

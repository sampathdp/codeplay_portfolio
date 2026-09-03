import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { DollarSign, Coins } from "lucide-react";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
      <button
        onClick={() => setCurrency("USD")}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          currency === "USD" ? "text-white" : "text-white/70 hover:text-white"
        }`}
      >
        {currency === "USD" && (
          <motion.div
            layoutId="currency-bg"
            className="absolute inset-0 bg-primary rounded-full z-0 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <DollarSign className="w-3 h-3 relative z-10" />
        <span className="relative z-10">USD</span>
      </button>

      <button
        onClick={() => setCurrency("LKR")}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          currency === "LKR" ? "text-white" : "text-white/70 hover:text-white"
        }`}
      >
        {currency === "LKR" && (
          <motion.div
            layoutId="currency-bg"
            className="absolute inset-0 bg-primary rounded-full z-0 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Coins className="w-3 h-3 relative z-10" />
        <span className="relative z-10">LKR</span>
      </button>
    </div>
  );
}

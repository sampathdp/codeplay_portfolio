import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppWidget() {
  const phoneNumber = "0754453334";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/^0/, '94')}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-8 left-8 z-[100]"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative group block"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-[#25D366] rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Button */}
        <div className="relative w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
          <MessageCircle className="w-8 h-8 fill-current" aria-hidden="true" />
        </div>

        {/* Label */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap shadow-xl translate-x-4 group-hover:translate-x-0">
          Let's Chat on WhatsApp
        </div>
      </a>
    </motion.div>
  );
}

import { motion } from "motion/react";
import { Volume2, Star, Share2 } from "lucide-react";
import { FC } from "react";

export interface Meaning {
  anlam_id: string;
  anlam: string;
  orneklerListe?: { ornek: string; yazar?: { tam_adi: string } }[];
}

export interface WordData {
  madde_id: string;
  kac: string;
  kelime_no: string;
  cesit: string;
  anlam_gor: string;
  on_taki: string;
  madde: string;
  cesit_say: string;
  anlam_say: string;
  taki: string;
  cogul_mu: string;
  ozel_mi: string;
  lisan_kodu: string;
  lisan: string;
  telaffuz: string;
  birlesikler: string;
  font: string;
  madde_duz: string;
  gosterim_tarihi: string;
  anlamlarListe: Meaning[];
}

interface WordCardProps {
  data: WordData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const WordCard: FC<WordCardProps> = ({ data, isFavorite, onToggleFavorite }) => {
  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            {data.madde}
          </h1>
          <div className="flex items-center gap-3 text-white/60">
            {data.lisan && (
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/10 border border-white/5">
                {data.lisan}
              </span>
            )}
            {data.telaffuz && (
              <span className="text-xs font-mono italic opacity-80">
                /{data.telaffuz}/
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-all ${isFavorite ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meanings */}
      <div className="space-y-6 pb-4">
        {data.anlamlarListe?.map((meaning, index) => (
          <motion.div
            key={meaning.anlam_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative pl-4 border-l-2 border-white/10 hover:border-cyan-400/50 transition-colors"
          >
            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-400/50 transition-colors" />
            
            <p className="text-base text-white/90 font-medium leading-relaxed">
              {meaning.anlam}
            </p>
            
            {meaning.orneklerListe?.map((example, i) => (
              <div key={i} className="mt-2 pl-3 border-l border-white/5">
                <p className="text-white/60 italic text-sm">
                  "{example.ornek}"
                </p>
                {example.yazar && (
                  <p className="text-white/40 text-xs mt-1 font-medium">
                    — {example.yazar.tam_adi}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Compound Words */}
      {data.birlesikler && (
        <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Birleşik Kelimeler</h3>
            <p className="text-sm text-white/70 leading-relaxed">
                {data.birlesikler}
            </p>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSmile, FiEdit2, FiLock, FiUsers } from "react-icons/fi";

const STEPS = [
    {
        title: "Sorgulayanlar Kulübü'ne Hoş Geldin!",
        icon: <FiSmile className="text-4xl text-indigo-500 mb-2" />,
        desc: "Burada, her soru bir pencere, her cevap bir anahtar! Felsefe, bilim, hayat ve daha fazlası için özgürce katıl."
    },
    {
        title: "Topluluk Kuralları",
        icon: <FiLock className="text-3xl text-orange-500 mb-2" />,
        desc: (
            <ul className="list-disc ml-5 text-sm text-slate-700 dark:text-slate-300 text-left">
                <li>Saygılı, açık fikirli ve bilimsel tartışma ortamına katkı sağla.</li>
                <li>Kaynağı olmayan iddiaları gerçek gibi sunma.</li>
                <li>Hakaret, nefret söylemi veya siyasi propaganda <b>yasak</b>.</li>
                <li>Her kullanıcı bir soru veya cevap paylaşabilir, katkı bekliyoruz.</li>
            </ul>
        )
    },
    {
        title: "Küçük İpuçları",
        icon: <FiEdit2 className="text-3xl text-cyan-500 mb-2" />,
        desc: (
            <ul className="list-disc ml-5 text-sm text-slate-700 dark:text-slate-300 text-left">
                <li>Bir soruyu beğenerek öne çıkarabilirsin.</li>
                <li>Cevap yazarken örnek ve kaynak gösterirsen, cevabın daha fazla ilgi çeker.</li>
                <li>Kaynaklar kısmına kitap/pdf ekleyebilirsin.</li>
            </ul>
        )
    },
    {
        title: "Hazırsın!",
        icon: <FiUsers className="text-4xl text-green-500 mb-2" />,
        desc: (
            <span className="text-base text-slate-700 dark:text-slate-200 font-medium">
                Sorgulayanlar Kulübü&apos;ne katıldığın için teşekkürler! Hadi, ilk sorunla tartışmaya başla! 👏
            </span>
        )
    }
];

function OnboardingModal({ open, onClose }) {
    const [step, setStep] = useState(0);

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    key={step}
                    initial={{ scale: 0.98, y: 48, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.97, y: 24, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white dark:bg-[#23263a] rounded-3xl shadow-2xl max-w-md w-full px-8 py-8 flex flex-col items-center gap-3 border border-indigo-100 dark:border-indigo-800 relative"
                >
                    {/* Renkli başlık ve adım */}
                    <div className="text-sm mb-1 tracking-widest font-semibold text-indigo-400 dark:text-indigo-300 uppercase animate-fadein">
                        ADIM {step + 1} / {STEPS.length}
                    </div>
                    <div className="mb-2">{STEPS[step].icon}</div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-center bg-gradient-to-r from-indigo-600 via-orange-400 to-pink-600 bg-clip-text text-transparent drop-shadow mb-2">
                        {STEPS[step].title}
                    </h2>
                    <div className="text-base mb-2">{STEPS[step].desc}</div>
                    <div className="flex gap-2 mt-3">
                        {step > 0 && (
                            <button
                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                onClick={() => setStep(step - 1)}
                            >Geri</button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow hover:scale-105 transition"
                                onClick={() => setStep(step + 1)}
                            >İleri</button>
                        ) : (
                            <button
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white font-extrabold shadow hover:scale-105 transition"
                                onClick={onClose}
                            >Kulübe Katıl</button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function OnboardingWrapper({ children }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem("onboarding_seen");
        if (!seen) setOpen(true);
    }, []);

    const handleClose = () => {
        localStorage.setItem("onboarding_seen", "1");
        setOpen(false);
    };

    return (
        <>
            <OnboardingModal open={open} onClose={handleClose} />
            {children}
        </>
    );
}

export default OnboardingModal

export { OnboardingWrapper }
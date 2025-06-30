// app/page.js
'use client';

import { useEffect, useRef, useState } from 'react';
import TodayQuestion from './components/TodayQuestion';
import AskBox from './components/AskBox';
import QuestionList from './components/QuestionList';
import FilterBar from './components/FilterBar';
import SearchBox from './components/SearchBox';
import OnboardingModal from './components/OnboardingModal';
import QuestionDetailModal from './components/QuestionDetailModal';
import AskQuestionModal from './components/AskQuestionModal';

function VisionPanel({ onAsk }) {
  return (
    <section className="w-full mb-8">
      <div className="rounded-2xl px-6 py-7 md:py-10 bg-gradient-to-br from-white via-indigo-50 to-[#f4f8fa] dark:from-[#181924] dark:via-[#22263a] dark:to-[#191926] shadow flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100 dark:border-indigo-800">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-900 dark:text-indigo-200 tracking-tight mb-2">
            Sorgulayanlar Kulübü
          </h1>
          <div className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-semibold mb-2">
            “Sorudan fazlası: Bilgi, tartışma ve entelektüel aidiyet”
          </div>
          <div className="text-base text-gray-500 dark:text-gray-400 max-w-xl">
            Klişe bir platform değil. Burada düşünceye ve katkıya değer veriyoruz.<br />
            Her paylaşım bir iz bırakır, her destek onurlandırılır.<br />
            <span className="font-bold text-indigo-700 dark:text-indigo-300">Gerçekten entelektüel bir topluluğa davetlisin.</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 min-w-[250px] text-center">
          <button
            disabled
            className="px-7 py-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl font-extrabold text-lg text-white shadow-xl opacity-60 cursor-not-allowed"
            style={{ letterSpacing: ".5px" }}
          >
            🚧 Yakında
          </button>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
            Katkıların topluluk arşivinde kalıcı iz bırakır.
          </div>
        </div>

      </div>
    </section>
  );
}

function SupportersPanel() {
  const [supporters, setSupporters] = useState([]);
  useEffect(() => {
    fetch('/api/get-weekly-supporters')
      .then(res => res.json())
      .then(data => setSupporters(data.supporters || []));
  }, []);
  if (!supporters.length) return null;
  return (
    <div className="p-5 rounded-2xl shadow bg-white/90 dark:bg-[#1c202a] border border-gray-200 dark:border-[#23263a] text-center">
      <div className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
        Haftanın Destekçileri
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {supporters.slice(0, 3).map((s, i) => (
          <div
            key={i}
            className="bg-yellow-100 dark:bg-yellow-800/60 px-4 py-2 rounded-xl font-bold text-yellow-900 dark:text-yellow-100 text-xs shadow"
            title={s.message}
          >
            {s.nickname} <span className="ml-1 font-extrabold">${s.amount}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Toplam destekçi: <span className="font-bold">{supporters.length}</span>
      </div>
    </div>
  );
}

function BadgesPanel() {
  return (
    <div className="p-5 rounded-2xl shadow bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-[#23263a] dark:to-[#20223a] border border-indigo-100 dark:border-[#23263a]">
      <div className="text-xs uppercase text-indigo-700 dark:text-indigo-200 font-bold mb-1">
        Katkı Rozetleri
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/70 text-yellow-900 dark:text-yellow-100 font-bold text-xs">🌟 AI-Starred</span>
        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/70 text-green-900 dark:text-green-100 font-bold text-xs">🎓 Uzman</span>
        <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/70 text-pink-900 dark:text-pink-100 font-bold text-xs">🔥 Popüler</span>
        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-900 dark:text-blue-100 font-bold text-xs">🧠 Destekçi</span>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Rozetler topluluk ve AI katkısıyla kazanılır.
      </div>
    </div>
  );
}

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('Tümü');
  const [showOnboard, setShowOnboard] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("onboarding_seen")) {
      setShowOnboard(true);
      localStorage.setItem("onboarding_seen", "1");
    }
  }, []);

  useEffect(() => {
    let result = [...questions];
    if (category !== 'Tümü') {
      result = questions.filter(q => q.category === category);
    }
    setFiltered(result);
  }, [category, questions]);

  const handleCloseOnboard = () => {
    setShowOnboard(false);
    if (typeof window !== "undefined") localStorage.setItem("seenOnboard", "1");
  };

  return (
    <>
      <OnboardingModal open={showOnboard} onClose={() => setShowOnboard(false)} />
      <AskQuestionModal open={askOpen} onClose={() => setAskOpen(false)} />
      <VisionPanel onAsk={() => setAskOpen(true)} />

      <main className="flex min-h-screen w-full bg-gradient-to-br from-[#f6f7fa] via-[#ecf1f9] to-[#dde4ee] dark:from-[#161921] dark:via-[#222436] dark:to-[#191926]">
        <section className="flex-1 max-w-5xl mx-auto pt-6 px-3 sm:px-6 flex flex-col gap-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 flex flex-col gap-6">
              <TodayQuestion />
              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                <div className="flex-1 flex flex-col gap-3">
                  <AskBox onSubmitSuccess={newQ => setQuestions(prev => [newQ, ...prev])} />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <SearchBox onSelect={q => {
                    setCategory('Tümü');
                    setSearching(true);
                    setTimeout(() => setSearching(false), 900);
                  }} />
                  <FilterBar
                    current={category}
                    onSelect={setCategory}
                    categories={['Tümü', 'Felsefe', 'Fizik', 'Din', 'Kimya', 'Sosyoloji']}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SupportersPanel />
              <BadgesPanel />
            </div>
          </div>
          <div>
            <QuestionList
              questions={filtered}
              loading={searching}
              onAnswerClick={id => setDetailId(id)}
            />
          </div>
        </section>
      </main>
      <QuestionDetailModal
        open={!!detailId}
        questionId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}

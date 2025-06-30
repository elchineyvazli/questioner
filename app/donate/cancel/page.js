import Link from "next/link";

// app/donate/cancel/page.js
export default function DonateCancel() {
    return (
        <div className="max-w-lg mx-auto mt-32 bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-xl text-center border-2 border-red-200 dark:border-red-800">
            <h1 className="text-2xl font-black text-red-600 mb-4">Ödeme Tamamlanamadı</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
                Ödemeniz iptal edildi veya bir hata oluştu. Kart bilgileriniz Stripe ile güvenli şekilde korunur, herhangi bir tahsilat yapılmamıştır.
            </p>
            <Link href="/donate" className="mt-4 inline-block px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow">
                Tekrar Dene
            </Link>
        </div>
    );
}

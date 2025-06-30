export const metadata = {
    title: 'Hakkında | Questioner',
    description: 'Bu platformun amacı ve ortaya çıkış süreci',
};

export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-6">Hakkında</h1>

            <p className="mb-4">
                Questioner, insanların felsefe, din, fizik, kimya gibi alanlarda özgürce soru sorması
                ve cevaplar paylaşması için kurulmuş metin tabanlı bir platformdur.
            </p>

            <p className="mb-4">
                Burada amaç, merkezi bir otoriteye bağlı kalmadan düşünen zihinleri bir araya getirmek.
                Anonim ya da kullanıcı hesabıyla katılım serbesttir. Soru ve cevaplar sade, metin temelli
                ve anlam odaklıdır.
            </p>

            <p className="mb-4">
                Bu proje kar amacı gütmez. Ana öncelik fikirlerin özgürce paylaşımı ve tartışma kültürünün yaşatılmasıdır.
            </p>
        </div>
    );
}

export const metadata = {
    title: 'Kurallar | Questioner',
    description: 'Topluluk kuralları ve içerik ilkeleri',
};

export default function RulesPage() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-6">Topluluk Kuralları</h1>

            <ol className="list-decimal list-inside space-y-3">
                <li>
                    Şiddet, nefret söylemi, ırkçılık, cinsiyetçilik veya herhangi bir ayrımcılık içeren içerikler yasaktır.
                </li>
                <li>
                    Sorular ve cevaplar sadece metin içermelidir. Görsel, medya veya bağlantı eklemek mümkün değildir.
                </li>
                <li>
                    Günlük 10 soru ve 10 cevap sınırı vardır. Bu sınır adil katılım için konulmuştur.
                </li>
                <li>
                    3’ten fazla kez şikayet edilen içerikler otomatik olarak gizlenir.
                </li>
                <li>
                    Bu platform düşünce özgürlüğünü savunur; ancak özgürlük, başkalarının haklarını ihlal etmemelidir.
                </li>
                <li>
                    Spam, reklam veya otomatik içerik oluşturmak yasaktır.
                </li>
            </ol>
        </div>
    );
}

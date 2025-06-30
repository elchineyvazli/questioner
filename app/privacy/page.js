export const metadata = {
    title: 'Gizlilik Politikası | Questioner',
    description: 'Kullanıcı verilerinin gizliliği ve güvenliği hakkında bilgiler',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>

            <p className="mb-4">
                Questioner, kullanıcıların anonim olarak fikirlerini paylaşabildiği bir platformdur.
                Kayıtlı kullanıcılar dışında hiçbir kişisel veri toplanmaz.
            </p>

            <p className="mb-4">
                IP adresleri yalnızca günlük 10 soru / 10 cevap limitini uygulamak amacıyla
                hash'lenerek geçici olarak saklanır. Bu veriler kimlik tespiti için kullanılmaz ve
                dışarı aktarılmaz.
            </p>

            <p className="mb-4">
                Platform, kullanıcı verilerini hiçbir üçüncü tarafla paylaşmaz.
                Cloudflare R2 ve benzeri servisler yalnızca depolama ve güvenlik amaçlı kullanılmaktadır.
            </p>

            <p className="mb-4">
                Raporlanan içerikler loglanır ancak raporlayan kişi anonim kalır.
                Gizliliğinize önem veriyoruz.
            </p>
        </div>
    );
}

// app/lib/cryptoWallet.js
import TronWeb from 'tronweb';

const tron = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: process.env.TRON_PRIVATE_KEY, // bu bilgisayara yazacaksın, sonra silinecek
});

// Bir bağışı benzersiz miktarla eşleştir
export function createUniqueAmount(baseAmount) {
  const micro = (Math.random() * 0.0001).toFixed(6); // 0.000001 - 0.0001 arası
  return (parseFloat(baseAmount) + parseFloat(micro)).toFixed(6);
}

// Cüzdan adresini döndür
export function getWalletAddress() {
  return tron.defaultAddress.base58;
}

// Gönderilen USDT'leri izle (TRC20 USDT = Tether USD token)
export async function checkIncomingDonations(expectedAmount) {
  // Buraya event listener kurulabilir, şimdilik placeholder
  return false;
}

export default tron;

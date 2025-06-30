// app/lib/cryptoWallet.js
import TronWeb from 'tronweb';

// TRON bağlantısını oluştur (singleton pattern)
let tronInstance = null;

function initializeTron() {
  if (!tronInstance) {
    tronInstance = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY }
    });
  }
  return tronInstance;
}

// Bağış için benzersiz miktar oluştur
export function createUniqueAmount(baseAmount) {
  const micro = (Math.random() * 0.0001).toFixed(6);
  return (parseFloat(baseAmount) + parseFloat(micro)).toFixed(6);
}

// Cüzdan adresini döndür
export function getWalletAddress() {
  const tron = initializeTron();
  return tron.defaultAddress?.base58 || process.env.DONATION_WALLET_ADDRESS;
}

// Gelen bağışları kontrol et
export async function checkIncomingDonations(expectedAmount, walletAddress) {
  try {
    const tron = initializeTron();
    const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";
    
    const events = await tron.getEventResult(USDT_CONTRACT, {
      event_name: "Transfer",
      only_confirmed: true,
      limit: 50,
      order_by: "block_timestamp,desc",
      min_block_timestamp: Date.now() - 86400000 // Son 24 saat
    });

    return events.some(ev => {
      const { to, value } = ev.result;
      return (
        to === walletAddress &&
        parseFloat(value) / 1e6 >= parseFloat(expectedAmount)
      );
    });
  } catch (err) {
    console.error("TRON donation check error:", err);
    return false;
  }
}

// API route'larda kullanmak için optimize edilmiş versiyon
export async function getRecentTransfers(contractAddress, options = {}) {
  try {
    const tron = initializeTron();
    return await tron.getEventResult(contractAddress, {
      event_name: "Transfer",
      only_confirmed: true,
      limit: 50,
      ...options
    });
  } catch (err) {
    console.error("TRON get transfers error:", err);
    return [];
  }
}

export default initializeTron();
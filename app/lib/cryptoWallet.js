// app/lib/cryptoWallet.js
import TronWeb from 'tronweb';

let tronInstance = null;

export function getTronInstance() {
  if (!tronInstance) {
    tronInstance = new TronWeb({
      fullHost: process.env.TRON_NODE_URL || 'https://api.trongrid.io',
      headers: { 
        "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY,
        "Content-Type": "application/json"
      }
    });
  }
  return tronInstance;
}

export async function getRecentTransfers(contractAddress, options = {}) {
  try {
    const tron = getTronInstance();
    const events = await tron.getEventResult(contractAddress, {
      event_name: "Transfer",
      only_confirmed: true,
      limit: 50,
      order_by: "block_timestamp,desc",
      ...options
    });
    return events || [];
  } catch (error) {
    console.error('TRON transfer error:', error);
    throw new Error('TRON ağına bağlanılamadı');
  }
}
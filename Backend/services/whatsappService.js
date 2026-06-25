import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const isWindows = process.platform === 'win32';
const isWhatsAppEnabled = process.env.ENABLE_WHATSAPP !== 'false';
let client = null;
let isInitializing = false;

// === VARIABEL GLOBAL UNTUK FRONTEND ===
export let waStatus = "NONAKTIF"; // Status: NONAKTIF, MEMUAT, MINTA_SCAN, TERKONEKSI, ERROR
export let waQrData = "";

const createWhatsAppClient = () => {
  const waClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: process.env.CHROME_EXECUTABLE_PATH || (isWindows
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/chromium-browser'),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      handleSIGINT: false,
    },
  });

  waClient.on('qr', (qr) => {
    waStatus = "MINTA_SCAN";
    waQrData = qr;
    console.log('📱 QR Code siap di-scan (Tersedia di Frontend)');
  });

  waClient.on('ready', () => {
    waStatus = "TERKONEKSI";
    waQrData = "";
    isInitializing = false;
    console.log('✅ BOT WHATSAPP SUDAH SIAP & TERKONEKSI!');
  });

  waClient.on('authenticated', () => {
    console.log('✅ Autentikasi WhatsApp Berhasil!');
  });

  waClient.on('disconnected', () => {
    waStatus = "NONAKTIF";
    waQrData = "";
    isInitializing = false;
    client = null;
    console.log('❌ WhatsApp terputus. Silakan scan ulang.');
  });

  return waClient;
};

export const initWhatsApp = () => {
  if (process.env.ENABLE_WHATSAPP_AUTO_START === 'true') {
    return aktifkanWhatsApp();
  }

  waStatus = "NONAKTIF";
  waQrData = "";
  console.log('Bot WhatsApp standby. Aktifkan manual dari halaman laporan wali kelas.');
  return { success: true, status: waStatus };
};

export const aktifkanWhatsApp = async () => {
  if (!isWhatsAppEnabled) {
    waStatus = "NONAKTIF";
    return { success: false, message: "WhatsApp gateway dinonaktifkan lewat ENABLE_WHATSAPP=false.", status: waStatus };
  }

  if (waStatus === "TERKONEKSI") {
    return { success: true, message: "WhatsApp sudah terhubung.", status: waStatus };
  }

  if (isInitializing) {
    return { success: true, message: "WhatsApp sedang disiapkan.", status: waStatus };
  }

  try {
    isInitializing = true;
    waStatus = "MEMUAT";
    waQrData = "";
    client = createWhatsAppClient();
    client.initialize().catch((error) => {
      isInitializing = false;
      waStatus = "ERROR";
      waQrData = "";
      client = null;
      console.error('Gagal inisialisasi WhatsApp. Server tetap berjalan.', error);
    });
    return { success: true, message: "WhatsApp gateway sedang diaktifkan.", status: waStatus };
  } catch (error) {
    isInitializing = false;
    waStatus = "ERROR";
    waQrData = "";
    client = null;
    console.error('Gagal inisialisasi WhatsApp. Server tetap berjalan.', error);
    return { success: false, message: "Gagal mengaktifkan WhatsApp gateway.", status: waStatus };
  }
};

export const nonaktifkanWhatsApp = async () => {
  try {
    if (client) {
      await client.destroy();
    }
  } catch (error) {
    console.error('Gagal menonaktifkan WhatsApp gateway.', error);
  } finally {
    client = null;
    isInitializing = false;
    waStatus = "NONAKTIF";
    waQrData = "";
  }

  return { success: true, message: "WhatsApp gateway dinonaktifkan.", status: waStatus };
};

export const kirimPesanWA = async (nomorTujuan, pesan) => {
    if (waStatus !== "TERKONEKSI" || !client) return false;

    try {
        let formattedNumber = nomorTujuan.trim();
        if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.slice(1);
        else if (formattedNumber.startsWith('+62')) formattedNumber = formattedNumber.slice(1);
        
        const chatId = `${formattedNumber}@c.us`; 
        await client.sendMessage(chatId, pesan);
        return true;
    } catch (error) {
        console.error('Gagal kirim pesan', error);
        return false;
    }
};

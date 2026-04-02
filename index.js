const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const path = require('path');
const express = require('express');
const axios = require('axios');

// إعداد خادم ويب بسيط لـ Render
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('البوت يعمل بنجاح! 🚀');
});

app.listen(port, () => {
    console.log(`خادم الويب يعمل على المنفذ: ${port}`);
});

// ميزة البقاء مستيقظاً (Keep-Alive)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
    setInterval(() => {
        axios.get(RENDER_URL)
            .then(() => console.log('تم إرسال طلب البقاء مستيقظاً بنجاح.'))
            .catch(err => console.error('خطأ في طلب البقاء مستيقظاً:', err.message));
    }, 14 * 60 * 1000); // كل 14 دقيقة
}

// إنشاء عميل جديد
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser'
    }
});

const userSessions = new Map();

client.on('qr', async (qr) => {
    console.log('يرجى مسح رمز QR التالي باستخدام تطبيق واتساب:');
    qrcodeTerminal.generate(qr, { small: true });
    
    const qrPath = path.join(__dirname, 'whatsapp_qr.png');
    await QRCode.toFile(qrPath, qr);
    console.log(`تم حفظ صورة الرمز في: ${qrPath}`);
});

client.on('ready', () => {
    console.log('تم تشغيل البوت بنجاح وهو جاهز للرد!');
});

client.on('message', async (msg) => {
    if (msg.from.includes('@g.us')) return;

    const userId = msg.from;
    
    if (!userSessions.has(userId)) {
        const firstReply = "أهلاً بك! أنا بوت الرد التلقائي، قام ببرمجتي عمرو لمساعدة الدفعة وتسهيل الأمور عليكم. كيف يمكنني مساعدتك اليوم؟";
        await msg.reply(firstReply);
        userSessions.set(userId, { step: 1 });
        console.log(`تم إرسال الرد الأول لـ: ${userId}`);
    } else {
        const secondReply = "يمكنني مساعدتك في توفير المصادر الدراسية، الإجابة على الاستفسارات العامة، أو توجيهك للشخص المسؤول. أخبرني ماذا تحتاج بالضبط؟";
        await msg.reply(secondReply);
        console.log(`تم إرسال الرد الثاني لـ: ${userId}`);
    }
});

client.initialize();

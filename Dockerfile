FROM node:18-slim

# تثبيت الاعتمادات اللازمة لـ Puppeteer و Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# إعداد بيئة العمل
WORKDIR /usr/src/app

# نسخ ملفات المشروع
COPY package*.json ./
RUN npm install

COPY . .

# إعداد متغيرات البيئة
ENV CHROME_PATH=/usr/bin/chromium
ENV PORT=3000

# فتح المنفذ
EXPOSE 3000

# تشغيل البوت
CMD ["node", "index.js"]

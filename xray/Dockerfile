# Dockerfile
FROM debian:bookworm-slim

# نصب curl و unzip
RUN apt update && apt install -y curl unzip && rm -rf /var/lib/apt/lists/*

# دانلود آخرین نسخه Xray
RUN curl -L -o /tmp/xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip \
    && unzip /tmp/xray.zip -d /usr/local/xray \
    && rm /tmp/xray.zip

# کپی فایل کانفیگ
COPY config.json /usr/local/xray/config.json

# expose پورت SOCKS5 و HTTP (مثلاً 10808 و 10809)
EXPOSE 10808 10809

# دستور پیش‌فرض اجرا
ENTRYPOINT ["/usr/local/xray/xray", "run", "-config", "/usr/local/xray/config.json"]

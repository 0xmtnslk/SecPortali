# 🚀 SecPortali - Ubuntu 22.04 Nihai Kurulum Rehberi

Bu rehber, projenizi sıfır bir Ubuntu 22.04 sunucusunda, Docker ve Nginx kullanarak yayına almanız için gereken tüm adımları, karşılaşılabilecek hatalar giderilmiş şekilde içerir.

## 📋 Gereksinimler
- Temiz bir Ubuntu 22.04 Sunucusu (Root erişimi olan)
- Bir Domain (Örn: `sec-portali.medicalisg.com`)
- Domain'in sunucu IP adresine yönlendirilmiş olması (A Record)
- GitHub hesabı

---

## 1. Adım: GitHub Hazırlığı (Yerel Bilgisayarınızda)

Mevcut projenizi kendi GitHub hesabınızda **SecPortali** ismiyle yeni bir repo olarak açmak için terminalde (proje klasörünüzde) şu komutları çalıştırın:

1.  **Mevcut git geçmişini temizleyip yeniden başlatın:**
    ```bash
    rm -rf .git
    git init
    ```

2.  **Tüm dosyaları ekleyin ve ilk commit'i yapın:**
    ```bash
    git add .
    git commit -m "İlk kurulum: SecPortali"
    ```

3.  **GitHub'da "SecPortali" isminde boş bir repo oluşturun ve şu komutlarla bağlayın:**
    ```bash
    git branch -M main
    git remote add origin https://github.com/KULLANICI_ADINIZ/SecPortali.git
    git push -u origin main
    ```

---

## 2. Adım: Sunucu Hazırlığı (Ubuntu 22.04)

Sunucunuza SSH üzerinden bağlanın:
```bash
ssh root@SUNUCU_IP_ADRESINIZ
```

**Temel araçları ve sistemi güncelleyin:**
*(Nano ve Git gibi araçların eksik olmaması için)*
```bash
apt update && apt upgrade -y
apt install nano git curl apt-transport-https ca-certificates software-properties-common -y
```

---

## 3. Adım: Docker ve Docker Compose Kurulumu

1.  **Docker kurulumu:**
    ```bash
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install docker-ce -y
    ```

2.  **Docker Compose kurulumu (V2):**
    ```bash
    mkdir -p ~/.docker/cli-plugins/
    curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
    chmod +x ~/.docker/cli-plugins/docker-compose
    # Doğrulamak için: docker compose version
    ```

---

## 4. Adım: Projeyi Sunucuya İndirme ve Çalıştırma

1.  **Klasör oluşturun ve projeyi çekin:**
    ```bash
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/KULLANICI_ADINIZ/SecPortali.git
    cd SecPortali
    ```

2.  **JWT Secret ve .env Dosyası Kurulumu:**
    Önce güvenli bir şifre üretin ve kopyalayın:
    ```bash
    openssl rand -base64 32
    ```
    Şimdi `.env` dosyasını oluşturun:
    ```bash
    nano .env
    ```
    İçine şunları yapıştırın (Şifreyi ve DB ayarlarını güncelleyin):
    ```env
    NODE_ENV=production
    PORT=3001
    DB_HOST=postgres
    DB_PORT=5432
    DB_USER=asset_admin
    DB_PASSWORD=GÜÇLÜ_BİR_ŞİFRE_YAZIN
    DB_NAME=sec_portali_db
    JWT_SECRET=AZ_ÖNCE_ÜRETTİĞİNİZ_ŞİFREYİ_BURAYA_YAPIŞTIRIN
    ```

3.  **Docker Compose ile ayağa kaldırın:**
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

---

## 5. Adım: Nginx Yapılandırması ve Domain Yayını

1.  **Nginx Kurulumu:**
    ```bash
    apt install nginx -y
    ```

2.  **Ayar dosyasını oluşturun:**
    ```bash
    nano /etc/nginx/sites-available/sec-portali.medicalisg.com
    ```

3.  **Konfigürasyonu yapıştırın:**
    *(Bağlantı hatalarını önlemek için 127.0.0.1 kullanılmıştır)*
    ```nginx
    server {
        listen 80;
        server_name sec-portali.medicalisg.com;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  **Ayarı aktifleştirin ve Nginx'i yeniden başlatın:**
    ```bash
    ln -s /etc/nginx/sites-available/sec-portali.medicalisg.com /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
    ```

---

## 6. Adım: SSL (HTTPS) Kurulumu (Certbot)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d sec-portali.medicalisg.com
```

---

## ✅ Tamamlandı!
Uygulamanız artık `https://sec-portali.medicalisg.com` üzerinden yayında.

### İpuçları:
- **Değişiklikleri çekmek:** `git pull && docker compose -f docker-compose.prod.yml up -d --build`
- **Logları izlemek:** `docker compose -f docker-compose.prod.yml logs -f`

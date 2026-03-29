# 🚀 SecPortali - Ubuntu 22.04 Kurulum Rehberi

Bu rehber, projenizi sıfır bir Ubuntu 22.04 sunucusunda, Docker ve Nginx kullanarak yayına almanız için gereken tüm adımları içerecek şekilde, "hiç bilmeyen birine" göre hazırlanmıştır.

## 📋 Gereksinimler
- Temiz bir Ubuntu 22.04 Sunucusu (Root erişimi olan)
- Bir Domain (Örn: `sec-portali.medicalisg.com`)
- Domain'in sunucu IP adresine yönlendirilmiş olması (A Record)
- GitHub hesabı

---

## 1. Adım: GitHub Hazırlığı (Yerel Bilgisayarınızda)

Mevcut projenizi kendi GitHub hesabınızda **SecPortali** ismiyle yeni bir repo olarak açmak için terminalde (proje klasörünüzde) şu komutları çalıştırın:

1.  **Mevcut git geçmişini temizleyip yeniden başlatmak isterseniz (Opsiyonel):**
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
    *(Kullanıcı adınızı ve repo linkinizi kendinize göre güncelleyin)*
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

Sistemi güncelleyin:
```bash
apt update && apt upgrade -y
```

---

## 3. Adım: Docker ve Docker Compose Kurulumu

Aşağıdaki komutları sırasıyla kopyalayıp sunucunuza yapıştırın:

1.  **Docker kurulumu:**
    ```bash
    apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install docker-ce -y
    ```

2.  **Docker Compose kurulumu:**
    ```bash
    mkdir -p ~/.docker/cli-plugins/
    curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
    chmod +x ~/.docker/cli-plugins/docker-compose
    # Test etmek için:
    docker compose version
    ```

---

## 4. Adım: Projeyi Sunucuya İndirme ve Çalıştırma

1.  **Projeyi GitHub'dan çekin:**
    ```bash
    cd /var/www
    git clone https://github.com/KULLANICI_ADINIZ/SecPortali.git
    cd SecPortali
    ```

2.  **Ortam değişkenlerini (.env) ayarlayın:**
    *(Klasör içindeki .env dosyalarını oluşturun veya düzenleyin)*
    ```bash
    nano .env
    ```
    İçine şunları yazın (Backend için):
    ```env
    NODE_ENV=production
    PORT=3001
    DB_HOST=postgres
    DB_PORT=5432
    DB_USER=asset_admin
    DB_PASSWORD=asset_password_DEGIS_LUTFEN
    DB_NAME=sec_portali_db
    JWT_SECRET=CokGizliBirSifreGirin
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

2.  **Yeni bir Nginx ayar dosyası oluşturun:**
    ```bash
    nano /etc/nginx/sites-available/sec-portali.medicalisg.com
    ```

3.  **Aşağıdaki konfigürasyonu yapıştırın:**
    ```nginx
    server {
        listen 80;
        server_name sec-portali.medicalisg.com;

        location / {
            proxy_pass http://localhost:3000; # Frontend portu
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://localhost:3001; # Backend portu
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

Güvenli (🔒) bağlantı için Certbot kullanarak bedava SSL sertifikası alalım:

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d sec-portali.medicalisg.com
```
*(Certbot size email soracaktır, girin ve yönlendirmeleri (1 veya 2 seçeneği gelirse Redirect olanı seçin) onaylayın.)*

---

## ✅ Artık Hazırsınız!
Şu andan itibaren projenize `https://sec-portali.medicalisg.com` adresi üzerinden erişebilirsiniz.

### Küçük İpuçları:
- **Hataları izlemek için:** `docker compose logs -f`
- **Yeniden başlatmak için:** `docker compose restart`

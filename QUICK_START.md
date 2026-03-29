# Hızlı Başlangıç Kılavuzu (Quick Start Guide)

## Ön Koşullar (Prerequisites)

1. **Docker** kurulu ve çalışıyor olmalıdır
   - Docker'ı başlatın: Docker Desktop uygulamasını açın
   - Docker'ın çalıştığını doğrulayın: `docker --version` komutunu çalıştırın

2. **Docker Compose** kurulu olmalıdır
   - Docker Desktop ile otomatik olarak gelir

## Uygulamayı Başlatma (Starting the Application)

### Adım 1: Docker'ı Başlatın
Docker Desktop uygulamasını açın ve Docker'ın çalıştığından emin olun.

### Adım 2: Projeyi Başlatın
Terminali açın ve proje dizinine gidin:

```bash
cd /Users/metinsalik/Desktop/Varlik_Envanter_Yonetimi
```

Docker Compose ile tüm servisleri başlatın:

```bash
docker-compose up -d --build
```

Bu komut şunları yapar:
- PostgreSQL veritabanını başlatır
- Backend servisini başlatır (port 3001)
- Frontend servisini başlatır (port 3000)
- Veritabanı şemasını oluşturur ve başlangıç verilerini ekler

### Adım 3: Uygulamaya Erişin
Tarayıcınızda şu adreslere gidin:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432

### Varsayılan Giriş Bilgileri (Default Login Credentials)

- **E-posta**: admin@assetmanagement.com
- **Şifre**: admin123

⚠️ **Önemli**: Prodüksiyon ortamında varsayılan şifreyi değiştirin!

## Uygulamayı Durdurma (Stopping the Application)

Tüm servisleri durdurmak için:

```bash
docker-compose down
```

Sadece belirli bir servisi durdurmak için:

```bash
docker-compose stop <service-name>
```

Örnek:
```bash
docker-compose stop backend
```

## Servisleri Yeniden Başlatma (Restarting Services)

Tüm servisleri yeniden başlatmak için:

```bash
docker-compose restart
```

## Logları Görüntüleme (Viewing Logs)

Tüm servislerin loglarını görüntülemek için:

```bash
docker-compose logs -f
```

Belirli bir servisin loglarını görüntülemek için:

```bash
docker-compose logs -f <service-name>
```

Örnek:
```bash
docker-compose logs -f backend
```

## Sorun Giderme (Troubleshooting)

### Docker Çalışmıyor (Docker Not Running)

Docker'ın çalıştığından emin olun:
```bash
docker --version
```

Docker çalışmıyorsa Docker Desktop'ı başlatın.

### Portlar Zaten Kullanımda (Ports Already in Use)

Eğer 3000 veya 3001 portları zaten kullanımdaysa, `docker-compose.yml` dosyasındaki portları değiştirin.

### Veritabanı Bağlantı Hatası (Database Connection Error)

PostgreSQL servisinin çalıştığından emin olun:
```bash
docker-compose ps
```

Servisler çalışmıyorsa, logları kontrol edin:
```bash
docker-compose logs postgres
```

### Container'ları Temizleme (Cleaning Containers)

Tüm container'ları ve volumları temizlemek için:

```bash
docker-compose down -v
```

Bu komut tüm verileri silecektir, dikkatli kullanın!

## Yerel Geliştirme (Local Development)

Docker kullanmak istemiyorsanız, yerel geliştirme ortamını kullanabilirsiniz:

### Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

Backend şu adreste çalışacak: http://localhost:3001

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend şu adreste çalışacak: http://localhost:3000

### Veritabanı (PostgreSQL)

Yerel PostgreSQL kurulu olmalıdır. Veritabanını manuel olarak başlatmak için:

```bash
psql -U asset_admin -d asset_management -h localhost -p 5432
```

Veritabanı şemasını manuel olarak oluşturmak için:

```bash
psql -U asset_admin -d asset_management -h localhost -p 5432 -f database/init/01-init-schema.sql
psql -U asset_admin -d asset_management -h localhost -p 5432 -f database/init/02-seed-data.sql
```

## Yapılandırma (Configuration)

### Backend Ortam Değişkenleri (Backend Environment Variables)

`backend/.env` dosyası oluşturun:

```env
NODE_ENV=development
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USER=asset_admin
DB_PASSWORD=asset_password
DB_NAME=asset_management
JWT_SECRET=your_jwt_secret_key_change_in_production
ORACLE_API_URL=http://oracle-system:8080/api
```

### Frontend Ortam Değişkenleri (Frontend Environment Variables)

`frontend/.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Asset Management System
```

## Sonraki Adımlar (Next Steps)

1. Uygulamayı başlatın
2. http://localhost:3000 adresine gidin
3. Varsayılan admin hesabı ile giriş yapın
4. Sistem özelliklerini keşfedin
5. Yeni varlıklar, bakım planları ve arıza talepleri oluşturun
6. Kullanıcıları ve rolleri yönetin
7. Tesisler ve taşeronleri ekleyin

## Daha Fazla Bilgi (More Information)

Daha fazla bilgi için [`README.md`](README.md) dosyasına bakın.

# Epic Games Ücretsiz Oyunlar

Epic Games Store'da şu anda ücretsiz olan ve yakında ücretsiz olacak oyunları görüntüleyen bir web uygulaması.

## Özellikler

- Şu anda ücretsiz olan oyunların listesi
- Yakında ücretsiz olacak oyunların listesi
- Oyun detay sayfaları
- Aydınlık/karanlık tema desteği
- Responsive tasarım
- Incremental Static Regeneration (ISR) ile otomatik içerik yenilemesi
- Vercel Cron Jobs ile düzenli veri güncelleme

## Teknolojiler

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- next-themes
- Vercel Hosting ve Cron Jobs

## Kurulum

### Gereksinimler

- Node.js 14.x veya üzeri
- npm veya yarn

### Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

### Derleme ve Çalıştırma

```bash
# Üretim için derle
npm run build

# Üretim sunucusunu başlat
npm start
```

## Vercel Deployment

Bu proje Vercel'de çalışacak şekilde yapılandırılmıştır. Deployment için:

1. GitHub, GitLab veya Bitbucket'a projeyi yükleyin
2. [Vercel](https://vercel.com)'e giriş yapın
3. "New Project" tıklayın ve repo'nuzu seçin
4. "Deploy" düğmesine tıklayın

Vercel otomatik olarak projeyi derleyecek ve yayınlayacaktır.

## Cron Jobs

Bu proje, Vercel Cron Jobs kullanarak şu anda ücretsiz olan ve yakında ücretsiz olacak oyunları düzenli olarak günceller:

- Her 6 saatte bir şu anda ücretsiz olan oyunları günceller
- Her 12 saatte bir yakında ücretsiz olacak oyunları günceller

## API Endpointleri

- `/api/free-games` - Şu anda ücretsiz olan oyunların listesi
- `/api/upcoming-games` - Yakında ücretsiz olacak oyunların listesi
- `/api/game/[id]` - Belirli bir oyunun detayları

## Lisans

MIT 
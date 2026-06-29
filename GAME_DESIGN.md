# Loto O'yini - Dizayn Rejasi (Game Design Document)

## 1. O'yin Haqida Umumiy Ma'lumot

**O'yin nomi:** Loto Online  
**Platforma:** Android (APK)  
**Texnologiya:** React Native + Expo  
**Janr:** Klassik stol o'yini / Kazino  
**Til:** O'zbek tili (asosiy), Rustili ham qo'shiladi  

## 2. O'yin Mexanikasi

### 2.1 Asosiy Qoidalar
- O'yin 1 dan 90 gacha bo'lgan raqamlar bilan o'ynaladi
- Har bir o'yinchi kartochkada 3 ta qator × 9 ta ustun (27 katak) bo'ladi
- Har bir qatorda 5 ta raqam bo'ladi (4 ta bo'sh)
- Har bir ustunda raqamlar o'sish tartibida:
  - 1-ustun: 1–9
  - 2-ustun: 10–19
  - 3-ustun: 20–29
  - 4-ustun: 30–39
  - 5-ustun: 40–49
  - 6-ustun: 50–59
  - 7-ustun: 60–69
  - 8-ustun: 70–79
  - 9-ustun: 80–90

### 2.2 O'yin Turlari
- **Oddiy O'yin (Prostoy):** 1 ta raqam chiqqanda kartochkadagi raqam yopiladi
- **Tezkor O'yin (Bistriy):** 5 soniyada avtomatik raqam chiqarish
- **Ko'p Kartochkali:** Bir vaqtda 2-4 ta kartochka bilan o'ynash

### 2.3 Yutuq Darajalari
1. **Qator (Strochka):** Bitta qatordagi barcha 5 raqam yopilganda
2. **Kvartira:** Kartochkaning 2/3 qismi yopilganda
3. **To'liq Kartochka (Polnaya):** Barcha 15 ta raqam yopilganda - ASOSIY YUTUQ

## 3. O'yin Interfeysi

### 3.1 Ekranlar
| Ekran | Tavsif |
|-------|--------|
| **Splash Screen** | O'yin logotipi, yuklanish animatsiyasi |
| **Asosiy Menyu** | O'yin tugmalari, sozlamalar, statistika |
| **O'yin Ekrani** | Asosiy o'yin maydoni |
| **Yutuq Ekrani** | Yutuq animatsiyasi va natijalar |
| **Sozlamalar** | Ovoz, til, tezlik sozlamalari |
| **Statistika** | O'yin tarixi va natijalar |

### 3.2 O'yin Ekrani Elementlari
```
┌─────────────────────────────────┐
│  [Orqaga]    LOTO    [Sozlam.]  │  ← Header
├─────────────────────────────────┤
│  ┌─────┐                        │
│  │ 47  │  ← Chiqqan raqam      │  ← Number Display
│  └─────┘                        │
│  [ Oldingi raqamlar: 12, 34 ]   │  ← History
├─────────────────────────────────┤
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┐  │
│  │  │12│  │34│  │56│  │78│  │  │  ← Qator 1
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤  │
│  │1 │  │23│  │45│  │67│  │89│  │  ← Qator 2
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤  │
│  │  │9 │  │  │41│  │63│  │90│  │  ← Qator 3
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┘  │
│                                  │
│   Keg (Bočka) raqamlari: 34/90  │  ← Progress
│   ████████░░░░░░░░░░  38%       │  ← Progress Bar
│                                  │
│  [Yangi raqam chiqarish]         │  ← Draw Button
└─────────────────────────────────┘
```

## 4. Texnik Arxitektura

### 4.1 Papka Tuzilishi
```
LotoApp/
├── App.js                    # Asosiy ilova komponenti
├── app.json                  # Expo konfiguratsiyasi
├── package.json              # Bog'liqliklar
├── assets/
│   ├── images/               # Rasmlar
│   │   ├── logo.png
│   │   ├── barrel.png
│   │   └── card_bg.png
│   ├── sounds/               # Ovoz effektlari
│   │   ├── draw.mp3
│   │   ├── win.mp3
│   │   └── click.mp3
│   └── fonts/                # Shriftlar
├── src/
│   ├── screens/              # Ekranlar
│   │   ├── MainMenuScreen.js
│   │   ├── GameScreen.js
│   │   ├── WinScreen.js
│   │   ├── SettingsScreen.js
│   │   └── StatsScreen.js
│   ├── components/           # Qayta ishlatiladigan komponentlar
│   │   ├── LotoCard.js       # Kartochka komponenti
│   │   ├── NumberCell.js     # Raqam katagi
│   │   ├── DrawButton.js     # Chiqarish tugmasi
│   │   ├── NumberHistory.js  # Chiqqan raqamlar tarixi
│   │   ├── ProgressBar.js    # Progress bar
│   │   └── Header.js         # Sarlavha
│   ├── engine/               # O'yin mexanikasi
│   │   ├── CardGenerator.js  # Kartochka generatsiyasi
│   │   ├── NumberDrawer.js   # Raqam chiqarish
│   │   ├── WinDetector.js    # Yutuqni aniqlash
│   │   └── GameState.js      # O'yin holati
│   ├── storage/              # Ma'lumot saqlash
│   │   └── StatsStorage.js   # Statistika saqlash
│   ├── utils/                # Yordamchi funksiyalar
│   │   ├── constants.js      # Konstantlar
│   │   └── helpers.js        # Yordamchilar
│   └── navigation/           # Navigatsiya
│       └── AppNavigator.js
```

### 4.2 Ma'lumotlar Oqimi
```
User Action → GameScreen → GameEngine → State Update → Re-render
                ↑                              ↓
           Navigation                    WinDetector
                                         ↓
                                    WinScreen (if won)
```

## 5. O'yin Kartochkasi Generator Algoritmi

```
1. Har bir ustun uchun (1-9) raqamlar diapazonini aniqlash:
   - 1-ustun: [1..9]
   - 2-ustun: [10..19]
   - ...
   - 9-ustun: [80..90]

2. Har bir qatorda 5 ta raqam bo'lishini ta'minlash:
   - Jami 15 ta raqam (3 qator × 5)
   - Har bir qatorda tasodifiy 5 ta ustun tanlanadi
   - Tanlangan ustunlarga mos diapazondan raqam qo'yiladi

3. Raqamlar o'sish tartibida bo'lishi kerak (ustun ichida)
```

## 6. Ranglar Palitrasi

| Rang | HEX | Ishlatilishi |
|------|-----|-------------|
| Asosiy | `#1A1A2E` | Fon |
| Oltin | `#FFD700` | Yutuq, urg'u |
| Yashil | `#4CAF50` | Yopilgan raqamlar |
| Qizil | `#E53935` | Chiqqan raqam |
| Oq | `#FFFFFF` | Matn |
| Kulrang | `#9E9E9E` | Bo'sh kataklar |
| To'q ko'k | `#16213E` | Kartochka foni |

## 7. APK Qurish (Build)

### Talablar:
- Node.js 18+
- Expo CLI
- EAS Build (Expo Application Services)

### Qurish buyruqlari:
```bash
npm install -g eas-cli
eas build -p android --profile preview
```

## 8. Rivojlantirish Bosqichlari

| # | Bosqich | Vaqt |
|---|---------|------|
| 1 | Loyiha strukturasi va konfiguratsiya | ✅ |
| 2 | O'yin dvigateli (engine) | ✅ |
| 3 | Kartochka va raqam komponentlari | ✅ |
| 4 | Asosiy menyu | ✅ |
| 5 | O'yin ekrani | ✅ |
| 6 | Yutuq aniqlash | ✅ |
| 7 | Statistika va sozlamalar | ✅ |
| 8 | Ovoz va animatsiyalar | ✅ |
| 9 | APK build va test | ✅ |

---

*Hujjat oxirgi marta yangilangan: 29.06.2026*

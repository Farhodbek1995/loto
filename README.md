# 🎰 Loto Online - APK O'yin

Klassik loto o'yini. 1 dan 90 gacha raqamlar, 3×9 kartochka. React Native + Expo asosida yaratilgan.

## 🚀 GitHub orqali APK build qilish

### 1-qadam: GitHub repo yaratish
```bash
git init
git add .
git commit -m "Loto Online - birinchi versiya"
git remote add origin https://github.com/SIZNING_USERNAME/loto-app.git
git push -u origin main
```

### 2-qadam: EXPO_TOKEN olish
1. https://expo.dev saytiga kiring, akkaunt yarating (agar yo'q bo'lsa)
2. https://expo.dev/settings/access-tokens sahifasiga o'ting
3. "Create Token" tugmasini bosing
4. Tokenni nusxalab oling

### 3-qadam: GitHub Secrets ga token qo'shish
1. GitHub repongizga kiring
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** tugmasini bosing
4. **Name**: `EXPO_TOKEN`
5. **Value**: Nusxalagan Expo tokeningizni qo'ying
6. **Add secret** ni bosing

### 4-qadam: Build ishga tushirish
1. **Actions** bo'limiga o'ting
2. **Build Loto APK** workflow ni tanlang
3. **Run workflow** → **Run workflow** tugmasini bosing
4. Build tugagach, APK fayl **Artifacts** bo'limida paydo bo'ladi

## 📥 APK yuklab olish
Build muvaffaqiyatli tugagach:
1. GitHub → **Actions** → Oxirgi muvaffaqiyatli build
2. Sahifaning pastki qismida **Artifacts** → **loto-app-release** ni yuklab oling

## 🛠️ Lokal qurish (kompyuterda)

```bash
cd LotoApp
npm install
npm install -g eas-cli
eas build -p android --profile preview
```

## 📁 Loyiha tuzilishi

```
LotoApp/
├── App.js                          # Asosiy ilova
├── app.json                        # Expo konfiguratsiyasi
├── package.json                    # Bog'liqliklar
├── eas.json                        # EAS Build sozlamalari
└── src/
    ├── engine/                     # 🎮 O'yin dvigateli
    │   ├── CardGenerator.js        #   Kartochka generatsiyasi
    │   ├── NumberDrawer.js         #   Raqam chiqarish (Fisher-Yates)
    │   ├── WinDetector.js          #   Yutuq aniqlash
    │   └── GameState.js            #   O'yin holati
    ├── components/                 # 🧩 UI komponentlar
    │   ├── NumberCell.js           #   Raqam katagi
    │   ├── LotoCard.js             #   3×9 kartochka
    │   ├── DrawButton.js           #   Chiqarish tugmasi
    │   ├── NumberHistory.js        #   Chiqqan raqamlar tarixi
    │   ├── ProgressBar.js          #   Progress bar
    │   └── Header.js               #   Sarlavha
    ├── screens/                    # 📱 Ekranlar
    │   ├── MainMenuScreen.js       #   Asosiy menyu
    │   ├── GameScreen.js           #   O'yin ekrani
    │   ├── WinScreen.js            #   Yutuq ekrani
    │   ├── SettingsScreen.js       #   Sozlamalar
    │   └── StatsScreen.js          #   Statistika
    ├── navigation/
    │   └── AppNavigator.js         #   Navigatsiya
    ├── storage/
    │   └── StatsStorage.js         #   AsyncStorage
    └── utils/
        └── constants.js            #   Konstantlar
```

## 🎮 O'yin turlari

| Tur | Tavsif |
|-----|--------|
| 🎯 **Oddiy** | Raqamlarni qo'lda chiqarasiz |
| ⚡ **Tezkor** | Avtomatik har 5 soniyada raqam chiqadi |

## 🏆 Yutuq darajalari

| Daraja | Shart |
|--------|-------|
| 🎉 **Qator** | 1 ta qatordagi 5 raqam yopilganda |
| 🎊 **Kvartira** | 2 ta qator to'lganda |
| 🏆 **To'liq Kartochka** | Barcha 15 raqam yopilganda |

## 🛡️ Texnologiyalar

- **React Native** 0.76 + **Expo** 52
- **React Navigation** 6 (stack navigator)
- **AsyncStorage** (statistika saqlash)
- **EAS Build** (APK qurish)

---
© 2026 LotoApp

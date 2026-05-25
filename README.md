# Focus OS — نظام التركيز

تطبيق React + TypeScript: مصفوفة آيزنهاور، مدير مهام أسبوعي، ومزرعة مرتبطة بالإنتاجية.

## المتطلبات

- [Node.js](https://nodejs.org/) 18 أو أحدث (يُفضّل 20 LTS)
- [VS Code](https://code.visualstudio.com/)

## فتح المشروع في VS Code

1. **File → Open Folder** واختر:
   ```
   C:\Users\Aljazeea\Projects\focus-os
   ```
2. افتح الطرفية: **Terminal → New Terminal**
3. ثبّت الحزم:
   ```bash
   npm install
   ```
4. شغّل التطوير:
   ```bash
   npm run dev
   ```
5. افتح المتصفح: **http://localhost:5173/**

| المسار | الصفحة |
|--------|--------|
| `/` | لوحة التركيز |
| `/tasks` | المهام |
| `/farm` | المزرعة |

## أوامر npm

```bash
npm run dev      # خادم التطوير
npm run build    # بناء الإنتاج
npm run preview  # معاينة البناء
```

## إعدادات اختيارية (`.env`)

```env
VITE_STORAGE_KEY=focusMatrix_v2
VITE_GAME_SPEED_MULTIPLIER=1
VITE_SOUND_ENABLED=true
```

لتسريع نمو المحاصيل للاختبار: `VITE_GAME_SPEED_MULTIPLIER=60`

## الصفحات الثلاث (ملف لكل صفحة)

| الملف | الرابط |
|--------|--------|
| `src/pages/IndexPage.tsx` | `/` — لوحة التركيز |
| `src/pages/TasksPage.tsx` | `/tasks` — المهام |
| `src/pages/FarmPage.tsx` | `/farm` — المزرعة |

كل ملف يضم **كل مكوّنات صفحته** في مكان واحد. باقي المشروع مشترك: `store/`, `engine/`, `hooks/`, `components/layout`, `components/ui`.

راجع `src/pages/PAGES.md` للتفاصيل.

## هيكل المشروع

```
focus-os/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env
├── scripts/bundle-pages.mjs   # إعادة دمج المكوّنات في 3 ملفات
├── public/sounds/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── router.tsx
    ├── pages/
    │   ├── IndexPage.tsx      ← الصفحة 1
    │   ├── TasksPage.tsx      ← الصفحة 2
    │   ├── FarmPage.tsx       ← الصفحة 3
    │   └── PAGES.md
    ├── store/
    ├── engine/
    ├── constants/
    ├── hooks/
    ├── utils/
    └── components/            # layout + ui (+ مصدر للمكوّنات عند إعادة الدمج)
```

## استكشاف الأخطاء

- **صفحة فارغة:** امسح بيانات الموقع في DevTools → Application → Local Storage → `focusMatrix_v2` ثم أعد التحميل.
- **المزرعة لا تستجيب:** تأكد أن القطعة فارغة (🟫) للزراعة، أو خضراء نابضة للحصاد.
- **Pixi / WebGL:** إن فشل WebGL يُستخدم خلفية CSS تلقائياً.

## التخزين

كل الصفحات تشارك مفتاح `focusMatrix_v2` في `localStorage`.

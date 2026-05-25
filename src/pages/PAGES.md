# الصفحات الثلاث — Focus OS

المشروع **متكامل** (store + engines + layout مشتركة)، لكن كل صفحة في **ملف واحد**:

| الملف | المسار | الوصف |
|--------|--------|--------|
| `IndexPage.tsx` | `/` | لوحة التركيز — مصفوفة آيزنهاور + حضور + إنتاجية |
| `TasksPage.tsx` | `/tasks` | مدير المهام — أعمدة + فلاتر |
| `FarmPage.tsx` | `/farm` | المزرعة — زراعة + متجر + حيوانات + منافسون |

## ما يبقى مشتركاً (لا تكرره في الصفحات)

```
src/store/       ← Zustand + localStorage
src/engine/      ← نمو، عملات، منافسون، طقس، صوت
src/constants/   ← محاصيل، حيوانات، رسائل
src/hooks/       ← useWeekNav, useGameLoop, usePlotActions...
src/components/
  layout/        ← Navbar, CoinBadge
  ui/            ← GlassCard, ProgressRing...
```

## إعادة بناء الملفات بعد تعديل مكوّن قديم

إذا عدّلت ملفاً في `components/dashboard|tasks|farm` شغّل:

```bash
node scripts/bundle-pages.mjs
```

## VS Code

افتح المجلد `focus-os` ثم راجع الملفات الثلاثة أعلاه مباشرة.

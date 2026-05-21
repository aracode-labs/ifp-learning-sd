# 📞 Communication & Development Guide

**Project**: IFP Learning SD  
**Status**: 🚀 Development Phase  
**Last Updated**: May 21, 2026

---

## Chat Protocol

### Cara Komunikasi dengan Copilot

**Format standar untuk request:**
```
[ACTION] [DETAIL]
Contoh: "Buat component SubjectSelector dengan props XYZ"
```

**Format untuk update file:**
```
[FILE PATH] → [PERUBAHAN]
Contoh: "src/App.tsx → tambah import SubjectSelector"
```

### Response Format

Copilot akan selalu:
- ✅ Confirm file path yang dikerjakan
- ✅ Jelaskan perubahan yang dibuat
- ✅ Commit ke GitHub otomatis setelah setiap fitur selesai
- ✅ Maintain git history yang clean

---

## Development Workflow

### 1️⃣ Feature Development
```
Request → Create/Edit Files → Test → Commit → Response
```

### 2️⃣ Commit Strategy
- **Setiap fitur selesai** → `git add . && git commit -m "feat: [description]"`
- **Bug fixes** → `git commit -m "fix: [description]"`
- **Documentation** → `git commit -m "docs: [description]"`

### 3️⃣ Branch Strategy
- **Main**: Production-ready code
- **Develop**: (Optional) Development branch jika diperlukan

---

## File Structure

```
ifp-learning-sd/
├── src/
│   ├── components/          # React components
│   │   ├── SubjectSelector/
│   │   ├── ContentViewer/
│   │   ├── VideoPlayer/
│   │   ├── Quiz/
│   │   └── Simulator/
│   ├── data/               # JSON data files
│   │   ├── subjects/       # Per-subject data
│   │   └── subjects.json   # Master subject list
│   ├── utils/              # Utility functions
│   ├── config.ts           # App config
│   ├── App.tsx             # Main app
│   └── main.tsx
├── public/                 # Assets
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tauri.conf.json
└── README.md
```

---

## Development Checklist

### Phase 1: UI Components ⏳
- [ ] SubjectSelector component
- [ ] ContentViewer component
- [ ] VideoPlayer component
- [ ] Quiz component
- [ ] Simulator component

### Phase 2: Data Integration ⏳
- [ ] Load JSON subjects data
- [ ] Parse material content
- [ ] Load video metadata
- [ ] Load quiz data
- [ ] Load simulation data

### Phase 3: Features ⏳
- [ ] Material reading
- [ ] Video playback
- [ ] Quiz system
- [ ] Progress tracking
- [ ] Simulator engine

### Phase 4: Polish ⏳
- [ ] Responsive design
- [ ] Dark mode (optional)
- [ ] Offline support
- [ ] Performance optimization

---

## Quick Commands

```bash
# Development
npm run tauri dev

# Build desktop app
npm run tauri build

# Type checking
npm run tauri build --config tauri.conf.json

# Git operations (manual if needed)
git add .
git commit -m "feat: description"
git push origin main
```

---

## Request Examples

### ✅ Good Format
```
Buat SubjectSelector component di src/components/SubjectSelector/
- Props: subjects array, onSelectSubject callback
- Responsive: mobile 1 column, tablet 2, desktop 3
- Show subject icon dan nama
- Button onClick redirect ke detail
```

### ✅ Alternative
```
src/components/ContentViewer/index.tsx
→ Tambahin fitur print material
→ Icon print di top-right
→ Trigger browser print dialog
→ Styling auto-hide saat print
```

---

## Important Notes

### 🔐 Security
- ⚠️ **PAT token sudah direvoke** - lihat GitHub settings
- ✅ Git push akan prompt username/password jika perlu
- ✅ Use `git config credential.helper store` (optional, hati-hati)

### 📊 Data Structure
Semua data subjects menggunakan JSON schema di `src/data/subjects/[subject]/index.json`
- Materials: Text content
- Videos: URL references
- Quiz: Q&A format
- Simulations: Interactive content specs

### 🚀 Deployment
- Desktop: `npm run tauri build` → `.dmg` / `.exe`
- Web: (Optional) Build React untuk web
- IFP Device: Deploy built app ke touchscreen

---

## Contact & Questions

Jika ada yang tidak jelas:
1. Tanya di chat (akan langsung dijawab)
2. Check dokumentasi di folder ini
3. Review git history untuk context sebelumnya

---

## Checklist Sebelum Push

- [ ] Files sudah disave
- [ ] No console errors
- [ ] Tested di dev server
- [ ] Git status clean
- [ ] Commit message descriptive

---

**Status**: ✅ Ready for Development  
**Next Step**: Buat SubjectSelector component  
**GitHub**: https://github.com/aracode-labs/ifp-learning-sd

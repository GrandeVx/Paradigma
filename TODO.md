# Balance → Boilerplate Conversion - TODO

## 🎯 **OBIETTIVO**
Convertire la monorepo Balance in un boilerplate universale moderno per sviluppo fullstack (Next.js + Expo) mantenendo l'architettura solida ma rimuovendo la logica business specifica.

---

## 📋 **ROADMAP CONVERSIONE**

### **🚨 FASE 1 - SICUREZZA & CLEANUP CRITICO**
- [ ] **Rimuovere credenziali hardcoded** da `docker-compose.yml`
- [ ] **Creare `.env.example`** con template variabili ambiente
- [ ] **Rimuovere chiavi API specifiche** Balance da EAS config
- [ ] **Eliminare file sensibili** (authKeyApple.p8, etc.)

### **🗄️ FASE 2 - DATABASE & API**
- [ ] **Semplificare schema Prisma** → solo User/Auth/Session base
- [ ] **Rimuovere router tRPC** specifici Balance (transaction, budget, goal, account, category)
- [ ] **Mantenere sistema error handling** e validation patterns
- [ ] **Creare seed base** con admin user generico
- [ ] **Aggiornare Zod schemas** per modelli rimanenti

### **📱 FASE 3 - MOBILE APP**
- [ ] **Rivedere hooks** → mantenere 6 generici, rimuovere 5 specifici Balance
- [ ] **Sostituire screens** Balance con dashboard/profile base
- [ ] **Rimuovere componenti business** (charts finanziari, transaction forms)
- [ ] **Mantenere sistema UI** completo (components/ui/, design system)
- [ ] **Aggiornare routing** Expo Router per app generica
- [ ] **Rimuovere assets specifici** (logo Balance, video background)

### **🌐 FASE 4 - WEB APP**
- [ ] **Creare landing page** generica con Next.js 15
- [ ] **Dashboard base** con auth flow
- [ ] **Rimuovere pagine specifiche** Balance
- [ ] **Mantenere configurazione** SSR/SSG patterns
- [ ] **Aggiornare middleware** auth per uso generico

### **🎨 FASE 5 - DESIGN SYSTEM & UI**
- [ ] **Mantenere package styles** completo
- [ ] **Aggiornare theme** con branding generico
- [ ] **Rimuovere componenti domain-specific**
- [ ] **Mantenere Tailwind config** e NativeWind setup
- [ ] **Documentare design tokens**

### **🔧 FASE 6 - CONFIGURAZIONI & BUILD**
- [ ] **Rinominare packages** da `@paradigma/*` a `@boilerplate/*`
- [ ] **Aggiornare package.json** root e workspace
- [ ] **Rimuovere dipendenze specifiche** (Superwall, Stripe specifics)
- [ ] **Mantenere Docker** multi-stage build
- [ ] **Aggiornare Turbo config** per boilerplate

### **📝 FASE 7 - TRANSLATIONS & I18N**
- [ ] **Pulire translation files** da keys Balance-specific
- [ ] **Mantenere setup i18n** base (en-US, it-IT)
- [ ] **Aggiungere keys generiche** per auth, dashboard, profile
- [ ] **Documentare aggiunta** nuove lingue

### **📚 FASE 8 - DOCUMENTAZIONE**
- [ ] **Creare README** boilerplate con setup instructions
- [ ] **Documentare architettura** e patterns
- [ ] **Guide per estensione** (aggiungere features, API routes)
- [ ] **Esempi di usage** per componenti chiave
- [ ] **Setup development** e deployment guide

---

## 📂 **AREE ANALIZZATE**
- ✅ **Struttura monorepo generale** - Analizzata da team di agent
- ✅ **Backend & API architecture** - tRPC, BetterAuth, Prisma patterns identificati
- ✅ **Database schema** - Modelli base vs specifici mappati
- ✅ **Mobile hooks** - 6 da mantenere, 5 da rimuovere (documentato in `/apps/mobile/hooks/README.md`)
- ⏳ **Mobile components** - Da analizzare
- ⏳ **Web app structure** - Da analizzare  
- ⏳ **Shared packages** - Da analizzare
- ⏳ **Build & deployment** - Da analizzare

---

## 📊 **STATO ATTUALE**

### **✅ COMPLETATO**
- Analisi approfondita architettura generale
- Identificazione componenti base vs specifici
- Mappatura database schema per cleanup
- Documentazione hook mobile con raccomandazioni
- Piano di refactoring dettagliato

### **🔄 IN CORSO**
- Analisi dettagliata aree specifiche

### **⏳ DA FARE**
- Implementazione cleanup secondo roadmap
- Testing e validazione boilerplate
- Documentazione finale

---

## 🎁 **RISULTATO FINALE**

Un boilerplate production-ready con:
- **Cross-platform** (Next.js 15 + Expo SDK 53)  
- **Type-safe APIs** (tRPC v10)
- **Modern auth** (BetterAuth + Biometric)
- **Performance ottimizzate** (caching, prefetching, animations)
- **Docker deployment** ready
- **Design system** completo
- **Monorepo** ottimizzata con Turbo

Perfetto starting point per nuove app moderne fullstack.

---

**💡 NOTE**: Questo TODO sarà aggiornato man mano che procediamo con la conversione. Ogni fase può essere eseguita indipendentemente ma segue un ordine logico di priorità.
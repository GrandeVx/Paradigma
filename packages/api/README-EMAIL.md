# 📧 Configurazione Email Service

## Variabili d'Ambiente Richieste

Aggiungi queste variabili al tuo file `.env`:

```env
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

## Provider Email Supportati

### Gmail
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"  # App Password, non la password normale
```

### Outlook/Hotmail
```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
```

### Yahoo
```env
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_USER="your-email@yahoo.com"
EMAIL_PASSWORD="your-app-password"
```

## Come Ottenere App Password (Gmail)

1. Vai su [Google Account Settings](https://myaccount.google.com/)
2. Sicurezza → Verifica in due passaggi (deve essere attiva)
3. App passwords → Seleziona app: Mail
4. Copia la password generata (16 caratteri)
5. Usa questa password nella variabile `EMAIL_PASSWORD`

## Test del Servizio

Puoi testare la configurazione email usando l'endpoint:

```typescript
// Endpoint di test
GET /api/trpc/util.emailCheck
```

## Funzionalità

- ✅ **Invio Email di Benvenuto**: Automatico dopo iscrizione whitelist
- ✅ **Template React**: Email stilizzate con design Balance  
- ✅ **Fallback Graceful**: L'iscrizione funziona anche se l'email fallisce
- ✅ **Logging Dettagliato**: Log completi per debugging
- ✅ **Verifica Connessione**: Endpoint per testare la configurazione

## Struttura Template Email

I template email si trovano in:
- `packages/api/src/templates/` - Template backend
- `apps/web/src/emails/` - Template frontend (per preview)

## Personalizzazione

Per modificare l'email di benvenuto, edita:
`packages/api/src/templates/whitelist-welcome.tsx` 
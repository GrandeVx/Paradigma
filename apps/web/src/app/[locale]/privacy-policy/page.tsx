export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-4">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT')}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Versione:</strong> 1.0
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduzione</h2>
          <p>
            La presente Privacy Policy descrive come Balance raccoglie, utilizza, 
            conserva e protegge i tuoi dati personali quando utilizzi la nostra 
            applicazione di gestione finanziaria personale. Ci impegniamo a rispettare 
            la tua privacy e a garantire la protezione dei tuoi dati in conformità 
            con il Regolamento Generale sulla Protezione dei Dati (GDPR) e le 
            normative italiane applicabili.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Titolare del Trattamento</h2>
          <p>
            Il Titolare del trattamento dei dati personali è Balance App.
          </p>
          <p className="mt-4">
            <strong>Contatti:</strong><br />
            Email: privacy@balance-app.com<br />
            Indirizzo: [Indirizzo da specificare]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Dati Personali Raccolti</h2>
          
          <h3 className="text-xl font-medium mb-3">3.1 Dati di Identificazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Nome e cognome:</strong> Per personalizzare la tua esperienza</li>
            <li><strong>Indirizzo email:</strong> Per autenticazione e comunicazioni</li>
            <li><strong>Username:</strong> Identificativo univoco nell'applicazione</li>
            <li><strong>Avatar/immagine profilo:</strong> Opzionale, per personalizzazione</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Dati Finanziari</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Conti finanziari:</strong> Nome, tipo, saldo iniziale, valuta</li>
            <li><strong>Transazioni:</strong> Importi, descrizioni, date, categorie, note</li>
            <li><strong>Budget:</strong> Importi allocati per categorie di spesa</li>
            <li><strong>Obiettivi di risparmio:</strong> Target, scadenze, progressi</li>
            <li><strong>Dati aggregati:</strong> Statistiche e analytics delle tue finanze</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.3 Dati di Autenticazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Credenziali di accesso:</strong> Email e password hashata</li>
            <li><strong>Token OAuth:</strong> Per autenticazione tramite Google e Apple</li>
            <li><strong>Sessioni:</strong> Token di sessione, scadenze, IP, user agent</li>
            <li><strong>Codici di verifica:</strong> OTP temporanei per verifica email</li>
            <li><strong>Dati biometrici:</strong> Face ID/Touch ID (memorizzati solo localmente)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.4 Dati di Configurazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Preferenze linguistiche:</strong> Italiano, inglese</li>
            <li><strong>Valuta predefinita:</strong> Euro, USD, altre valute</li>
            <li><strong>Impostazioni notifiche:</strong> Orari, tipologie, permessi</li>
            <li><strong>Preferenze di visualizzazione:</strong> Tema, blur del saldo</li>
            <li><strong>Stato onboarding:</strong> Progresso nell'introduzione all'app</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.5 Dati Tecnici</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Indirizzo IP:</strong> Per sicurezza e analisi degli accessi</li>
            <li><strong>User Agent:</strong> Informazioni su browser e dispositivo</li>
            <li><strong>Timestamp:</strong> Date e orari delle operazioni</li>
            <li><strong>Log di sistema:</strong> Per debugging e miglioramento servizio</li>
            <li><strong>Dati di cache:</strong> Per migliorare le performance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Finalità del Trattamento</h2>
          
          <h3 className="text-xl font-medium mb-3">4.1 Finalità Principali</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Gestione finanziaria personale:</strong> Fornire strumenti per tracciare spese, entrate e budget</li>
            <li><strong>Autenticazione:</strong> Verificare la tua identità e gestire l'accesso sicuro</li>
            <li><strong>Personalizzazione:</strong> Adattare l'esperienza alle tue preferenze</li>
            <li><strong>Analisi finanziarie:</strong> Generare report e insights sui tuoi dati</li>
            <li><strong>Obiettivi di risparmio:</strong> Monitorare progressi verso i tuoi obiettivi</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Finalità Tecniche</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Sicurezza:</strong> Prevenire frodi e accessi non autorizzati</li>
            <li><strong>Performance:</strong> Ottimizzare velocità e stabilità dell'applicazione</li>
            <li><strong>Debugging:</strong> Identificare e risolvere problemi tecnici</li>
            <li><strong>Backup:</strong> Garantire la continuità del servizio</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.3 Finalità di Comunicazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Notifiche operative:</strong> Promemoria per transazioni ricorrenti</li>
            <li><strong>Comunicazioni di sicurezza:</strong> Avvisi di accesso e modifiche</li>
            <li><strong>Supporto clienti:</strong> Rispondere alle tue richieste</li>
            <li><strong>Aggiornamenti servizio:</strong> Informazioni su nuove funzionalità</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Base Giuridica del Trattamento</h2>
          
          <h3 className="text-xl font-medium mb-3">5.1 Consenso (Art. 6.1.a GDPR)</h3>
          <p>
            Per il trattamento di dati non strettamente necessari, come:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Notifiche push personalizzate</li>
            <li>Analytics avanzate</li>
            <li>Comunicazioni marketing (se implementate)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">5.2 Esecuzione del Contratto (Art. 6.1.b GDPR)</h3>
          <p>
            Per fornire i servizi richiesti:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Gestione account e autenticazione</li>
            <li>Archiviazione e elaborazione dati finanziari</li>
            <li>Funzionalità di budgeting e tracking</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">5.3 Interesse Legittimo (Art. 6.1.f GDPR)</h3>
          <p>
            Per migliorare il servizio e garantire la sicurezza:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Sicurezza informatica e prevenzione frodi</li>
            <li>Ottimizzazione performance</li>
            <li>Debugging e risoluzione problemi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Modalità di Trattamento</h2>
          
          <h3 className="text-xl font-medium mb-3">6.1 Raccolta Dati</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Diretta:</strong> Dati inseriti dall'utente nell'applicazione</li>
            <li><strong>Automatica:</strong> Dati tecnici generati dall'uso dell'app</li>
            <li><strong>OAuth:</strong> Dati di profilo da provider esterni (Google, Apple)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.2 Archiviazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Database PostgreSQL:</strong> Dati strutturati con crittografia</li>
            <li><strong>Cache Redis:</strong> Dati temporanei per performance</li>
            <li><strong>Secure Storage:</strong> Dati sensibili con crittografia avanzata</li>
            <li><strong>Storage locale:</strong> Preferenze e cache (solo su dispositivo)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.3 Elaborazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Automatizzata:</strong> Calcoli finanziari e statistiche</li>
            <li><strong>Batch processing:</strong> Elaborazione transazioni ricorrenti</li>
            <li><strong>Real-time:</strong> Aggiornamenti immediati e notifiche</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Condivisione dei Dati</h2>
          
          <h3 className="text-xl font-medium mb-3">7.1 Principio Generale</h3>
          <p>
            I tuoi dati personali NON sono venduti, affittati o condivisi con terze parti 
            per scopi commerciali. La condivisione avviene solo nei casi strettamente 
            necessari descritti di seguito.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">7.2 Fornitori di Servizi</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Google OAuth:</strong> Per autenticazione tramite account Google</li>
            <li><strong>Apple Sign-In:</strong> Per autenticazione tramite Apple ID</li>
            <li><strong>Expo Push Notifications:</strong> Per invio notifiche push</li>
            <li><strong>Superwall:</strong> Per gestione sottoscrizioni premium</li>
            <li><strong>Servizi SMTP:</strong> Per invio email di verifica</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">7.3 Obblighi Legali</h3>
          <p>
            Possiamo condividere i tuoi dati quando richiesto da:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Autorità giudiziarie o di polizia</li>
            <li>Autorità di regolamentazione</li>
            <li>Altri obblighi di legge</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Trasferimento Dati Internazionali</h2>
          <p>
            I tuoi dati possono essere trasferiti e archiviati in paesi diversi da quello 
            di residenza, inclusi Stati Uniti e altri paesi, per i seguenti servizi:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li><strong>Google OAuth:</strong> Dati di autenticazione processati da Google</li>
            <li><strong>Apple Sign-In:</strong> Dati di autenticazione processati da Apple</li>
            <li><strong>Expo Services:</strong> Servizi di notifica e aggiornamenti</li>
          </ul>
          <p className="mt-4">
            Tutti i trasferimenti avvengono con adeguate garanzie di protezione in conformità 
            al GDPR, incluse decisioni di adeguatezza o clausole contrattuali standard approvate 
            dalla Commissione Europea.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Conservazione dei Dati</h2>
          
          <h3 className="text-xl font-medium mb-3">9.1 Criteri di Conservazione</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Dati account attivi:</strong> Fino alla cancellazione dell'account</li>
            <li><strong>Dati account eliminati:</strong> Eliminazione immediata e irreversibile</li>
            <li><strong>Sessioni:</strong> Scadenza automatica configurabile (default: 7 giorni)</li>
            <li><strong>Codici verifica:</strong> Eliminazione automatica dopo 15 minuti</li>
            <li><strong>Cache:</strong> Eliminazione periodica automatica</li>
            <li><strong>Log di sistema:</strong> Conservazione per 30 giorni per debugging</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">9.2 Cache e Performance</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Cache Redis:</strong> TTL differenziato per tipo di dato</li>
            <li><strong>Cache locale:</strong> Pulizia automatica ogni 6 mesi</li>
            <li><strong>Cache transazioni:</strong> Retention di 6 mesi</li>
            <li><strong>Cache grafici:</strong> Retention di 3 mesi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Misure di Sicurezza</h2>
          
          <h3 className="text-xl font-medium mb-3">10.1 Sicurezza Tecnica</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Crittografia:</strong> HTTPS per dati in transito, crittografia at-rest</li>
            <li><strong>Autenticazione:</strong> Multi-fattore con OAuth e biometria</li>
            <li><strong>Isolamento:</strong> Dati segregati per utente nel database</li>
            <li><strong>Monitoring:</strong> Controllo accessi e rilevamento anomalie</li>
            <li><strong>Backup:</strong> Backup crittografati con recovery point</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">10.2 Sicurezza Organizzativa</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Accesso limitato:</strong> Solo personale autorizzato</li>
            <li><strong>Formazione:</strong> Staff formato sulla privacy e sicurezza</li>
            <li><strong>Audit:</strong> Controlli periodici dei sistemi</li>
            <li><strong>Incident response:</strong> Procedure per gestire violazioni</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">10.3 Sicurezza Mobile</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Autenticazione biometrica:</strong> Face ID/Touch ID</li>
            <li><strong>Secure Storage:</strong> Secure Enclave per dati sensibili</li>
            <li><strong>Session timeout:</strong> Logout automatico dopo inattività</li>
            <li><strong>App security:</strong> Protezione contro debugging e reverse engineering</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. I Tuoi Diritti</h2>
          
          <h3 className="text-xl font-medium mb-3">11.1 Diritto di Accesso (Art. 15 GDPR)</h3>
          <p>
            Hai il diritto di ottenere conferma che i tuoi dati personali sono trattati 
            e di accedere a tali dati. Puoi visualizzare tutti i tuoi dati attraverso 
            l'applicazione o richiedere un export completo.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.2 Diritto di Rettifica (Art. 16 GDPR)</h3>
          <p>
            Puoi correggere o aggiornare i tuoi dati personali in qualsiasi momento 
            attraverso le impostazioni dell'applicazione.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.3 Diritto alla Cancellazione (Art. 17 GDPR)</h3>
          <p>
            Puoi richiedere l'eliminazione completa del tuo account e di tutti i dati 
            associati. L'eliminazione è immediata e irreversibile.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.4 Diritto di Portabilità (Art. 20 GDPR)</h3>
          <p>
            Puoi richiedere di ricevere i tuoi dati in un formato strutturato, 
            di uso comune e leggibile da dispositivo automatico.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.5 Diritto di Opposizione (Art. 21 GDPR)</h3>
          <p>
            Puoi opporti al trattamento dei tuoi dati per finalità di marketing 
            diretto o per motivi legittimi.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.6 Diritto di Limitazione (Art. 18 GDPR)</h3>
          <p>
            Puoi richiedere la limitazione del trattamento in circostanze specifiche, 
            come durante la verifica dell'accuratezza dei dati.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">11.7 Revoca del Consenso</h3>
          <p>
            Dove il trattamento è basato sul consenso, puoi revocarlo in qualsiasi 
            momento senza compromettere la liceità del trattamento precedente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Esercizio dei Diritti</h2>
          
          <h3 className="text-xl font-medium mb-3">12.1 Come Esercitare i Tuoi Diritti</h3>
          <p>
            Puoi esercitare i tuoi diritti attraverso:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Impostazioni dell'applicazione (per la maggior parte dei diritti)</li>
            <li>Email a: privacy@balance-app.com</li>
            <li>Funzionalità di export dati integrata nell'app</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">12.2 Tempi di Risposta</h3>
          <p>
            Rispondiamo alle richieste senza ingiustificato ritardo e comunque 
            entro 30 giorni dal ricevimento. In casi complessi, il termine può 
            essere esteso di altri 60 giorni con opportuna comunicazione.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">12.3 Reclami</h3>
          <p>
            Hai il diritto di presentare reclamo al Garante per la protezione 
            dei dati personali o all'autorità di controllo competente se ritieni 
            che il trattamento violi il GDPR.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Modifiche alla Privacy Policy</h2>
          <p>
            Possiamo aggiornare periodicamente questa Privacy Policy per riflettere 
            cambiamenti nelle nostre pratiche, nella tecnologia o nelle normative. 
            Le modifiche sostanziali saranno comunicate attraverso:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Notifica nell'applicazione</li>
            <li>Email agli utenti registrati</li>
            <li>Aggiornamento della data di "ultimo aggiornamento"</li>
          </ul>
          <p className="mt-4">
            Ti consigliamo di controllare periodicamente questa pagina per 
            rimanere informato sui nostri impegni per la protezione della privacy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Minori</h2>
          <p>
            Balance non è destinato a minori di 16 anni. Non raccogliamo 
            consapevolmente dati personali da minori di 16 anni. Se veniamo 
            a conoscenza che un minore di 16 anni ha fornito dati personali, 
            procederemo immediatamente alla cancellazione.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contatti</h2>
          <p>
            Per domande, dubbi o richieste riguardanti questa Privacy Policy 
            o il trattamento dei tuoi dati personali, puoi contattarci:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li><strong>Email:</strong> privacy@balance-app.com</li>
            <li><strong>Oggetto:</strong> Privacy Policy - [Tua richiesta]</li>
            <li><strong>Supporto nell'app:</strong> Attraverso le impostazioni</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. Efficacia</h2>
          <p>
            Questa Privacy Policy è efficace dal {new Date().toLocaleDateString('it-IT')} 
            e sostituisce tutte le versioni precedenti. L'uso continuato dell'applicazione 
            dopo la pubblicazione di modifiche costituisce accettazione della 
            Privacy Policy aggiornata.
          </p>
        </section>
      </div>
    </div>
  );
}
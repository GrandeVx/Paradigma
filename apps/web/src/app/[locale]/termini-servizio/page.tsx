export default function TerminiServizioPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Termini di Servizio</h1>
      
      <div className="prose prose-lg max-w-none">
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-4">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Accettazione dei Termini</h2>
          <p>
            Benvenuto in Balance, un'applicazione di gestione finanziaria personale. 
            Utilizzando i nostri servizi, accetti integralmente i presenti Termini di Servizio 
            e la nostra Privacy Policy. Se non accetti questi termini, ti preghiamo di non 
            utilizzare l'applicazione.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descrizione del Servizio</h2>
          <p>
            Balance è un'applicazione mobile e web che offre strumenti per la gestione 
            finanziaria personale, inclusi:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Gestione di conti finanziari multipli (banca, carte, contanti)</li>
            <li>Tracciamento di transazioni in entrata e in uscita</li>
            <li>Creazione e monitoraggio di budget mensili per categoria</li>
            <li>Definizione e tracking di obiettivi di risparmio</li>
            <li>Visualizzazione di analytics e report finanziari</li>
            <li>Supporto per transazioni ricorrenti automatiche</li>
            <li>Notifiche personalizzabili per promemoria e aggiornamenti</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Registrazione e Account</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Requisiti di Registrazione</h3>
          <p>
            Per utilizzare Balance, devi creare un account fornendo:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Un indirizzo email valido</li>
            <li>Un nome utente univoco</li>
            <li>Una password sicura (se non utilizzi l'autenticazione OAuth)</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3 mt-6">3.2 Autenticazione</h3>
          <p>
            Supportiamo diversi metodi di autenticazione:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Email e password tradizionali</li>
            <li>Autenticazione OAuth tramite Google</li>
            <li>Autenticazione OAuth tramite Apple Sign-In</li>
            <li>Verifica tramite codice OTP inviato via email</li>
            <li>Autenticazione biometrica (Face ID/Touch ID) per l'app mobile</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">3.3 Sicurezza dell'Account</h3>
          <p>
            Ti impegni a:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Mantenere riservate le tue credenziali di accesso</li>
            <li>Notificarci immediatamente qualsiasi uso non autorizzato</li>
            <li>Utilizzare password sicure e aggiornarle regolarmente</li>
            <li>Non condividere il tuo account con terze parti</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Utilizzo del Servizio</h2>
          <h3 className="text-xl font-medium mb-3">4.1 Uso Consentito</h3>
          <p>
            Puoi utilizzare Balance esclusivamente per:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Gestire le tue finanze personali</li>
            <li>Tracciare le tue transazioni e budget</li>
            <li>Monitorare i tuoi obiettivi di risparmio</li>
            <li>Generare report e analytics personali</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">4.2 Uso Vietato</h3>
          <p>
            È espressamente vietato:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Utilizzare l'applicazione per attività illegali</li>
            <li>Tentare di accedere ai dati di altri utenti</li>
            <li>Interferire con il funzionamento del servizio</li>
            <li>Utilizzare bot o script automatici</li>
            <li>Violare i diritti di proprietà intellettuale</li>
            <li>Trasmettere virus o codice dannoso</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Dati e Privacy</h2>
          <h3 className="text-xl font-medium mb-3">5.1 Dati Trattati</h3>
          <p>
            Balance raccoglie e tratta i seguenti tipi di dati:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Dati di identificazione:</strong> Nome, email, username, avatar</li>
            <li><strong>Dati finanziari:</strong> Transazioni, conti, budget, obiettivi di risparmio</li>
            <li><strong>Dati di autenticazione:</strong> Credenziali, token OAuth, sessioni</li>
            <li><strong>Dati di configurazione:</strong> Preferenze linguistiche, impostazioni notifiche</li>
            <li><strong>Dati tecnici:</strong> Indirizzo IP, user agent, timestamp di accesso</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">5.2 Sicurezza dei Dati</h3>
          <p>
            Implementiamo misure di sicurezza avanzate:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Crittografia dei dati in transito tramite HTTPS</li>
            <li>Isolamento dei dati per utente nel database</li>
            <li>Autenticazione biometrica per l'app mobile</li>
            <li>Gestione sicura delle sessioni con scadenza automatica</li>
            <li>Backup crittografati dei dati</li>
            <li>Monitoraggio degli accessi e logging delle operazioni</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">5.3 Conservazione e Eliminazione</h3>
          <p>
            I tuoi dati vengono conservati per il tempo necessario a fornire il servizio. 
            Puoi richiedere l'eliminazione completa del tuo account e di tutti i dati associati 
            in qualsiasi momento. L'eliminazione è irreversibile e comporta la perdita permanente 
            di tutti i tuoi dati finanziari.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Servizi di Terze Parti</h2>
          <h3 className="text-xl font-medium mb-3">6.1 Servizi di Autenticazione</h3>
          <p>
            Balance integra i seguenti servizi di terze parti:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Google OAuth:</strong> Per l'autenticazione tramite account Google</li>
            <li><strong>Apple Sign-In:</strong> Per l'autenticazione tramite Apple ID</li>
            <li><strong>Better Auth:</strong> Framework di autenticazione sicura</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">6.2 Servizi di Notifica</h3>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Expo Push Notifications:</strong> Per notifiche push sull'app mobile</li>
            <li><strong>Servizi SMTP:</strong> Per l'invio di email di verifica e notifiche</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">6.3 Servizi Premium</h3>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Superwall:</strong> Per la gestione delle sottoscrizioni premium</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Proprietà Intellettuale</h2>
          <p>
            Balance, inclusi il codice sorgente, il design, i loghi, e tutti i contenuti, 
            sono protetti da diritti d'autore e altri diritti di proprietà intellettuale. 
            Non è consentito copiare, modificare, distribuire o creare opere derivate senza 
            autorizzazione scritta.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Limitazioni di Responsabilità</h2>
          <h3 className="text-xl font-medium mb-3">8.1 Disclaimer</h3>
          <p>
            Balance è fornito "così com'è" senza garanzie di alcun tipo. Non garantiamo 
            che il servizio sia sempre disponibile, privo di errori o che soddisfi 
            le tue specifiche esigenze.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">8.2 Limitazioni</h3>
          <p>
            Non saremo responsabili per:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Perdite finanziarie derivanti dall'uso dell'applicazione</li>
            <li>Interruzioni del servizio o perdite di dati</li>
            <li>Errori nei calcoli o nelle analisi finanziarie</li>
            <li>Danni indiretti, consequenziali o punitivi</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">8.3 Responsabilità dell'Utente</h3>
          <p>
            Sei responsabile dell'accuratezza dei dati inseriti e delle decisioni finanziarie 
            prese sulla base delle informazioni fornite dall'applicazione. Balance è uno 
            strumento di supporto e non sostituisce la consulenza finanziaria professionale.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Modifiche ai Termini</h2>
          <p>
            Ci riserviamo il diritto di modificare questi Termini di Servizio in qualsiasi 
            momento. Le modifiche saranno notificate tramite l'applicazione o via email. 
            L'uso continuato del servizio dopo le modifiche costituisce accettazione 
            dei nuovi termini.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Sospensione e Terminazione</h2>
          <h3 className="text-xl font-medium mb-3">10.1 Terminazione da Parte dell'Utente</h3>
          <p>
            Puoi terminare il tuo account in qualsiasi momento eliminandolo dalle 
            impostazioni dell'applicazione. La terminazione comporta l'eliminazione 
            permanente di tutti i tuoi dati.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">10.2 Terminazione da Parte Nostra</h3>
          <p>
            Possiamo sospendere o terminare il tuo account in caso di:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Violazione dei presenti Termini di Servizio</li>
            <li>Uso improprio o fraudolento del servizio</li>
            <li>Attività illegali o dannose</li>
            <li>Inattività prolungata dell'account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Legge Applicabile e Controversie</h2>
          <p>
            Questi Termini di Servizio sono regolati dalla legge italiana. 
            Qualsiasi controversia sarà sottoposta alla giurisdizione esclusiva 
            dei tribunali italiani competenti.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contatti</h2>
          <p>
            Per domande sui presenti Termini di Servizio o per segnalazioni, 
            puoi contattarci tramite:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Email: support@balance-app.com</li>
            <li>Attraverso le impostazioni dell'applicazione</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Disposizioni Finali</h2>
          <p>
            Se una parte di questi Termini dovesse essere considerata non valida 
            o inapplicabile, le restanti parti rimarranno in vigore. 
            Questi Termini costituiscono l'accordo completo tra le parti 
            riguardo l'uso di Balance.
          </p>
        </section>
      </div>
    </div>
  );
}
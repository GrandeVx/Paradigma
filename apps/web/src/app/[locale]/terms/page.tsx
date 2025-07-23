export default function TerminiServizioPage() {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 sm:py-8 md:py-12 max-w-none lg:max-w-6xl xl:max-w-7xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center">Termini di Servizio</h1>
        
        <div className="max-w-none">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">1. Accettazione dei Termini</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Benvenuto in Balance, un'applicazione di gestione finanziaria personale. 
            Utilizzando i nostri servizi, accetti integralmente i presenti Termini di Servizio 
            e la nostra Privacy Policy. Se non accetti questi termini, ti preghiamo di non 
            utilizzare l'applicazione.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">2. Descrizione del Servizio</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Balance è un'applicazione mobile e web che offre strumenti per la gestione 
            finanziaria personale, inclusi:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-4 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Gestione di conti finanziari multipli (banca, carte, contanti)</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Tracciamento di transazioni in entrata e in uscita</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Creazione e monitoraggio di budget mensili per categoria</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Definizione e tracking di obiettivi di risparmio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Visualizzazione di analytics e report finanziari</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Supporto per transazioni ricorrenti automatiche</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Notifiche personalizzabili per promemoria e aggiornamenti</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">3. Registrazione e Account</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">3.1 Requisiti di Registrazione</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Per utilizzare Balance, devi creare un account fornendo:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Un indirizzo email valido</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Un nome utente univoco</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Una password sicura (se non utilizzi l'autenticazione OAuth)</li>
          </ul>
          
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">3.2 Autenticazione</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Supportiamo diversi metodi di autenticazione:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Email e password tradizionali</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Autenticazione OAuth tramite Google</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Autenticazione OAuth tramite Apple Sign-In</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Verifica tramite codice OTP inviato via email</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Autenticazione biometrica (Face ID/Touch ID) per l'app mobile</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">3.3 Sicurezza dell'Account</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Ti impegni a:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Mantenere riservate le tue credenziali di accesso</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Notificarci immediatamente qualsiasi uso non autorizzato</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Utilizzare password sicure e aggiornarle regolarmente</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Non condividere il tuo account con terze parti</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">4. Utilizzo del Servizio</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">4.1 Uso Consentito</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Puoi utilizzare Balance esclusivamente per:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Gestire le tue finanze personali</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Tracciare le tue transazioni e budget</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Monitorare i tuoi obiettivi di risparmio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Generare report e analytics personali</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">4.2 Uso Vietato</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            È espressamente vietato:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Utilizzare l'applicazione per attività illegali</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Tentare di accedere ai dati di altri utenti</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Interferire con il funzionamento del servizio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Utilizzare bot o script automatici</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Violare i diritti di proprietà intellettuale</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Trasmettere virus o codice dannoso</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">5. Dati e Privacy</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">5.1 Dati Trattati</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Balance raccoglie e tratta i seguenti tipi di dati:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Dati di identificazione:</strong> Nome, email, username, avatar</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Dati finanziari:</strong> Transazioni, conti, budget, obiettivi di risparmio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Dati di autenticazione:</strong> Credenziali, token OAuth, sessioni</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Dati di configurazione:</strong> Preferenze linguistiche, impostazioni notifiche</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Dati tecnici:</strong> Indirizzo IP, user agent, timestamp di accesso</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">5.2 Sicurezza dei Dati</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Implementiamo misure di sicurezza avanzate:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Crittografia dei dati in transito tramite HTTPS</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Isolamento dei dati per utente nel database</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Autenticazione biometrica per l'app mobile</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Gestione sicura delle sessioni con scadenza automatica</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Backup crittografati dei dati</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Monitoraggio degli accessi e logging delle operazioni</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">5.3 Conservazione e Eliminazione</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            I tuoi dati vengono conservati per il tempo necessario a fornire il servizio. 
            Puoi richiedere l'eliminazione completa del tuo account e di tutti i dati associati 
            in qualsiasi momento. L'eliminazione è irreversibile e comporta la perdita permanente 
            di tutti i tuoi dati finanziari.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">6. Servizi di Terze Parti</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">6.1 Servizi di Autenticazione</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Balance integra i seguenti servizi di terze parti:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Google OAuth:</strong> Per l'autenticazione tramite account Google</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Apple Sign-In:</strong> Per l'autenticazione tramite Apple ID</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Better Auth:</strong> Framework di autenticazione sicura</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">6.2 Servizi di Notifica</h3>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Expo Push Notifications:</strong> Per notifiche push sull'app mobile</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Servizi SMTP:</strong> Per l'invio di email di verifica e notifiche</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">6.3 Servizi Premium</h3>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed"><strong>Superwall:</strong> Per la gestione delle sottoscrizioni premium</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">7. Proprietà Intellettuale</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Balance, inclusi il codice sorgente, il design, i loghi, e tutti i contenuti, 
            sono protetti da diritti d'autore e altri diritti di proprietà intellettuale. 
            Non è consentito copiare, modificare, distribuire o creare opere derivate senza 
            autorizzazione scritta.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">8. Limitazioni di Responsabilità</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">8.1 Disclaimer</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Balance è fornito "così com'è" senza garanzie di alcun tipo. Non garantiamo 
            che il servizio sia sempre disponibile, privo di errori o che soddisfi 
            le tue specifiche esigenze.
          </p>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">8.2 Limitazioni</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Non saremo responsabili per:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Perdite finanziarie derivanti dall'uso dell'applicazione</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Interruzioni del servizio o perdite di dati</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Errori nei calcoli o nelle analisi finanziarie</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Danni indiretti, consequenziali o punitivi</li>
          </ul>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">8.3 Responsabilità dell'Utente</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Sei responsabile dell'accuratezza dei dati inseriti e delle decisioni finanziarie 
            prese sulla base delle informazioni fornite dall'applicazione. Balance è uno 
            strumento di supporto e non sostituisce la consulenza finanziaria professionale.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">9. Modifiche ai Termini</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Ci riserviamo il diritto di modificare questi Termini di Servizio in qualsiasi 
            momento. Le modifiche saranno notificate tramite l'applicazione o via email. 
            L'uso continuato del servizio dopo le modifiche costituisce accettazione 
            dei nuovi termini.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">10. Sospensione e Terminazione</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4">10.1 Terminazione da Parte dell'Utente</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Puoi terminare il tuo account in qualsiasi momento eliminandolo dalle 
            impostazioni dell'applicazione. La terminazione comporta l'eliminazione 
            permanente di tutti i tuoi dati.
          </p>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 mt-6">10.2 Terminazione da Parte Nostra</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Possiamo sospendere o terminare il tuo account in caso di:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Violazione dei presenti Termini di Servizio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Uso improprio o fraudolento del servizio</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Attività illegali o dannose</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Inattività prolungata dell'account</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">11. Legge Applicabile e Controversie</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Questi Termini di Servizio sono regolati dalla legge italiana. 
            Qualsiasi controversia sarà sottoposta alla giurisdizione esclusiva 
            dei tribunali italiani competenti.
          </p>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">12. Contatti</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4">
            Per domande sui presenti Termini di Servizio o per segnalazioni, 
            puoi contattarci tramite:
          </p>
          <ul className="list-disc pl-4 sm:pl-6 md:pl-8 mt-2 space-y-2">
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Email: support@balance-app.com</li>
            <li className="text-sm sm:text-base md:text-lg leading-relaxed">Attraverso le impostazioni dell'applicazione</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">13. Disposizioni Finali</h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Se una parte di questi Termini dovesse essere considerata non valida 
            o inapplicabile, le restanti parti rimarranno in vigore. 
            Questi Termini costituiscono l'accordo completo tra le parti 
            riguardo l'uso di Balance.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
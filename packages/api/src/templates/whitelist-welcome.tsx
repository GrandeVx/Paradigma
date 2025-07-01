import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface WhitelistWelcomeEmailProps {
  userEmail: string;
}

export const WhitelistWelcomeEmail = ({
  userEmail = "esempio@email.com",
}: WhitelistWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Benvenuto in Balance - La tua iscrizione è stata confermata
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header con Logo */}
        <Section style={logoContainer}>
          <div style={logoWrapper}>
            <div style={logoBox}></div>
            <div style={logoText}>balance</div>
          </div>
          <div style={logoLine}></div>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>
            🎉 Benvenuto in Balance!
          </Heading>

          <Text style={text}>
            Ciao! Siamo entusiasti di averti nella nostra lista d'attesa.
          </Text>

          <Text style={text}>
            La tua email <strong style={emailHighlight}>{userEmail}</strong> è stata aggiunta con successo alla whitelist di Balance.
          </Text>

          <div style={featureBox}>
            <Text style={featureTitle}>
              Cosa ti aspetta con Balance:
            </Text>
            <ul style={featureList}>
              <li style={featureItem}>📊 Gestione intelligente del budget</li>
              <li style={featureItem}>💰 Tracking delle spese in tempo reale</li>
              <li style={featureItem}>🎯 Obiettivi di risparmio personalizzati</li>
              <li style={featureItem}>📱 App intuitiva e moderna</li>
            </ul>
          </div>

          <Hr style={hr} />

          <Text style={text}>
            Ti invieremo una notifica non appena Balance sarà disponibile su App Store e Play Store.
          </Text>

          <Text style={footerText}>
            Grazie per aver scelto Balance per gestire le tue finanze! 💙
          </Text>

          <Text style={signature}>
            Il Team Balance
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerCopyright}>
            © 2024 Balance. Tutti i diritti riservati.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WhitelistWelcomeEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoWrapper = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
};

const logoBox = {
  width: "32px",
  height: "32px",
  backgroundColor: "#000000",
  borderRadius: "6px",
  marginRight: "12px",
  position: "relative" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "400",
  color: "#000000",
  letterSpacing: "0.02em",
};

const logoLine = {
  width: "200px",
  height: "1px",
  background: "linear-gradient(90deg, transparent 0%, #0673FF 50%, transparent 100%)",
  margin: "0 auto",
};

const content = {
  padding: "0 32px",
};

const h1 = {
  color: "#0E295D",
  fontSize: "32px",
  fontWeight: "500",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #0E295D 0%, #0673FF 50%, #0E295D 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const emailHighlight = {
  color: "#0673FF",
  fontWeight: "600",
};

const featureBox = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const featureTitle = {
  color: "#0E295D",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const featureList = {
  margin: "0",
  padding: "0",
  listStyle: "none",
};

const featureItem = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 8px 0",
  paddingLeft: "0",
};

const hr = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const footerText = {
  color: "#6B7280",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0 16px 0",
  textAlign: "center" as const,
};

const signature = {
  color: "#0673FF",
  fontSize: "16px",
  fontWeight: "600",
  margin: "16px 0 32px 0",
  textAlign: "center" as const,
};

const footer = {
  borderTop: "1px solid #E5E7EB",
  paddingTop: "24px",
  textAlign: "center" as const,
};

const footerCopyright = {
  color: "#9CA3AF",
  fontSize: "14px",
  margin: "0",
}; 
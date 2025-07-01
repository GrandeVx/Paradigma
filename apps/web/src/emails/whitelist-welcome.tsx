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
import * as React from "react";

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
          <svg xmlns="http://www.w3.org/2000/svg" width="393" height="22" fill="none" viewBox="0 0 393 22">
            <path fill="url(#a)" d="M0 11.914h393v2.149H0z" />
            <path fill="#fff" d="M234.743 21.176c-4.483 0-7.624-3.347-7.624-8.046s3.08-8.046 7.411-8.046c4.849 0 7.654 4.177 7.227 9.06h-11.222c.396 2.334 2.043 3.9 4.239 3.9 1.738 0 3.141-.983 3.507-2.426l3.263 1.167c-.793 2.61-3.507 4.391-6.801 4.391Zm-4.178-9.428h7.838c-.305-2.15-1.891-3.593-3.873-3.593-2.013 0-3.538 1.443-3.965 3.593Zm-10.685 9.428c-4.356 0-7.442-3.347-7.442-8.015 0-4.73 3.056-8.077 7.381-8.077 3.509 0 6.322 2.273 6.776 5.466l-3.146.983c-.302-1.996-1.785-3.378-3.66-3.378-2.359 0-3.993 2.088-3.993 4.944 0 2.887 1.694 4.914 4.084 4.914 1.966 0 3.478-1.382 3.69-3.532l3.267 1.045c-.545 3.408-3.418 5.65-6.957 5.65Zm-22.122-.282V5.454h2.582l.492 2.533c.83-1.73 2.767-2.903 4.98-2.903 3.382 0 5.78 2.686 5.78 6.361v9.449h-3.228V11.97c0-2.162-1.414-3.705-3.474-3.705-2.244 0-3.904 1.76-3.904 4.23v8.399h-3.228Zm-8.775.282c-3.023 0-5.059-1.812-5.059-4.483 0-2.058 1.604-3.778 4.041-4.239l4.874-.952c.462-.06.771-.399.771-.798 0-1.566-1.141-2.703-2.745-2.703-1.666 0-2.962 1.167-3.085 2.918l-3.332-.799c.494-2.948 3.085-5.036 6.262-5.036 3.579 0 6.139 2.395 6.139 5.712v6.94l.062 3.072h-2.561l-.555-2.088c-.956 1.504-2.715 2.456-4.812 2.456Zm-1.573-4.913c0 1.105.894 1.842 2.375 1.842 2.159 0 3.825-1.566 3.825-3.87v-.706c-.309.062-.648.154-.987.215l-3.363.615c-1.141.214-1.85.952-1.85 1.904Zm-7.156 4.629V0h3.105v20.892h-3.105Zm-8.775.284c-3.023 0-5.059-1.812-5.059-4.483 0-2.058 1.604-3.778 4.041-4.239l4.874-.952c.463-.06.771-.399.771-.798 0-1.566-1.141-2.703-2.745-2.703-1.666 0-2.962 1.167-3.085 2.918l-3.332-.799c.494-2.948 3.085-5.036 6.262-5.036 3.579 0 6.139 2.395 6.139 5.712v6.94l.062 3.072h-2.561l-.555-2.088c-.956 1.504-2.714 2.456-4.812 2.456Zm-1.573-4.913c0 1.105.894 1.842 2.375 1.842 2.159 0 3.825-1.566 3.825-3.87v-.706c-.308.062-.648.154-.987.215l-3.362.615c-1.142.214-1.851.952-1.851 1.904Zm-10.625 4.911c-2.205 0-4.072-1.01-5.266-2.723l-.52 2.356h-2.602V0h3.214v7.68c1.224-1.59 3.031-2.54 5.174-2.54 3.979 0 6.857 3.305 6.857 7.956 0 4.712-2.878 8.078-6.857 8.078Zm-.827-3.151c2.541 0 4.347-2.05 4.347-4.866 0-2.876-1.806-4.926-4.347-4.926-2.571 0-4.378 2.05-4.378 4.926 0 2.815 1.807 4.866 4.378 4.866Z" />
            <path fill="url(#b)" d="M158.735 11.977v2.148H0v-2.148h158.735Z" />
            <defs>
              <linearGradient id="a" x1="0" x2="393" y1="12.989" y2="12.989" gradientUnits="userSpaceOnUse">
                <stop />
                <stop offset=".25" stop-color="#0E295D" />
                <stop offset=".5" stop-color="#0673FF" />
                <stop offset=".75" stop-color="#0E295D" />
                <stop offset="1" />
              </linearGradient>
              <linearGradient id="b" x1="0" x2="393" y1="13.051" y2="13.051" gradientUnits="userSpaceOnUse">
                <stop />
                <stop offset=".25" stop-color="#0E295D" />
                <stop offset=".5" stop-color="#0673FF" />
                <stop offset=".75" stop-color="#0E295D" />
                <stop offset="1" />
              </linearGradient>
            </defs>
          </svg>

        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>
            Benvenuto in Balance!
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
            © 2025 Balance. Tutti i diritti riservati.
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
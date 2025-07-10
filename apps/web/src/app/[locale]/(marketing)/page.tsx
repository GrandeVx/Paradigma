"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useToast } from "@/components/ui/use-toast";
import AnimatedBudgetComponent from "@/components/landing/Animated Budget Tracker Component";
import AnimatedNumberRevealComponent from "@/components/landing/Animated Number Reveal Component";
import SavingsAnimation from "@/components/landing/SavingsAnimation";



// Funzione per gestire il controllo dell'hash URL lato client
function ClientHashCheck() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const hash = window.location.hash;
            if (hash && hash.includes("access_token")) {
              window.location.href = "/auth/email-confirmed";
            }
          })();
        `,
      }}
    />
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);


  // Whitelist mutation
  const addToWhitelistMutation = api.util.addToWhitelist.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "🎉 Iscrizione Completata!",
        description: "Controlla la tua casella di posta per l'email di conferma.",
        className: "bg-white border-primary-600 text-black shadow-2xl z-[9999]",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'iscrizione.",
        variant: "destructive",
        className: "bg-red-100 border-red-500 text-red-900 shadow-2xl z-[9999]",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    addToWhitelistMutation.mutate({ email });
  };

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Effect to try to play video on mobile
  useEffect(() => {
    const tryToPlayVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.log('Video autoplay failed:', error);
        }
      }
    };

    // Try to play video when component mounts
    tryToPlayVideo();

    // Also try on first user interaction
    const handleFirstTouch = () => {
      tryToPlayVideo();
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };

    document.addEventListener('touchstart', handleFirstTouch);
    document.addEventListener('click', handleFirstTouch);

    return () => {
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  return (
    <main className="h-screen w-full relative overflow-hidden bg-white">
      {/* Componente client per controllare l'hash URL */}
      <ClientHashCheck />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="hidden md:block w-full h-full bg-cover bg-center bg-black"
          style={{
            backgroundImage: 'url(./background.png)',
          }}
        />
      </div>

      <div className="absolute inset-0 z-0">
        {/* Mobile Background Video with Fallback */}
        <div className="block md:hidden w-full h-full">
          {/* Video */}
          <video
            ref={videoRef}
            src="/background.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center"
            style={{ backgroundColor: 'transparent' }}
            onError={() => {
              console.log('Video failed to load');
            }}
            onCanPlay={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.log('Video play failed:', e));
              }
            }}
          />

          {/* Fallback background image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-black -z-10"
            style={{
              backgroundImage: 'url(/background.png)',
            }}
          />
        </div>
      </div>

      {/* Header con Logo */}
      <header className="relative z-10 w-full py-12 max-w-screen-4xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="items-center h-full hidden md:flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="69" fill="none" viewBox="0 0 1280 69">
              <path fill="url(#a)" d="M0 38.799h1280v7H0z" />
              <path fill="#fff" d="M764.559 68.965c-14.601 0-24.831-10.902-24.831-26.206s10.031-26.206 24.136-26.206c15.792 0 24.93 13.603 23.54 29.507h-36.552c1.291 7.602 6.655 12.703 13.806 12.703 5.662 0 10.231-3.2 11.423-7.902l10.627 3.8c-2.582 8.503-11.422 14.304-22.149 14.304Zm-13.608-30.707h25.527c-.993-7.002-6.158-11.703-12.614-11.703-6.556 0-11.522 4.701-12.913 11.703Zm-34.803 30.707c-14.187 0-24.236-10.902-24.236-26.106 0-15.404 9.951-26.306 24.039-26.306 11.428 0 20.591 7.401 22.068 17.804l-10.246 3.2c-.985-6.5-5.812-11.002-11.921-11.002-7.684 0-13.004 6.802-13.004 16.104 0 9.402 5.517 16.004 13.3 16.004 6.404 0 11.33-4.501 12.019-11.503l10.641 3.401c-1.774 11.103-11.133 18.404-22.66 18.404Zm-72.051-.919V17.76h8.41l1.602 8.247c2.704-5.633 9.012-9.454 16.221-9.454 11.013 0 18.823 8.75 18.823 20.718v30.775H678.64V38.98c0-7.04-4.606-12.068-11.314-12.068-7.309 0-12.716 5.732-12.716 13.778v27.356h-10.513Zm-28.58.919c-9.846 0-16.477-5.901-16.477-14.603 0-6.702 5.224-12.303 13.162-13.803l15.874-3.101c1.507-.2 2.512-1.3 2.512-2.6 0-5.102-3.718-8.803-8.942-8.803-5.426 0-9.645 3.801-10.047 9.502l-10.851-2.6c1.608-9.603 10.047-16.404 20.395-16.404 11.655 0 19.994 7.802 19.994 18.604v22.606l.201 10.002h-8.339l-1.809-6.801c-3.114 4.9-8.841 8.001-15.673 8.001Zm-5.124-16.004c0 3.601 2.914 6.002 7.736 6.002 7.033 0 12.459-5.101 12.459-12.603v-2.3c-1.005.2-2.11.5-3.215.7l-10.952 2c-3.717.7-6.028 3.1-6.028 6.202Zm-23.306 15.083V0h10.115v68.044h-10.115Zm-28.58.921c-9.846 0-16.477-5.901-16.477-14.603 0-6.702 5.225-12.303 13.162-13.803l15.874-3.101c1.507-.2 2.512-1.3 2.512-2.6 0-5.102-3.717-8.803-8.942-8.803-5.425 0-9.645 3.801-10.047 9.502l-10.851-2.6c1.608-9.603 10.047-16.404 20.396-16.404 11.654 0 19.993 7.802 19.993 18.604v22.606l.201 10.002h-8.339l-1.808-6.801c-3.115 4.9-8.842 8.001-15.674 8.001Zm-5.124-16.004c0 3.601 2.914 6.002 7.737 6.002 7.033 0 12.458-5.101 12.458-12.603v-2.3c-1.005.2-2.11.5-3.215.7l-10.951 2c-3.718.7-6.029 3.1-6.029 6.202Zm-34.606 16.003c-7.179 0-13.261-3.289-17.15-8.87l-1.695 7.674h-8.475V0h10.469v25.014c3.989-5.182 9.871-8.271 16.851-8.271 12.962 0 22.334 10.763 22.334 25.911 0 15.347-9.372 26.31-22.334 26.31Zm-2.692-10.265c8.275 0 14.158-6.677 14.158-15.846 0-9.368-5.883-16.045-14.158-16.045-8.376 0-14.258 6.677-14.258 16.045 0 9.169 5.882 15.846 14.258 15.846Z" />
              <path fill="url(#b)" d="M517 39v7H0v-7h517Z" />
              <defs>
                <linearGradient id="a" x1="0" x2="1280" y1="42.299" y2="42.299" gradientUnits="userSpaceOnUse">
                  <stop />
                  <stop offset=".25" stop-color="#0E295D" />
                  <stop offset=".5" stop-color="#0673FF" />
                  <stop offset=".75" stop-color="#0E295D" />
                  <stop offset="1" />
                </linearGradient>
                <linearGradient id="b" x1="0" x2="1280" y1="42.5" y2="42.5" gradientUnits="userSpaceOnUse">
                  <stop />
                  <stop offset=".25" stop-color="#0E295D" />
                  <stop offset=".5" stop-color="#0673FF" />
                  <stop offset=".75" stop-color="#0E295D" />
                  <stop offset="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-center h-full md:hidden">
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

          </div>
        </div>
      </header>

      {/* Components Container with Absolute Positioning */}
      <div className="relative z-10 w-full h-screen max-w-screen-2xl mx-auto">

        {/* Budget Tracker Component - Top Left */}
        <div className="absolute md:-top-64 rotate-6 md:-rotate-6 left-8 md:left-16 lg:-left-8 hidden lg:block">
          <div className="relative z-10">
            <AnimatedBudgetComponent />
          </div>
        </div>

        {/* Number Reveal Component - Top Right with Background Effects */}
        <div className="absolute top-[14vh] md:-top-52 right-8 md:right-16 lg:right-2 -rotate-6 ">
          <div className="relative z-10">
            <AnimatedNumberRevealComponent />
          </div>
        </div>

        {/* Savings Component - Bottom Center */}
        <div className="absolute bottom-40 rotate-3 left-1/2 transform -translate-x-1/2 hidden lg:block z-10">
          <div className="relative z-10">
            <SavingsAnimation />
          </div>
        </div>


        {/* Call to Action Section - Bottom Center */}
        <div className="absolute top-1/4 md:top-1/3 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-full max-w-lg px-4 md:px-0 z-40">

          {/* Main Heading */}
          <div className="space-y-4 mb-8 text-center">
            <h1
              className="text-5xl  lg:text-6xl font-normal tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #0E295D 0%, #0673FF 50%, #0E295D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'normal',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              Ci siamo quasi
            </h1>
            <p className="text-grey-400 text-base md:text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Ti invieremo una email quando balance sarà disponibile <br className="hidden md:block" />
              su App Store e Play Store. Manca poco 👀
            </p>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Container */}
                <div
                  className="relative p-4 rounded-2xl backdrop-blur-md border border-white/20"
                  style={{
                    background: 'rgba(249, 250, 251, 0.1)',
                  }}
                >

                  <Input
                    id="email"
                    type="email"
                    placeholder="La tua email più usata"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-white bg-transparent border-none h-6 md:h-8 text-center  text-lg placeholder:text-grey-400 focus:ring-0 focus:outline-none"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700  h-12 md:h-16 text-white border border-primary-600 rounded-2xl py-3 px-6 text-lg font-medium transition-all duration-200"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                  disabled={!isValidEmail || addToWhitelistMutation.isLoading}
                >
                  {addToWhitelistMutation.isLoading
                    ? "Aggiungendo..."
                    : "Resta aggiornato"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                {/* Success Icon & Message */}
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-success-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <p
                    className="text-grey-300 text-lg"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Ti contatteremo non appena l'app sarà disponibile.<br />
                    <span className="text-sm text-grey-400 mt-2 block">
                      Controlla la tua casella di posta per l'email di conferma.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

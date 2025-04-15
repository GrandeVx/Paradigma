// Define the structure of our translations
export interface TranslationType {
  common: {
    welcome: string;
    home: string;
    about: string;
    login: string;
    signup: string;
  };
  auth: {
    loginTitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    forgotPassword: string;
    noAccount: string;
    createAccount: string;
    emailRequired: string;
    passwordRequired: string;
    invalidEmail: string;
    loginError: string;
  };
}

export const en: TranslationType = {
  common: {
    welcome: "Welcome",
    home: "Home",
    about: "About",
    login: "Login",
    signup: "Sign Up",
  },
  auth: {
    loginTitle: "Login to your account",
    emailLabel: "Email address",
    passwordLabel: "Password",
    loginButton: "Sign in",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    createAccount: "Create an account",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    invalidEmail: "Invalid email address",
    loginError: "Login failed. Please check your credentials.",
  },
};

export type Translations = typeof en;

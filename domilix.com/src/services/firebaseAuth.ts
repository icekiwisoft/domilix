'use client';

type FirebaseApp = {
  apps: unknown[];
  initializeApp: (config: Record<string, string>) => unknown;
  auth: FirebaseAuthFactory;
};

type FirebaseAuth = {
  signInWithPopup: (provider: unknown) => Promise<FirebaseCredential>;
};

type FirebaseAuthFactory = {
  (): FirebaseAuth;
  GoogleAuthProvider: new () => unknown;
};

type FirebaseCredential = {
  user: {
    getIdToken: () => Promise<string>;
  };
};

declare global {
  interface Window {
    firebase?: FirebaseApp;
  }
}

const FIREBASE_APP_SCRIPT =
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';
const FIREBASE_AUTH_SCRIPT =
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js';

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossible de charger Firebase.'));
    document.head.appendChild(script);
  });

const firebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error('Configuration Firebase incomplete.');
  }

  return Object.fromEntries(
    Object.entries(config).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
};

const ensureFirebase = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth doit etre lance dans le navigateur.');
  }

  await loadScript(FIREBASE_APP_SCRIPT);
  await loadScript(FIREBASE_AUTH_SCRIPT);

  if (!window.firebase) {
    throw new Error('Firebase Auth indisponible.');
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig());
  }

  return window.firebase;
};

export const signInWithGoogleFirebase = async () => {
  const firebase = await ensureFirebase();
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  return result.user.getIdToken();
};

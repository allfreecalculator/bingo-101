import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const googleProvider = new GoogleAuthProvider();


export type { FirebaseUser };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Registers a new custom username & password account in Firestore
 */
export async function registerCasinoAccount(username: string, password: string, initialProfile: any) {
  const path = `casino_accounts/${username.toLowerCase().trim()}`;
  try {
    const accountRef = doc(db, 'casino_accounts', username.toLowerCase().trim());
    let docSnap;
    try {
      docSnap = await getDoc(accountRef);
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.GET, path);
      }
      throw err;
    }
    
    if (docSnap.exists()) {
      throw new Error('Username is already taken. Choose another legendary alias!');
    }
    
    const accountData = {
      username: username.trim(),
      password: password,
      profile: {
        ...initialProfile,
        name: username.trim(),
      },
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(accountRef, accountData);
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
      throw err;
    }
    return accountData.profile;
  } catch (error: any) {
    console.error('Error registering casino account:', error);
    throw error;
  }
}

/**
 * Logs in with custom username & password from Firestore
 */
export async function loginCasinoAccount(username: string, password: string) {
  const path = `casino_accounts/${username.toLowerCase().trim()}`;
  try {
    const accountRef = doc(db, 'casino_accounts', username.toLowerCase().trim());
    let docSnap;
    try {
      docSnap = await getDoc(accountRef);
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.GET, path);
      }
      throw err;
    }
    
    if (!docSnap.exists()) {
      throw new Error('Username not found. Register this account first!');
    }
    
    const data = docSnap.data();
    if (data.password !== password) {
      throw new Error('Incorrect password. Access denied.');
    }
    
    return data.profile;
  } catch (error: any) {
    console.error('Error logging in casino account:', error);
    throw error;
  }
}

/**
 * Saves current profile back to the custom casino account
 */
export async function saveCasinoAccountProfile(username: string, profileData: any) {
  const path = `casino_accounts/${username.toLowerCase().trim()}`;
  try {
    const accountRef = doc(db, 'casino_accounts', username.toLowerCase().trim());
    await setDoc(accountRef, {
      profile: {
        chips: profileData.chips,
        xp: profileData.xp,
        level: profileData.level,
        name: profileData.name,
        avatar: profileData.avatar,
        stats: profileData.stats,
        dailyTasks: profileData.dailyTasks || [],
        lastDailyReset: profileData.lastDailyReset || ''
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error: any) {
    if (error.message?.includes('permission') || error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error('Error saving casino account profile:', error);
  }
}

/**
 * Loads custom account profile only
 */
export async function loadCasinoAccountProfileOnly(username: string) {
  const path = `casino_accounts/${username.toLowerCase().trim()}`;
  try {
    const accountRef = doc(db, 'casino_accounts', username.toLowerCase().trim());
    const docSnap = await getDoc(accountRef);
    if (docSnap.exists()) {
      return docSnap.data().profile;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes('permission') || error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.error('Error loading casino account profile:', error);
    return null;
  }
}

/**
 * Saves or updates player profile in Firestore
 * @param userId - Unique user ID
 * @param profileData - The player profile object to save
 */
export async function savePlayerProfile(userId: string, profileData: any) {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      chips: profileData.chips,
      xp: profileData.xp,
      level: profileData.level,
      name: profileData.name,
      avatar: profileData.avatar,
      stats: profileData.stats,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error: any) {
    if (error.message?.includes('permission') || error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error('Error saving player profile to Firestore:', error);
    throw error;
  }
}

/**
 * Loads player profile from Firestore
 * @param userId - Unique user ID
 */
export async function loadPlayerProfile(userId: string) {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes('permission') || error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.error('Error loading player profile from Firestore:', error);
    throw error;
  }
}

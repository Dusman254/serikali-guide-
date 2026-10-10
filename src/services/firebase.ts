import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  CategoryInfo,
  ClientAccount,
  MpesaTransaction,
  Offer,
  Order,
  Product,
  SiteSettings,
} from '../types/store';
import { BLOG_POSTS, BlogPost, ServiceCategory } from '../data/serikaliData';
import {
  ManagedServiceItem,
  NewsletterSubscriber,
  ServiceRequestSubmission,
} from '../types/serviceApplication';

// Serikali Guide Firebase configuration (Can be overridden via VITE_FIREBASE_* env vars)
export const firebaseConfig = {
  apiKey:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_API_KEY) ||
    'AIzaSyDIwfvGzc18vxAJIB_kcxsDiNWwnh1Sj-w',
  authDomain:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
    'tech-sokoni.firebaseapp.com',
  projectId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
    'tech-sokoni',
  storageBucket:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
    'tech-sokoni.firebasestorage.app',
  messagingSenderId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    '767706157093',
  appId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_APP_ID) ||
    '1:767706157093:web:925e029f36812380bdefcc',
  measurementId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
    'G-42LQWWN2YY',
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Safely initialize Firebase Analytics in browser environments ONLY after user consent
export let analytics: ReturnType<typeof getAnalytics> | null = null;

function tryInitAnalytics() {
  if (typeof window === 'undefined') return;
  try {
    const consent = localStorage.getItem('serikali_cookie_consent_v1');
    if (consent === 'all' && !analytics) {
      isAnalyticsSupported()
        .then((supported) => {
          if (supported) {
            analytics = getAnalytics(app);
          }
        })
        .catch(() => {
          // Analytics blocked or unsupported
        });
    }
  } catch {
    // LocalStorage or environment blocked
  }
}

if (typeof window !== 'undefined') {
  tryInitAnalytics();
  window.addEventListener('cookieConsentChanged', (e: any) => {
    if (e.detail === 'all') {
      tryInitAnalytics();
    }
  });
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Tracks whether the external `tech-sokoni` Firestore rules currently allow read/write for the current auth session
let firestoreReadAllowed = false;
let firestoreWriteAllowed = false;

export function isFirestoreSyncAvailable(): boolean {
  return firestoreReadAllowed;
}

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

export let lastFirestoreErrorInfo: FirestoreErrorInfo | null = null;

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  rethrow = false
): FirestoreErrorInfo {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  lastFirestoreErrorInfo = errInfo;

  // If external Firebase Console security rules reject access for the current auth state,
  // disable further background writes/listeners until auth state changes so the app remains error-free.
  if (
    message.includes('Missing or insufficient permissions') ||
    message.includes('permission-denied')
  ) {
    if (
      operationType === OperationType.WRITE ||
      operationType === OperationType.CREATE ||
      operationType === OperationType.UPDATE ||
      operationType === OperationType.DELETE
    ) {
      firestoreWriteAllowed = false;
    } else {
      firestoreReadAllowed = false;
      firestoreWriteAllowed = false;
    }
  }

  if (rethrow) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo;
}

/**
 * Recursively strips `undefined` fields so Firestore setDoc/updateDoc never fails on optional properties.
 */
export function sanitizeForFirestore<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return input;
}

/**
 * Validate Firestore connectivity and check whether current security rules allow reading.
 */
export async function probeFirestoreAccess(): Promise<{
  connected: boolean;
  canRead: boolean;
}> {
  try {
    await getDocFromServer(doc(db, 'settings', 'storefront'));
    firestoreReadAllowed = true;
    firestoreWriteAllowed = true;
    return { connected: true, canRead: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline')) {
      firestoreReadAllowed = false;
      firestoreWriteAllowed = false;
      return { connected: false, canRead: false };
    }
    if (
      msg.includes('Missing or insufficient permissions') ||
      msg.includes('permission-denied')
    ) {
      // Server is reachable, but remote Firestore rules require authentication or rule update in Firebase Console
      firestoreReadAllowed = false;
      firestoreWriteAllowed = false;
      return { connected: true, canRead: false };
    }
    return { connected: true, canRead: false };
  }
}

/**
 * Seeds initial catalog, orders, offers, categories, settings, and demo clients to Firestore
 * if remote collections are empty and writable.
 */
export async function seedFirestoreIfEmpty(seedData: {
  products: Product[];
  orders: Order[];
  offers: Offer[];
  categories: CategoryInfo[];
  settings: SiteSettings;
  clients: ClientAccount[];
}): Promise<void> {
  if (!firestoreReadAllowed || !firestoreWriteAllowed) return;

  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      const batch = writeBatch(db);
      seedData.products.forEach((product) => {
        batch.set(doc(db, 'products', product.id), sanitizeForFirestore(product));
      });
      seedData.offers.forEach((offer) => {
        batch.set(doc(db, 'offers', offer.id), sanitizeForFirestore(offer));
      });
      seedData.categories.forEach((cat) => {
        batch.set(doc(db, 'categories', cat.id), sanitizeForFirestore(cat));
      });
      batch.set(
        doc(db, 'settings', 'storefront'),
        sanitizeForFirestore(seedData.settings)
      );
      await batch.commit();
    }

    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty && firestoreWriteAllowed) {
      const orderBatch = writeBatch(db);
      seedData.orders.forEach((order) => {
        orderBatch.set(doc(db, 'orders', order.id), sanitizeForFirestore(order));
      });
      await orderBatch.commit();
    }

    if (auth.currentUser && firestoreWriteAllowed) {
      const clientsSnap = await getDocs(collection(db, 'clients'));
      if (clientsSnap.empty) {
        const clientBatch = writeBatch(db);
        seedData.clients.forEach((client) => {
          clientBatch.set(
            doc(db, 'clients', client.id),
            sanitizeForFirestore(client)
          );
        });
        await clientBatch.commit();
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedFirestoreIfEmpty', false);
  }
}

// ============================================================================
// Firestore Persistence Helpers (Guarded by permission probe)
// ============================================================================

export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), sanitizeForFirestore(product), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function removeProductFromFirestore(productId: string): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), sanitizeForFirestore(order), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function saveMpesaTransactionToFirestore(
  tx: MpesaTransaction
): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `mpesa_transactions/${tx.id}`;
  try {
    await setDoc(
      doc(db, 'mpesa_transactions', tx.id),
      sanitizeForFirestore(tx),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function saveOfferToFirestore(offer: Offer): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `offers/${offer.id}`;
  try {
    await setDoc(doc(db, 'offers', offer.id), sanitizeForFirestore(offer), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function removeOfferFromFirestore(offerId: string): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `offers/${offerId}`;
  try {
    await deleteDoc(doc(db, 'offers', offerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
  }
}

export async function saveCategoryToFirestore(category: CategoryInfo): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), sanitizeForFirestore(category), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function saveSettingsToFirestore(settings: SiteSettings): Promise<void> {
  if (!firestoreWriteAllowed) return;
  const path = 'settings/storefront';
  try {
    await setDoc(doc(db, 'settings', 'storefront'), sanitizeForFirestore(settings), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

export async function saveClientToFirestore(client: ClientAccount): Promise<void> {
  if (!firestoreWriteAllowed && !auth.currentUser) return;
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), sanitizeForFirestore(client), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
}

// ============================================================================
// Firebase Authentication + Client Profile Sync
// ============================================================================

export async function fetchOrCreateClientForFirebaseUser(
  fbUser: FirebaseUser,
  existingClients: ClientAccount[],
  extraProfile?: {
    name?: string;
    phone?: string;
    defaultAddress?: string;
    city?: string;
    password?: string;
  }
): Promise<ClientAccount> {
  const docId = `client-${fbUser.uid}`;
  const emailLower = (fbUser.email || '').toLowerCase();

  // Re-probe Firestore now that a Firebase user is authenticated
  const probe = await probeFirestoreAccess();

  if (probe.canRead) {
    try {
      const snap = await getDoc(doc(db, 'clients', docId));
      if (snap.exists()) {
        const remoteData = snap.data() as ClientAccount;
        const merged: ClientAccount = {
          ...remoteData,
          id: remoteData.id || docId,
          uid: fbUser.uid,
          name:
            extraProfile?.name ||
            remoteData.name ||
            fbUser.displayName ||
            'Serikali Guide Client',
          email: fbUser.email || remoteData.email,
          photoURL: fbUser.photoURL || remoteData.photoURL,
        };
        await saveClientToFirestore(merged);
        return merged;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `clients/${docId}`, false);
    }
  }

  // Check if there is an existing client by email
  const matchByEmail = existingClients.find(
    (c) => c.email.toLowerCase() === emailLower
  );

  const clientProfile: ClientAccount = {
    id: matchByEmail?.id || docId,
    uid: fbUser.uid,
    name:
      extraProfile?.name ||
      fbUser.displayName ||
      matchByEmail?.name ||
      (fbUser.email ? fbUser.email.split('@')[0] : 'Serikali Guide Client'),
    email: fbUser.email || matchByEmail?.email || '',
    phone:
      extraProfile?.phone ||
      fbUser.phoneNumber ||
      matchByEmail?.phone ||
      '+254 700 000 000',
    defaultAddress:
      extraProfile?.defaultAddress ||
      matchByEmail?.defaultAddress ||
      'Nairobi CBD / Pioneer House Desk',
    city: extraProfile?.city || matchByEmail?.city || 'Nairobi',
    authProvider: fbUser.providerData.some((p) => p.providerId === 'google.com')
      ? 'google'
      : 'password',
    photoURL: fbUser.photoURL || matchByEmail?.photoURL || undefined,
    createdAt: matchByEmail?.createdAt || new Date().toISOString(),
  };

  if (probe.canRead) {
    await saveClientToFirestore(clientProfile);
  }
  return clientProfile;
}

/**
 * Real-time Firestore synchronization for Serikali Blog Posts.
 * Acts like a WebSocket listener across all connected user sessions and devices.
 */
export function subscribeToBlogs(callback: (blogs: BlogPost[]) => void): () => void {
  try {
    const q = collection(db, 'blog_posts');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const blogs: BlogPost[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as BlogPost;
            if (data && data.id && data.title) {
              blogs.push(data);
            }
          });
          callback(blogs);
        } else {
          // If Firestore collection is empty, seed initial blogs so other sessions sync immediately
          seedBlogsToFirestore(BLOG_POSTS).catch(() => {});
          callback(BLOG_POSTS);
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot subscription notice for blog_posts:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize Firestore onSnapshot listener:', err);
    return () => {};
  }
}

export async function seedBlogsToFirestore(blogs: BlogPost[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    blogs.forEach((b) => {
      const ref = doc(db, 'blog_posts', b.id);
      batch.set(ref, sanitizeForFirestore(b), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore blog seeding notice:', err);
  }
}

export async function saveBlogToFirestore(blog: BlogPost): Promise<void> {
  try {
    const docRef = doc(db, 'blog_posts', blog.id);
    await setDoc(docRef, sanitizeForFirestore(blog), { merge: true });
  } catch (error) {
    console.warn('Firestore write for blog_post failed (local/disk store intact):', error);
  }
}

export async function removeBlogFromFirestore(blogId: string): Promise<void> {
  try {
    const docRef = doc(db, 'blog_posts', blogId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete for blog_post failed (local/disk store intact):', error);
  }
}

// ============================================================================
// Real-time Service Requests Sync
// ============================================================================

export function subscribeToServiceRequests(
  callback: (requests: ServiceRequestSubmission[]) => void
): () => void {
  try {
    const q = collection(db, 'service_requests');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ServiceRequestSubmission[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ServiceRequestSubmission;
            if (data && data.id && data.referenceNumber) {
              items.push(data);
            }
          });
          callback(items);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice for service_requests:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize Firestore onSnapshot listener for service_requests:', err);
    return () => {};
  }
}

export async function saveServiceRequestToFirestore(
  request: ServiceRequestSubmission
): Promise<void> {
  try {
    const docRef = doc(db, 'service_requests', request.id);
    await setDoc(docRef, sanitizeForFirestore(request), { merge: true });
  } catch (error) {
    console.warn('Firestore write for service_request failed (local store intact):', error);
  }
}

export async function deleteServiceRequestFromFirestore(
  requestId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'service_requests', requestId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete for service_request failed (local store intact):', error);
  }
}

// ============================================================================
// Real-time Newsletter Subscribers Sync
// ============================================================================

export function subscribeToNewsletterSubscribers(
  callback: (subscribers: NewsletterSubscriber[]) => void
): () => void {
  try {
    const q = collection(db, 'newsletter_subscribers');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: NewsletterSubscriber[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as NewsletterSubscriber;
            if (data && data.email) {
              list.push(data);
            }
          });
          callback(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice for newsletter_subscribers:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize onSnapshot listener for newsletter_subscribers:', err);
    return () => {};
  }
}

export async function saveNewsletterSubscriberToFirestore(
  subscriber: NewsletterSubscriber
): Promise<void> {
  try {
    const docRef = doc(db, 'newsletter_subscribers', subscriber.id);
    await setDoc(docRef, sanitizeForFirestore(subscriber), { merge: true });
  } catch (error) {
    console.warn('Firestore write for newsletter_subscriber failed (local store intact):', error);
  }
}

// ============================================================================
// Real-time Service Categories & Managed Services Sync
// ============================================================================

export function subscribeToServiceCategories(
  callback: (categories: ServiceCategory[]) => void
): () => void {
  try {
    const q = collection(db, 'service_categories');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ServiceCategory[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ServiceCategory;
            if (data && data.id && data.name) {
              list.push(data);
            }
          });
          callback(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice for service_categories:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function saveServiceCategoryToFirestore(
  category: ServiceCategory
): Promise<void> {
  try {
    const docRef = doc(db, 'service_categories', category.id);
    await setDoc(docRef, sanitizeForFirestore(category), { merge: true });
  } catch (error) {
    console.warn('Firestore write for service_category failed:', error);
  }
}

export async function removeServiceCategoryFromFirestore(
  categoryId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'service_categories', categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete for service_category failed:', error);
  }
}

export function subscribeToManagedServices(
  callback: (services: ManagedServiceItem[]) => void
): () => void {
  try {
    const q = collection(db, 'managed_services');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ManagedServiceItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ManagedServiceItem;
            if (data && data.id && data.name) {
              list.push(data);
            }
          });
          callback(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice for managed_services:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function saveManagedServiceToFirestore(
  service: ManagedServiceItem
): Promise<void> {
  try {
    const docRef = doc(db, 'managed_services', service.id);
    await setDoc(docRef, sanitizeForFirestore(service), { merge: true });
  } catch (error) {
    console.warn('Firestore write for managed_service failed:', error);
  }
}

export async function removeManagedServiceFromFirestore(
  serviceId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'managed_services', serviceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete for managed_service failed:', error);
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  onSnapshot,
};

import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Check if user exists in Firestore
export const checkUserExists = async (email) => {
  try {
    // In a real app, you'd query by email
    // For demo purposes, we'll return false
    return false;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Register new user
export const registerUser = async (email, password, userData) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      role: userData.role || 'manager',
      phone: userData.phone || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
      permissions: {
        canManageUsers: userData.role === 'admin',
        canManageTenants: true,
        canManageApartments: true,
        canManageRent: true,
        canViewReports: true
      }
    });

    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role || 'manager'
      }
    };
  } catch (error) {
    let errorMessage = 'Registration failed. ';
    
    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email already in use. Please use a different email.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });

    // Get user data from Firestore
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || userData?.name || 'User',
        role: userData?.role || 'manager'
      }
    };
  } catch (error) {
    let errorMessage = 'Login failed. ';
    
    switch(error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please check your email and password.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          resolve({
            uid: user.uid,
            email: user.email,
            name: user.displayName || userData?.name || 'User',
            role: userData?.role || 'manager',
            ...userData
          });
        } catch (error) {
          resolve({
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'User',
            role: 'manager'
          });
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Check authentication state
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
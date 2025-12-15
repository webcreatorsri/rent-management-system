import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Removed getDoc

const defaultUsers = [
  {
    email: 'admin@rent.com',
    password: 'Admin@123',
    name: 'System Administrator',
    role: 'admin',
    phone: '+919876543210'
  },
  {
    email: 'manager@rent.com',
    password: 'Manager@123',
    name: 'Property Manager',
    role: 'manager',
    phone: '+919876543211'
  }
];

export const initializeDefaultUsers = async () => {
  console.log('Initializing default users...');
  
  for (const userData of defaultUsers) {
    try {
      // Check if user already exists in Authentication
      try {
        // Try to sign in first (to check if user exists)
        await signInWithEmailAndPassword(auth, userData.email, userData.password);
        console.log(`User ${userData.email} already exists in auth`);
      } catch (authError) {
        // If sign in fails, create the user
        if (authError.code === 'auth/user-not-found') {
          console.log(`Creating user: ${userData.email}`);
          
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          );
          
          // Create user document in Firestore
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
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
          
          console.log(`Created user: ${userData.email} (${userData.role})`);
        }
      }
      
    } catch (error) {
      console.error(`Error with user ${userData.email}:`, error.message);
    }
  }
  
  console.log('Default users initialization completed');
};

// Initialize on app start
export const initAppUsers = () => {
  // Run initialization
  initializeDefaultUsers().catch(console.error);
};
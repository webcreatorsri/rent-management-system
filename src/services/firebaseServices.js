import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

// ========== TEST CONNECTION ==========
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to get collections count
    const collections = ['users', 'tenants', 'apartments', 'rent_records'];
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        results[collectionName] = `${querySnapshot.size} documents`;
        console.log(`${collectionName}: ${querySnapshot.size} documents`);
      } catch (error) {
        results[collectionName] = `Error: ${error.message}`;
        console.log(`${collectionName}: Error - ${error.message}`);
      }
    }
    
    return { 
      success: true, 
      message: 'Firestore connection test completed',
      results 
    };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// ========== USER SERVICES ==========
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user document
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

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login
    const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: serverTimestamp()
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'No user logged in' };

    const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'User data not found' };
    }

    const userData = querySnapshot.docs[0].data();
    return { success: true, data: { id: querySnapshot.docs[0].id, ...userData } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== TENANT SERVICES ==========
export const addTenant = async (tenantData) => {
  try {
    console.log('Adding tenant:', tenantData);
    
    const docRef = await addDoc(collection(db, 'tenants'), {
      ...tenantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update apartment status if apartment number is provided
    if (tenantData.apartmentNumber) {
      const apartmentsQuery = query(
        collection(db, 'apartments'),
        where('apartmentNumber', '==', tenantData.apartmentNumber)
      );
      const apartmentsSnapshot = await getDocs(apartmentsQuery);
      
      if (!apartmentsSnapshot.empty) {
        const apartmentDoc = apartmentsSnapshot.docs[0];
        await updateDoc(doc(db, 'apartments', apartmentDoc.id), {
          status: 'occupied',
          updatedAt: serverTimestamp()
        });
      }
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding tenant:', error);
    return { success: false, error: error.message };
  }
};

export const getTenants = async () => {
  try {
    console.log('Fetching tenants...');
    
    const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const tenants = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tenants.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null
      });
    });
    
    console.log(`Fetched ${tenants.length} tenants`);
    return { success: true, data: tenants };
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return { success: false, error: error.message };
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  try {
    await updateDoc(doc(db, 'tenants', tenantId), {
      ...tenantData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteTenant = async (tenantId) => {
  try {
    await deleteDoc(doc(db, 'tenants', tenantId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== APARTMENT SERVICES ==========
export const addApartment = async (apartmentData) => {
  try {
    console.log('Adding apartment:', apartmentData);
    
    const docRef = await addDoc(collection(db, 'apartments'), {
      ...apartmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding apartment:', error);
    return { success: false, error: error.message };
  }
};

export const getApartments = async () => {
  try {
    console.log('Fetching apartments...');
    
    const q = query(collection(db, 'apartments'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const apartments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      apartments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null
      });
    });
    
    console.log(`Fetched ${apartments.length} apartments`);
    return { success: true, data: apartments };
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return { success: false, error: error.message };
  }
};

export const updateApartment = async (apartmentId, apartmentData) => {
  try {
    await updateDoc(doc(db, 'apartments', apartmentId), {
      ...apartmentData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteApartment = async (apartmentId) => {
  try {
    await deleteDoc(doc(db, 'apartments', apartmentId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== RENT SERVICES ==========
export const addRentRecord = async (rentData) => {
  try {
    console.log('Adding rent record:', rentData);
    
    const docRef = await addDoc(collection(db, 'rent_records'), {
      ...rentData,
      createdAt: serverTimestamp(),
      paymentDate: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding rent record:', error);
    return { success: false, error: error.message };
  }
};

export const getRentRecords = async () => {
  try {
    console.log('Fetching rent records...');
    
    const q = query(collection(db, 'rent_records'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        paymentDate: data.paymentDate ? data.paymentDate.toDate() : null
      });
    });
    
    console.log(`Fetched ${records.length} rent records`);
    return { success: true, data: records };
  } catch (error) {
    console.error('Error fetching rent records:', error);
    return { success: false, error: error.message };
  }
};

export const updateRentRecord = async (recordId, rentData) => {
  try {
    await updateDoc(doc(db, 'rent_records', recordId), {
      ...rentData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteRentRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, 'rent_records', recordId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== DASHBOARD STATS ==========
export const getDashboardStats = async () => {
  try {
    const [tenantsRes, apartmentsRes, rentRes] = await Promise.all([
      getTenants(),
      getApartments(),
      getRentRecords()
    ]);

    const tenants = tenantsRes.success ? tenantsRes.data : [];
    const apartments = apartmentsRes.success ? apartmentsRes.data : [];
    const rentRecords = rentRes.success ? rentRes.data : [];

    // Calculate stats
    const totalTenants = tenants.length;
    const totalApartments = apartments.length;
    const occupiedApartments = apartments.filter(apt => apt.status === 'occupied').length;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthRent = rentRecords
      .filter(record => record.month === currentMonth)
      .reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0);
    
    // Calculate pending rent
    const tenantsWithoutCurrentRent = tenants.filter(tenant => {
      return !rentRecords.some(record => 
        record.tenantId === tenant.id && record.month === currentMonth
      );
    });
    
    const pendingRent = tenantsWithoutCurrentRent.reduce((sum, tenant) => {
      return sum + (parseFloat(tenant.rentAmount) || 0);
    }, 0);

    return {
      success: true,
      data: {
        totalTenants,
        totalApartments,
        occupiedApartments,
        vacantApartments: totalApartments - occupiedApartments,
        currentMonthRent,
        pendingRent,
        collectionRate: totalTenants > 0 ? 
          ((totalTenants - tenantsWithoutCurrentRent.length) / totalTenants * 100).toFixed(1) : 0
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
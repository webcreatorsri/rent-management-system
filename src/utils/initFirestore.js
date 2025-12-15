import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export const initializeFirestore = async () => {
  try {
    console.log('Initializing Firestore collections...');

    // Create collections if they don't exist
    const collections = ['users', 'tenants', 'apartments', 'rent_records'];
    
    for (const collectionName of collections) {
      try {
        // Try to get collection to see if it exists
        const querySnapshot = await getDocs(collection(db, collectionName));
        console.log(`${collectionName}: ${querySnapshot.size} documents exist`);
        
        // Add a test document if collection is empty
        if (querySnapshot.size === 0) {
          const testDocRef = doc(collection(db, collectionName), 'test_document');
          await setDoc(testDocRef, {
            message: 'Test document for initialization',
            createdAt: new Date().toISOString(),
            test: true
          });
          console.log(`✓ Created test document in ${collectionName}`);
          
          // Delete the test document
          await deleteDoc(testDocRef);
          console.log(`✓ Removed test document from ${collectionName}`);
        }
      } catch (error) {
        console.log(`ℹ ${collectionName}: ${error.message}`);
      }
    }

    console.log('Firestore initialization completed');
    return { success: true, message: 'Collections initialized' };
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return { success: false, error: error.message };
  }
};

// Add to your app initialization
export const initApp = async () => {
  console.log('Initializing Firebase app...');
  
  // Test Firestore connection
  try {
    await initializeFirestore();
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
  }
};
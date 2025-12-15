import React, { useState } from 'react';
import { deleteDoc } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

const TestFirebase = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    setError('');
    setSuccess('');

    const results = [];

    try {
      // Test 1: Check Firebase connection
      results.push({ test: 'Firebase Connection', status: 'Checking...' });
      setTestResults([...results]);

      // Test 2: Write to Firestore
      results.push({ test: 'Write to Firestore', status: 'Testing...' });
      setTestResults([...results]);

      const testData = {
        test: 'Firestore write test',
        timestamp: Timestamp.now(),
        randomId: Math.random().toString(36).substring(7)
      };

      const docRef = await addDoc(collection(db, 'test_collection'), testData);
      results[1] = { 
        test: 'Write to Firestore', 
        status: '✅ PASSED', 
        details: `Document ID: ${docRef.id}` 
      };
      setTestResults([...results]);

      // Test 3: Read from Firestore
      results.push({ test: 'Read from Firestore', status: 'Testing...' });
      setTestResults([...results]);

      const querySnapshot = await getDocs(collection(db, 'test_collection'));
      results[2] = { 
        test: 'Read from Firestore', 
        status: '✅ PASSED', 
        details: `Found ${querySnapshot.size} documents` 
      };
      setTestResults([...results]);

      // Test 4: Check main collections
      const collections = ['users', 'tenants', 'apartments', 'rent_records'];
      
      for (const colName of collections) {
        results.push({ test: `Check ${colName} collection`, status: 'Testing...' });
        setTestResults([...results]);

        try {
          const colSnapshot = await getDocs(collection(db, colName));
          const index = results.length - 1;
          results[index] = { 
            test: `Check ${colName} collection`, 
            status: '✅ PASSED', 
            details: `${colSnapshot.size} documents found` 
          };
          setTestResults([...results]);
        } catch (colError) {
          const index = results.length - 1;
          results[index] = { 
            test: `Check ${colName} collection`, 
            status: '⚠️ INFO', 
            details: `Collection might not exist yet: ${colError.message}` 
          };
          setTestResults([...results]);
        }
      }

      setSuccess('All tests completed successfully!');
      
    } catch (error) {
      console.error('Test failed:', error);
      setError(`Test failed: ${error.code} - ${error.message}`);
      
      const failedTest = testResults[testResults.length - 1];
      if (failedTest) {
        failedTest.status = '❌ FAILED';
        failedTest.details = error.message;
        setTestResults([...testResults]);
      }
    } finally {
      setLoading(false);
    }
  };

  const testWriteData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Test writing to tenants collection
      const tenantData = {
        name: 'Test Tenant ' + Math.random().toString(36).substring(7),
        email: `test${Math.random().toString(36).substring(7)}@test.com`,
        phone: '1234567890',
        apartmentNumber: 'TEST-101',
        rentAmount: 10000,
        moveInDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'tenants'), tenantData);
      setSuccess(`✅ Tenant added successfully! Document ID: ${docRef.id}`);

      // Verify it was saved
      const querySnapshot = await getDocs(collection(db, 'tenants'));
      console.log('Total tenants in database:', querySnapshot.size);

    } catch (error) {
      setError(`❌ Failed to save: ${error.code} - ${error.message}`);
      console.error('Write error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    try {
      // Get all test documents and delete them
      const querySnapshot = await getDocs(collection(db, 'test_collection'));
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref).catch(err => console.log('Delete error:', err))
      );
      
      await Promise.all(deletePromises);
      setSuccess('Test data cleared!');
    } catch (error) {
      setError(`Clear error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Firebase Connection Test
          </Typography>
          
          <Typography variant="body1" paragraph>
            This page will test your Firebase connection and Firestore permissions.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={runAllTests}
              disabled={loading}
              size="large"
            >
              {loading ? 'Running Tests...' : 'Run Complete Test Suite'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={testWriteData}
              disabled={loading}
            >
              Test Write to Tenants Collection
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={clearTestData}
              disabled={loading}
            >
              Clear Test Data
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography>Testing Firebase connection...</Typography>
            </Box>
          )}

          {testResults.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 3 }}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={<Typography variant="h6">Test Results</Typography>}
                  />
                </ListItem>
                <Divider />
                {testResults.map((result, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: result.status.includes('✅') ? 'success.main' : 
                                     result.status.includes('❌') ? 'error.main' : 
                                     result.status.includes('⚠️') ? 'warning.main' : 'text.primary'
                            }}
                          >
                            {result.test}
                          </Typography>
                          <Typography 
                            component="span" 
                            sx={{ ml: 2, fontWeight: 'bold' }}
                          >
                            {result.status}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        result.details && (
                          <Typography variant="body2" color="text.secondary">
                            {result.details}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔧 Troubleshooting Steps:
            </Typography>
            <List dense>
              <ListItem>
                1. Check Firebase Console → Firestore → Rules (should be: allow read, write: if true;)
              </ListItem>
              <ListItem>
                2. Verify Firebase config in firebase.js matches your project
              </ListItem>
              <ListItem>
                3. Enable Authentication → Email/Password in Firebase Console
              </ListItem>
              <ListItem>
                4. Wait 2-3 minutes after changing rules (they take time to propagate)
              </ListItem>
              <ListItem>
                5. Check browser console (F12) for detailed errors
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TestFirebase;
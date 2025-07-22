import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

const ADMIN_UID = 'yzfATZLDOmNDqLnGyzrOJwttTRi1'; // <-- Replace with your admin UID from Firebase Auth

export default function AdminPanel({ navigation }) {
  const [email, setEmail] = useState('off.sadekulislam@gmail.com');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);

  // Handle admin login with Firebase Authentication
  const handleLogin = async () => {
    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      console.log('Logged-in UID:', uid);

      // Check if logged-in user is admin
      if (uid !== ADMIN_UID) {
        Alert.alert('Access Denied', 'You are not authorized to access this admin panel.');
        await signOut(auth);
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      await loadAllDonors();
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthenticated(false);
      setEmail('off.sadekulislam@gmail.com');
      setPassword('');
      setDonors([]);
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  // Load all donors from all users (admin view)
  const loadAllDonors = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collectionGroup(db, 'donors'));
      const donorList = [];
      snapshot.forEach(doc => {
        donorList.push({ id: doc.id, ...doc.data() });
      });
      setDonors(donorList);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login screen UI
  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Panel Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Icon name="lock-open" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Admin view: list all donors
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Donors (Admin View)</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={donors}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No donors found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>Blood Group: {item.bloodGroup}</Text>
              {item.phone && <Text style={styles.detail}>Phone: {item.phone}</Text>}
              {item.lastDonation && <Text style={styles.detail}>Last Donation: {item.lastDonation}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007bff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  detail: {
    fontSize: 15,
    color: '#555',
  },
});

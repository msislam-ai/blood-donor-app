import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons'; // make sure expo/vector-icons is installed or use another icon lib

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigation.replace('DonorList');
      }
    });
    return unsubscribe;
  }, []);

  const validateForm = () => {
    let valid = true;

    if (!email) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>রক্তসৈনিক বাংলাদেশ</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, emailError ? styles.inputError : null]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          editable={!loading}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fa',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    marginTop: 6,
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007bff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 16,
  },
});

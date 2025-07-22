import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Logged in as:</Text>
      <Text style={styles.email}>{auth.currentUser?.email}</Text>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
  email: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebase';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';

const BLOOD_GROUPS = ['Select', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AddEditDonorScreen({ route, navigation }) {
  const donor = route.params?.donor;

  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Select');
  const [lastDonation, setLastDonation] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (donor) {
      setName(donor.name);
      setBloodGroup(donor.bloodGroup);
      setLastDonation(donor.lastDonation ? new Date(donor.lastDonation) : null);
      setAddress(donor.address);
      setPhone(donor.phone || '');
    }
  }, [donor]);

  const handleSave = async () => {
    if (!name.trim() || bloodGroup === 'Select' || !address.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const donorData = {
        name,
        bloodGroup,
        lastDonation: lastDonation ? lastDonation.toISOString() : null,
        address,
        phone,
      };

      if (donor) {
        const donorRef = doc(db, 'users', userId, 'donors', donor.id);
        await updateDoc(donorRef, donorData);
        Alert.alert('Success', 'Donor updated successfully.');
      } else {
        await addDoc(collection(db, 'users', userId, 'donors'), donorData);
        Alert.alert('Success', 'Donor added successfully.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{donor ? 'Edit Donor' : 'Add Donor'}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Blood Group *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={bloodGroup}
            onValueChange={setBloodGroup}
            style={styles.picker}
            dropdownIconColor="#007bff"
          >
            {BLOOD_GROUPS.map(bg => (
              <Picker.Item label={bg} value={bg} key={bg} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Donation Date</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {lastDonation ? lastDonation.toDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={lastDonation || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setLastDonation(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone (optional)</Text>
        <TextInput
          placeholder="Enter phone number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{donor ? 'Update Donor' : 'Add Donor'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60, // a little lower from top
    backgroundColor: '#f9fbfd',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 25,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 48,
    color: '#007bff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

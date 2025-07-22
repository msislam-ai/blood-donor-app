import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorListScreen({ navigation }) {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          navigation.replace('Auth');
        } else {
          setUser(currentUser);
          loadDonors(currentUser.uid);
        }
      });
      return unsubscribe;
    }, [])
  );

  const loadDonors = async (uid) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users', uid, 'donors'), orderBy('name'));
      const snapshot = await getDocs(q);
      const donorList = [];
      snapshot.forEach(doc => donorList.push({ id: doc.id, ...doc.data() }));
      setDonors(donorList);
      setFilteredDonors(donorList);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedBloodGroup === 'All') {
      setFilteredDonors(donors);
    } else {
      const filtered = donors.filter(d => d.bloodGroup === selectedBloodGroup);
      setFilteredDonors(filtered);
    }
  }, [selectedBloodGroup, donors]);

  const monthsUntilEligible = (lastDonationDate) => {
    const lastDate = new Date(lastDonationDate);
    const today = new Date();
    return (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());
  };

  const isEligible = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    return monthsUntilEligible(lastDonationDate) >= 3;
  };

  const nextEligibleDate = (lastDonationDate) => {
    const lastDate = new Date(lastDonationDate);
    lastDate.setMonth(lastDate.getMonth() + 3);
    return lastDate.toISOString().split('T')[0];
  };

  const makeCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No phone number available for this donor.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendSMS = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No phone number available for this donor.');
      return;
    }
    const message = encodeURIComponent(
      'Assalamu Alaikum, we need urgent blood donation. Can you help?'
    );
    Linking.openURL(`sms:${phoneNumber}?body=${message}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>রক্তসৈনিক  বাংলাদেশ</Text>

      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('AdminPanel')}
          activeOpacity={0.7}
        >
          <Icon name="admin-panel-settings" size={28} color="#007bff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Icon name="person" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.primaryButtonText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AddEditDonor', { donor: null })}
          activeOpacity={0.7}
        >
          <Icon name="person-add" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.primaryButtonText}>Add Donor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedBloodGroup}
          onValueChange={setSelectedBloodGroup}
          style={styles.picker}
          dropdownIconColor="#007bff"
        >
          {BLOOD_GROUPS.map(bg => <Picker.Item label={bg} value={bg} key={bg} />)}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredDonors}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No donors found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.bloodGroupBadge, { backgroundColor: getBloodGroupColor(item.bloodGroup) }]}>
                  <Text style={styles.bloodGroupText}>{item.bloodGroup}</Text>
                </View>
              </View>

              <Text style={styles.address}>Address: {item.address}</Text>
              {item.phone && <Text style={styles.phone}>Phone: {item.phone}</Text>}

              <Text
                style={[
                  styles.eligibility,
                  isEligible(item.lastDonation) ? styles.eligible : styles.notEligible,
                ]}
              >
                {item.lastDonation
                  ? (isEligible(item.lastDonation)
                    ? 'Eligible to donate'
                    : `Not eligible until ${nextEligibleDate(item.lastDonation)}`)
                  : 'Eligible to donate'}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('AddEditDonor', { donor: item })}
                  activeOpacity={0.7}
                >
                  <Icon name="edit" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                {item.phone && (
                  <>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => makeCall(item.phone)}
                      activeOpacity={0.7}
                    >
                      <Icon name="call" size={18} color="#fff" />
                      <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smsButton}
                      onPress={() => sendSMS(item.phone)}
                      activeOpacity={0.7}
                    >
                      <Icon name="sms" size={18} color="#fff" />
                      <Text style={styles.buttonText}>SMS</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function getBloodGroupColor(bg) {
  switch (bg) {
    case 'A+': return '#FF6F61';
    case 'A-': return '#FF8A65';
    case 'B+': return '#4CAF50';
    case 'B-': return '#81C784';
    case 'AB+': return '#2196F3';
    case 'AB-': return '#64B5F6';
    case 'O+': return '#9C27B0';
    case 'O-': return '#BA68C8';
    default: return '#888';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#007bff',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  picker: {
    height: 48,
    color: '#007bff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 18,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    flexShrink: 1,
  },
  bloodGroupBadge: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  bloodGroupText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  address: {
    color: '#495057',
    marginBottom: 4,
    fontSize: 16,
  },
  phone: {
    color: '#495057',
    marginBottom: 10,
    fontSize: 16,
  },
  eligibility: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 14,
  },
  eligible: {
    color: '#28a745',
  },
  notEligible: {
    color: '#dc3545',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#007bff',
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
});

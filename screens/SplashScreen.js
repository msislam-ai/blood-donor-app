import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade and scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Heartbeat pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timeout = setTimeout(() => {
      navigation.replace('Auth');
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#8B0000', '#B71C1C']}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.quote}>
          Donate blood, save lives.
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={200}
            color="#FFC107"
          />
        </Animated.View>

        <View style={styles.bottomContainer}>
          <Text style={styles.title}>রক্তসৈনিক</Text>
          <Text style={styles.subtitle}>বাংলাদেশ</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  inner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
  },
  quote: {
    fontSize: 45, // Larger quote
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 36,
    maxWidth: 320,
    fontWeight: '600',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10, // Reduced gap
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFC107',
    marginRight: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});

// src/app/(tabs)/_layout.tsx
import { useTaskStore } from '@/store/useTaskStore';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { ArrowRight, Calendar as CalendarIcon, Home, PieChart, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { userName, setUserName } = useTaskStore();
  const [nameInput, setNameInput] = useState('');

  const handleSaveName = () => {
    if (nameInput.trim().length > 0) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUserName(nameInput.trim());
    }
  };

  return (
    // 1. DESKTOP CANVAS: Centers the app and provides a dark/light desktop background
    <View 
      className="flex-1"
      style={{
        backgroundColor: isDark ? '#000000' : '#E2E8F0', 
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Platform.OS === 'web' ? 40 : 0, // Breathing room on desktop monitors
      }}
    >
      {/* 2. THE HARDWARE SIMULATOR: Locks to iPhone Pro dimensions on Web, goes 100% on Mobile */}
      <View
        className="flex-1 bg-[#F8FAFC] dark:bg-[#09090B]"
        style={{
          width: '100%',
          maxWidth: Platform.OS === 'web' ? 400 : '100%', 
          maxHeight: Platform.OS === 'web' ? 850 : '100%', 
          borderRadius: Platform.OS === 'web' ? 44 : 0, // Apple Hardware Curve
          borderWidth: Platform.OS === 'web' ? 8 : 0,   // Simulated physical bezel
          borderColor: isDark ? '#18181B' : '#FFFFFF',
          overflow: 'hidden', 
          shadowColor: '#000',
          shadowOpacity: Platform.OS === 'web' ? (isDark ? 0.5 : 0.15) : 0,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 20 },
        }}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: isDark ? '#FAFAFA' : '#0F172A',
            tabBarInactiveTintColor: isDark ? '#71717A' : '#94A3B8',
            tabBarStyle: {
              backgroundColor: isDark ? '#09090B' : '#F8FAFC',
              borderTopWidth: 1,
              borderTopColor: isDark ? '#27272A' : '#E2E8F0',
              height: Platform.OS === 'ios' ? 85 : 65,
              paddingBottom: Platform.OS === 'ios' ? 25 : 10,
              paddingTop: 10,
              elevation: 0, 
            },
            tabBarLabelStyle: { fontSize: 11, marginTop: 4, fontWeight: '600' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Focus', tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2.5} /> }} />
          <Tabs.Screen name="calendar" options={{ title: 'Timeline', tabBarIcon: ({ color }) => <CalendarIcon size={24} color={color} strokeWidth={2.5} /> }} />
          <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ color }) => <PieChart size={24} color={color} strokeWidth={2.5} /> }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Settings size={24} color={color} strokeWidth={2.5} /> }} />
        </Tabs>

        {!userName && (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={{ position: 'absolute', inset: 0, backgroundColor: isDark ? '#09090B' : '#F8FAFC', zIndex: 100, justifyContent: 'center', padding: 32 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <Animated.View entering={SlideInDown.delay(200).springify().damping(18)}>
                <View className="w-16 h-16 rounded-[20px] mb-8 items-center justify-center shadow-lg" style={{ backgroundColor: isDark ? '#32D74B' : '#0A7EA4', shadowColor: isDark ? '#32D74B' : '#0A7EA4', shadowOpacity: 0.3, shadowRadius: 15 }}>
                  <Text className="text-3xl font-black" style={{ color: isDark ? '#09090B' : '#FFFFFF' }}>L</Text>
                </View>
                <Text style={{ fontSize: 48, fontWeight: '900', color: isDark ? '#FAFAFA' : '#0F172A', marginBottom: 8, letterSpacing: -1 }}>Welcome.</Text>
                <Text style={{ fontSize: 18, fontWeight: '500', color: isDark ? '#A1A1AA' : '#64748B', marginBottom: 40 }}>What should we call you?</Text>
                <View style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: 1, borderRadius: 24, padding: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                  <TextInput
                    autoFocus
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder="Your name"
                    placeholderTextColor={isDark ? "#71717A" : "#94A3B8"}
                    style={{ flex: 1, paddingHorizontal: 16, fontSize: 18, fontWeight: '600', color: isDark ? '#FAFAFA' : '#0F172A', outlineStyle: 'none' } as any}
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity onPress={handleSaveName} style={{ backgroundColor: isDark ? '#FAFAFA' : '#0F172A', padding: 16, borderRadius: 18 }}>
                    <ArrowRight size={20} color={isDark ? '#09090B' : '#FFFFFF'} strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
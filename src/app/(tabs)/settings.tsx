// src/app/(tabs)/settings.tsx
import { useTaskStore } from '@/store/useTaskStore';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Bell, ChevronDown, ChevronRight, Flame, Moon, Shield, Zap } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern, Rect, Circle as SvgCircle } from 'react-native-svg';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true, 
      shouldShowList: true,   
    }),
  });
}

const BackgroundPattern = ({ isDark }: { isDark: boolean }) => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <SvgCircle cx="2" cy="2" r="1.2" fill={isDark ? "#ffffff" : "#000000"} opacity={isDark ? "0.05" : "0.04"} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dotGrid)" />
    </Svg>
  </View>
);

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { userName, tasks, globalNotifications, setGlobalNotifications } = useTaskStore();
  const [expandedSection, setExpandedSection] = useState<'none' | 'notifications' | 'privacy'>('none');

  const { currentStreak, focusScore } = useMemo(() => {
    const completedTasks = tasks.filter(t => t.isCompleted);
    const activeDates = new Set(completedTasks.map(t => new Date(t.createdAt).toDateString()));
    let streak = 0;
    let checkDate = new Date();
    
    if (activeDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      while (activeDates.has(checkDate.toDateString())) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (activeDates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        while (activeDates.has(checkDate.toDateString())) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      }
    }
    return { currentStreak: streak, focusScore: (completedTasks.length * 15) + (streak * 50) };
  }, [tasks]);

  const getInitials = (name: string | null) => {
    if (!name) return 'ME';
    const words = name.trim().split(' ');
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleTestNotification = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!globalNotifications) {
      alert("Please turn on Master Alerts first.");
      return;
    }
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: { title: "LifeSync Active 🟢", body: "Push notifications are working perfectly.", sound: true },
        trigger: { seconds: 1 } as any,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setTimeout(() => alert("LifeSync Active 🟢\n\nPush notifications are working."), 500);
    }
  };

  const bgColor = isDark ? '#09090B' : '#F8FAFC';
  const cardColor = isDark ? '#18181B' : '#FFFFFF';
  const borderColor = isDark ? '#27272A' : '#E2E8F0';
  const accentColor = isDark ? '#32D74B' : '#0A7EA4';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }}>
      <BackgroundPattern isDark={isDark} />
      
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-8">
          <Text className="text-4xl font-black tracking-tight" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Profile.</Text>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(14)} style={{ backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1, borderRadius: 40, flexDirection: 'row', alignItems: 'center', padding: 24, marginBottom: 20 }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mr-5 shadow-lg" style={{ backgroundColor: accentColor, shadowColor: accentColor }}>
            <Text className="text-3xl font-black" style={{ color: isDark ? '#09090B' : '#FFFFFF' }}>{getInitials(userName)}</Text>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold mb-1" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }} numberOfLines={1}>{userName || 'User'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#32D74B' }} />
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: '#32D74B' }}>Active Member</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <Animated.View entering={FadeInDown.springify().damping(14).delay(100)} style={{ flex: 1, backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1, borderRadius: 32, padding: 20 }}>
            <View className="p-2 w-10 h-10 rounded-xl mb-3 items-center justify-center" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
              <Flame size={20} color="#FF9500" />
            </View>
            <Text className="text-3xl font-black" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>{currentStreak}</Text>
            <Text className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>Day Streak</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.springify().damping(14).delay(200)} style={{ flex: 1, backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1, borderRadius: 32, padding: 20 }}>
            <View className="p-2 w-10 h-10 rounded-xl mb-3 items-center justify-center" style={{ backgroundColor: 'rgba(50, 215, 75, 0.1)' }}>
              <Zap size={20} color="#32D74B" />
            </View>
            <Text className="text-3xl font-black" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>{focusScore}</Text>
            <Text className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>Focus Score</Text>
          </Animated.View>
        </View>

        <Text className="text-xs font-bold uppercase tracking-wider mb-4 ml-4" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>App Settings</Text>
        
        <Animated.View layout={LinearTransition.springify().damping(16).stiffness(120)} entering={FadeInDown.springify().damping(14).delay(300)} style={{ backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1, borderRadius: 36, padding: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="p-4">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View className="p-2 rounded-xl mr-4" style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9' }}>
                <Moon size={20} color={isDark ? "#FAFAFA" : "#0F172A"} />
              </View>
              <Text className="text-base font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')} trackColor={{ false: '#E2E8F0', true: '#32D74B' }} thumbColor="#ffffff" />
          </View>

          <Animated.View layout={LinearTransition.springify().damping(16)}>
            <TouchableOpacity onPress={() => setExpandedSection(expandedSection === 'notifications' ? 'none' : 'notifications')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="p-4">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View className="p-2 rounded-xl mr-4" style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <Bell size={20} color={isDark ? "#FAFAFA" : "#0F172A"} />
                </View>
                <Text className="text-base font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Notifications</Text>
              </View>
              {expandedSection === 'notifications' ? <ChevronDown size={20} color={isDark ? '#FAFAFA' : '#0F172A'} /> : <ChevronRight size={20} color={isDark ? '#3F3F46' : '#CBD5E1'} />}
            </TouchableOpacity>

            {expandedSection === 'notifications' && (
              <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 24, paddingBottom: 20, paddingTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={{ flex: 1 }}>
                    <Text className="text-sm font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A', marginBottom: 2 }}>Master Alerts</Text>
                    <Text className="text-[12px] font-medium" style={{ color: isDark ? '#A1A1AA' : '#64748B' }}>Allow push notifications.</Text>
                  </View>
                  <Switch value={globalNotifications} onValueChange={(val) => setGlobalNotifications(val)} trackColor={{ false: '#E2E8F0', true: '#32D74B' }} thumbColor="#ffffff" />
                </View>
                <TouchableOpacity onPress={handleTestNotification} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#27272A' : '#F1F5F9', padding: 14, borderRadius: 16 }}>
                  <Text className="text-sm font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Send Test Alert</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View layout={LinearTransition.springify().damping(16)}>
            <TouchableOpacity onPress={() => setExpandedSection(expandedSection === 'privacy' ? 'none' : 'privacy')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="p-4">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View className="p-2 rounded-xl mr-4" style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <Shield size={20} color={isDark ? "#FAFAFA" : "#0F172A"} />
                </View>
                <Text className="text-base font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Privacy & Security</Text>
              </View>
              {expandedSection === 'privacy' ? <ChevronDown size={20} color={isDark ? '#FAFAFA' : '#0F172A'} /> : <ChevronRight size={20} color={isDark ? '#3F3F46' : '#CBD5E1'} />}
            </TouchableOpacity>

            {expandedSection === 'privacy' && (
              <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 4 }}>
                <View style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9', padding: 20, borderRadius: 20 }}>
                  <Text style={{ fontSize: 14, lineHeight: 22, color: isDark ? '#A1A1AA' : '#64748B', fontWeight: '500' }}>
                    Your data is stored locally on this device. We do not transmit your tasks, schedules, or analytics to external servers. Your productivity remains completely private.
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
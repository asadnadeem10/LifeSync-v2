// src/app/(tabs)/index.tsx
import { Category, Priority, Task, useTaskStore } from '@/store/useTaskStore';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Bell, Calendar as CalendarIcon, Check, Clock, Plus, Trash2, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutLeft, LinearTransition, SlideInDown, SlideOutDown, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const AnimatedSvgCircle = Animated.createAnimatedComponent(SvgCircle);

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

const AnimatedProgressRing = ({ progress, isDark }: { progress: number, isDark: boolean }) => {
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const animatedStrokeDashoffset = useSharedValue(circumference);

  useEffect(() => {
    animatedStrokeDashoffset.value = withSpring(circumference - (progress / 100) * circumference, { damping: 15, stiffness: 90 });
  }, [progress, circumference]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: animatedStrokeDashoffset.value }));
  const center = radius + strokeWidth;

  return (
    <View className="items-center justify-center">
      <Svg width={center * 2} height={center * 2}>
        <SvgCircle cx={center} cy={center} r={radius} stroke={isDark ? '#27272A' : '#E2E8F0'} strokeWidth={strokeWidth} fill="none" />
        <AnimatedSvgCircle cx={center} cy={center} r={radius} stroke={isDark ? '#32D74B' : '#0F172A'} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} animatedProps={animatedProps} strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`} />
      </Svg>
      <View className="absolute">
        <Text className="text-[10px] font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const PremiumTaskCard = ({ item, toggleTask, deleteTask, isDark }: { item: Task, toggleTask: any, deleteTask: any, isDark: boolean }) => {
  const scale = useSharedValue(1);
  const animatedPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.springify().damping(14)} exiting={FadeOutLeft.springify().damping(14)} layout={LinearTransition.springify().damping(14)} className="mb-3">
      <Pressable onPressIn={() => scale.value = withSpring(0.97)} onPressOut={() => scale.value = withSpring(1)} onPress={() => toggleTask(item.id)}>
        <Animated.View style={[animatedPressStyle, { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E2E8F0', borderWidth: 1 }]} className="p-4 rounded-[24px] shadow-sm">
          <View className="mr-4 w-7 h-7 rounded-full border-[2px] items-center justify-center" style={{ borderColor: item.isCompleted ? '#32D74B' : (isDark ? '#3F3F46' : '#CBD5E1'), backgroundColor: item.isCompleted ? '#32D74B' : 'transparent' }}>
            {item.isCompleted && <Check size={16} color={isDark ? '#09090B' : 'white'} strokeWidth={3} />}
          </View>
          <View className="flex-1 justify-center">
            <Text numberOfLines={1} className="text-base font-bold" style={{ color: item.isCompleted ? (isDark ? '#52525B' : '#94A3B8') : (isDark ? '#FAFAFA' : '#0F172A'), textDecorationLine: item.isCompleted ? 'line-through' : 'none' }}>{item.title}</Text>
            <Text className="text-[13px] font-medium mt-0.5 capitalize" style={{ color: isDark ? '#A1A1AA' : '#64748B' }}>
              {item.category} • {item.priority} {item.reminderTime ? `• ${item.reminderTime}` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteTask(item.id)} className="w-9 h-9 items-center justify-center rounded-full ml-3" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const { tasks, addTask, toggleTask, deleteTask, userName } = useTaskStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  
  const [isTimeEnabled, setIsTimeEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [shouldNotify, setShouldNotify] = useState(false);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') await Notifications.requestPermissionsAsync();
      }
    }
    requestPermissions();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todaysTasks = tasks.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString());
  const pendingTasksCount = todaysTasks.filter(t => !t.isCompleted).length;
  const completionPercentage = todaysTasks.length > 0 ? ((todaysTasks.length - pendingTasksCount) / todaysTasks.length) * 100 : 0;

  const categories: Category[] = ['work', 'personal', 'health', 'learning'];
  const priorities: Priority[] = ['low', 'medium', 'high'];

  const upcomingDates = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { id: i, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }), dateString: d.toDateString() };
  }), []);

  const openModal = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTaskTitle(''); setIsTimeEnabled(false); setShouldNotify(false); setSelectedDate(new Date().toDateString()); setIsModalOpen(true);
  };

  const handleAddTask = async () => {
    if (taskTitle.trim().length > 0) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const reminderTime = isTimeEnabled ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : null;
      let triggerDate = null;

      if (isTimeEnabled && shouldNotify) {
        triggerDate = new Date(selectedDate);
        let h = parseInt(selectedHour);
        if (selectedPeriod === 'PM' && h !== 12) h += 12;
        if (selectedPeriod === 'AM' && h === 12) h = 0;
        triggerDate.setHours(h, parseInt(selectedMinute), 0, 0);
        
        if (Platform.OS !== 'web' && triggerDate.getTime() > Date.now()) {
          await Notifications.scheduleNotificationAsync({
            content: { title: "LifeSync Reminder 🗓️", body: `It's time for "${taskTitle.trim()}".`, sound: true },
            trigger: { date: triggerDate } as any,
          });
        } else if (Platform.OS === 'web' && triggerDate.getTime() > Date.now()) {
          const delay = triggerDate.getTime() - Date.now();
          setTimeout(() => alert(`LifeSync Reminder: Time for "${taskTitle.trim()}"`), delay);
        }
      }

      addTask({ title: taskTitle.trim(), isCompleted: false, priority, category, createdAt: new Date(selectedDate).getTime(), reminderTime, shouldNotify });
      setIsModalOpen(false);
    }
  };

  const isFormValid = taskTitle.trim().length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-8">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>{greeting}{userName ? `, ${userName}` : ''}</Text>
              <Text className="text-4xl font-black tracking-tight" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Focus.</Text>
            </View>
            <AnimatedProgressRing progress={completionPercentage} isDark={isDark} />
          </View>

          <View className="flex-1">
            <FlashList
              data={todaysTasks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              // @ts-ignore
              estimatedItemSize={80} 
              contentContainerStyle={{ paddingBottom: 140 }}
              ListEmptyComponent={() => (
                <View className="items-center justify-center py-16">
                  <View className="p-6 rounded-full mb-6" style={{ backgroundColor: isDark ? 'rgba(50, 215, 75, 0.15)' : 'rgba(10, 126, 164, 0.1)' }}>
                    <CalendarIcon size={40} color={isDark ? "#32D74B" : "#0A7EA4"} />
                  </View>
                  <Text className="text-xl font-bold mb-2" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Clear Schedule</Text>
                  <Text className="text-base font-medium text-center px-4" style={{ color: isDark ? '#A1A1AA' : '#64748B' }}>Your day is a blank canvas. Tap below to start planning.</Text>
                </View>
              )}
              renderItem={({ item }) => <PremiumTaskCard item={item} toggleTask={toggleTask} deleteTask={deleteTask} isDark={isDark} />}
            />
          </View>
        </View>
      </SafeAreaView>

      {!isModalOpen && (
        <Animated.View entering={SlideInDown.springify().damping(20).stiffness(120)} exiting={FadeOut} className="absolute bottom-8 left-0 right-0 items-center z-10" pointerEvents="box-none">
          <TouchableOpacity onPress={openModal} activeOpacity={0.85} style={{ backgroundColor: isDark ? '#FAFAFA' : '#0F172A', shadowColor: isDark ? '#000000' : '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.5 : 0.25, shadowRadius: 16, elevation: 10 }} className="flex-row items-center px-6 py-4 rounded-full border border-white/10">
            <Plus size={20} color={isDark ? "#09090B" : "#FFFFFF"} strokeWidth={3} className="mr-2" />
            <Text className="font-bold text-[15px] tracking-wide" style={{ color: isDark ? '#09090B' : '#FFFFFF' }}>Create Task</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {isModalOpen && (
        <View className="absolute inset-0 z-50 justify-end" pointerEvents="box-none">
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="absolute inset-0" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(15, 23, 42, 0.4)' }}>
            <Pressable className="flex-1" onPress={() => setIsModalOpen(false)} />
          </Animated.View>
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
            <Animated.View entering={SlideInDown.springify().damping(16).stiffness(120)} exiting={SlideOutDown.springify().damping(16).stiffness(120)} className="rounded-t-[40px] shadow-2xl" style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', maxHeight: Platform.OS === 'web' ? '90%' : '85%', flexShrink: 1 }}>
              
              <View className="px-6 pt-5 pb-4 flex-row items-center justify-between border-b" style={{ borderBottomColor: isDark ? '#27272A' : '#F1F5F9' }}>
                <Text className="text-xl font-black" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>New Task</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 rounded-full" style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9' }}>
                  <X size={20} color={isDark ? "#A1A1AA" : "#64748B"} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                
                <TextInput 
                  autoFocus 
                  value={taskTitle} 
                  onChangeText={setTaskTitle} 
                  placeholder="What needs to be done?" 
                  placeholderTextColor={isDark ? "#52525B" : "#CBD5E1"} 
                  style={{ fontSize: 28, fontWeight: '800', color: isDark ? '#FAFAFA' : '#0F172A', marginBottom: 32, outlineStyle: 'none' } as any} 
                  onSubmitEditing={handleAddTask} 
                />
                
                <Text className="text-[11px] font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>Scheduled Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
                  {upcomingDates.map((d) => (
                    <TouchableOpacity key={d.id} onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setSelectedDate(d.dateString); }} className="mr-3 px-5 py-3 rounded-[16px]" style={{ backgroundColor: selectedDate === d.dateString ? (isDark ? '#FAFAFA' : '#0F172A') : (isDark ? '#27272A' : '#F1F5F9') }}>
                      <Text className="text-[15px] font-bold" style={{ color: selectedDate === d.dateString ? (isDark ? '#09090B' : '#FFFFFF') : (isDark ? '#A1A1AA' : '#64748B') }}>{d.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ backgroundColor: isDark ? '#27272A' : '#F1F5F9', borderRadius: 24, overflow: 'hidden', marginBottom: 32 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#3F3F46' : '#FFFFFF' }}>
                        <Clock size={16} color={isDark ? '#FAFAFA' : '#0F172A'} />
                      </View>
                      <Text className="text-[15px] font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Specific Time</Text>
                    </View>
                    <Switch value={isTimeEnabled} onValueChange={(val) => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsTimeEnabled(val); }} trackColor={{ false: '#E2E8F0', true: '#32D74B' }} thumbColor="#ffffff" />
                  </View>

                  {/* --- NEW: iOS Digital Time Input Block --- */}
                  {isTimeEnabled && (
                    <Animated.View entering={FadeInDown.duration(200)} style={{ borderTopWidth: 1, borderTopColor: isDark ? '#3F3F46' : '#E2E8F0', paddingVertical: 24, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      
                      {/* Hours Numpad */}
                      <TextInput
                        value={selectedHour}
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={(text) => {
                          const clean = text.replace(/[^0-9]/g, '');
                          if (parseInt(clean) > 12) return;
                          setSelectedHour(clean);
                        }}
                        onBlur={() => {
                          if (!selectedHour || parseInt(selectedHour) === 0) setSelectedHour('12');
                          else setSelectedHour(selectedHour.padStart(2, '0'));
                        }}
                        style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', color: isDark ? '#FAFAFA' : '#0F172A', fontSize: 36, fontWeight: '800', textAlign: 'center', width: 75, height: 65, borderRadius: 16, outlineStyle: 'none' } as any}
                      />
                      
                      <Text style={{ color: isDark ? '#71717A' : '#94A3B8', fontSize: 36, fontWeight: '900', marginHorizontal: 12 }}>:</Text>

                      {/* Minutes Numpad */}
                      <TextInput
                        value={selectedMinute}
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={(text) => {
                          const clean = text.replace(/[^0-9]/g, '');
                          if (parseInt(clean) > 59) return;
                          setSelectedMinute(clean);
                        }}
                        onBlur={() => {
                          if (!selectedMinute) setSelectedMinute('00');
                          else setSelectedMinute(selectedMinute.padStart(2, '0'));
                        }}
                        style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', color: isDark ? '#FAFAFA' : '#0F172A', fontSize: 36, fontWeight: '800', textAlign: 'center', width: 75, height: 65, borderRadius: 16, outlineStyle: 'none' } as any}
                      />

                      {/* Segmented AM/PM Control */}
                      <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#18181B' : '#E2E8F0', borderRadius: 12, padding: 4, marginLeft: 24 }}>
                        <TouchableOpacity onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setSelectedPeriod('AM'); }} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: selectedPeriod === 'AM' ? (isDark ? '#3F3F46' : '#FFFFFF') : 'transparent', borderRadius: 8, shadowColor: '#000', shadowOpacity: selectedPeriod === 'AM' ? 0.1 : 0, shadowRadius: 4 }}>
                          <Text style={{ color: selectedPeriod === 'AM' ? (isDark ? '#FAFAFA' : '#0F172A') : (isDark ? '#A1A1AA' : '#64748B'), fontWeight: '900', fontSize: 16 }}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setSelectedPeriod('PM'); }} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: selectedPeriod === 'PM' ? (isDark ? '#3F3F46' : '#FFFFFF') : 'transparent', borderRadius: 8, shadowColor: '#000', shadowOpacity: selectedPeriod === 'PM' ? 0.1 : 0, shadowRadius: 4 }}>
                          <Text style={{ color: selectedPeriod === 'PM' ? (isDark ? '#FAFAFA' : '#0F172A') : (isDark ? '#A1A1AA' : '#64748B'), fontWeight: '900', fontSize: 16 }}>PM</Text>
                        </TouchableOpacity>
                      </View>

                    </Animated.View>
                  )}

                  {isTimeEnabled && (
                    <Animated.View entering={FadeInDown.duration(200)} style={{ borderTopWidth: 1, borderTopColor: isDark ? '#3F3F46' : '#E2E8F0', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#3F3F46' : '#FFFFFF' }}>
                          <Bell size={16} color={isDark ? '#32D74B' : '#0A7EA4'} />
                        </View>
                        <Text className="text-[15px] font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Push Notification</Text>
                      </View>
                      <Switch value={shouldNotify} onValueChange={(val) => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShouldNotify(val); }} trackColor={{ false: '#E2E8F0', true: '#32D74B' }} thumbColor="#ffffff" />
                    </Animated.View>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
                  <View style={{ flex: 1 }}>
                    <Text className="text-[11px] font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>Category</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {categories.map((cat) => (
                        <TouchableOpacity key={cat} onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setCategory(cat); }} className="px-4 py-2.5 rounded-[12px]" style={{ backgroundColor: category === cat ? (isDark ? '#FAFAFA' : '#0F172A') : (isDark ? '#27272A' : '#F1F5F9') }}>
                          <Text className="text-xs font-bold capitalize" style={{ color: category === cat ? (isDark ? '#09090B' : '#FFFFFF') : (isDark ? '#A1A1AA' : '#64748B') }}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text className="text-[11px] font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: isDark ? '#71717A' : '#94A3B8' }}>Priority</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {priorities.map((pri) => (
                        <TouchableOpacity key={pri} onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setPriority(pri); }} className="px-4 py-2.5 rounded-[12px]" style={{ backgroundColor: priority === pri ? (isDark ? '#FAFAFA' : '#0F172A') : (isDark ? '#27272A' : '#F1F5F9') }}>
                          <Text className="text-xs font-bold capitalize" style={{ color: priority === pri ? (isDark ? '#09090B' : '#FFFFFF') : (isDark ? '#A1A1AA' : '#64748B') }}>{pri}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-[24px] items-center justify-center border" style={{ borderColor: isDark ? '#3F3F46' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
                    <Text className="text-base font-bold" style={{ color: isDark ? '#FAFAFA' : '#0F172A' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleAddTask} 
                    disabled={!isFormValid}
                    className="flex-1 py-5 rounded-[24px] items-center justify-center shadow-lg" 
                    style={{ 
                      backgroundColor: !isFormValid ? (isDark ? '#27272A' : '#E2E8F0') : (isDark ? '#FAFAFA' : '#0F172A'), 
                      shadowColor: isDark ? '#FFFFFF' : '#0F172A', 
                      shadowOpacity: !isFormValid ? 0 : (isDark ? 0.1 : 0.25), 
                      shadowOffset: { width: 0, height: 4 }, 
                      shadowRadius: 10 
                    }}
                  >
                    <Text className="text-base font-bold" style={{ color: !isFormValid ? (isDark ? '#52525B' : '#94A3B8') : (isDark ? '#09090B' : '#FFFFFF') }}>Create Task</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}
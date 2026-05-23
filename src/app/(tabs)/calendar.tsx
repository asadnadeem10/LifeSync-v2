// src/app/(tabs)/calendar.tsx
import { Task, useTaskStore } from '@/store/useTaskStore';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { CalendarX, Check, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TimelineTaskCard = ({ item, toggleTask, deleteTask, isLast, isDark }: { item: Task, toggleTask: any, deleteTask: any, isLast: boolean, isDark: boolean }) => {
  const handleToggle = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTask(item.id);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTask(item.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      exiting={FadeOutLeft.springify().damping(14)}
      layout={LinearTransition.springify().damping(14)}
      style={{ flexDirection: 'row' }}
      className="mb-4"
    >
      {/* Vertical Timeline Graphic */}
      <View className="items-center mr-4 w-6">
        <View 
          className="w-3.5 h-3.5 rounded-full mt-5 border-[3px]"
          style={{ 
            backgroundColor: item.isCompleted ? '#32D74B' : (isDark ? '#0A7EA4' : '#007AFF'),
            borderColor: item.isCompleted ? 'rgba(50, 215, 75, 0.3)' : (isDark ? 'rgba(10, 126, 164, 0.3)' : 'rgba(0, 122, 255, 0.3)')
          }} 
        />
        {!isLast && <View className="w-0.5 flex-1 bg-[#E6E8EB] dark:bg-[#2C2C2E] mt-2 opacity-60" />}
      </View>

      {/* Apple-Style Task Card */}
      <View 
        style={{ flexDirection: 'row', alignItems: 'center' }}
        className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-[22px] shadow-sm shadow-black/5 dark:shadow-none border border-[#E6E8EB] dark:border-[#2C2C2E]"
      >
        <TouchableOpacity 
          onPress={handleToggle} 
          activeOpacity={0.8}
          className="mr-3 w-7 h-7 rounded-full border-[2px] items-center justify-center"
          style={{
            borderColor: item.isCompleted ? '#32D74B' : (isDark ? '#48484A' : '#C7C7CC'),
            backgroundColor: item.isCompleted ? '#32D74B' : 'transparent',
          }}
        >
          {item.isCompleted && <Check size={16} color="white" strokeWidth={3} />}
        </TouchableOpacity>
        
        <View className="flex-1 justify-center">
          <Text numberOfLines={1} className={`text-base font-semibold ${item.isCompleted ? 'text-[#8E8E93] line-through' : 'text-[#1C1C1E] dark:text-white'}`}>
            {item.title}
          </Text>
          <Text className="text-[13px] font-medium text-[#8E8E93] mt-0.5 capitalize">
            {item.category} • {item.priority}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleDelete} className="w-9 h-9 items-center justify-center bg-[#FF3B30]/10 dark:bg-[#FF3B30]/15 rounded-full ml-2">
          <Trash2 size={18} color="#FF3B30" opacity={0.8} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function CalendarScreen() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i < 11; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: i,
        dateString: date.toDateString(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
        fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(weekDates[3]);

  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt).toDateString();
    return taskDate === selectedDate.dateString;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7] dark:bg-[#000000]">
      <View className="flex-1 pt-8">
        
        <View className="px-6 mb-6">
          <Text className="text-4xl font-bold text-[#11181C] dark:text-white tracking-tight">Timeline.</Text>
          <Text className="text-base font-medium text-[#687076] dark:text-[#8E8E93] mt-1">
            {selectedDate.isToday ? 'Today, ' : ''}{selectedDate.fullDate}
          </Text>
        </View>

        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
            {weekDates.map((item) => {
              const isActive = selectedDate.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSelectedDate(item);
                  }}
                  className={`w-[60px] h-[80px] rounded-[24px] items-center justify-center ${
                    isActive ? 'bg-[#007AFF] dark:bg-[#32D74B] shadow-md shadow-[#007AFF]/30 dark:shadow-[#32D74B]/20' : 'bg-white dark:bg-[#1C1C1E] border border-[#E6E8EB] dark:border-[#2C2C2E]'
                  }`}
                >
                  <Text className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white/90 dark:text-black/70' : 'text-[#8E8E93]'}`}>
                    {item.dayName}
                  </Text>
                  <Text className={`text-xl font-bold ${isActive ? 'text-white dark:text-black' : 'text-[#1C1C1E] dark:text-white'}`}>
                    {item.dayNumber}
                  </Text>
                  {item.isToday && !isActive && (
                    <View className="w-1.5 h-1.5 bg-[#007AFF] dark:bg-[#32D74B] rounded-full absolute bottom-2" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 px-6">
          <FlashList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            // @ts-ignore
            estimatedItemSize={90}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
            ListEmptyComponent={() => (
              <Animated.View entering={FadeInDown.springify()} className="flex-1 items-center justify-center py-16">
                <View className="bg-black/5 dark:bg-white/5 p-6 rounded-full mb-6">
                  <CalendarX size={40} color={isDark ? "#4C5155" : "#9BA1A6"} />
                </View>
                <Text className="text-xl font-bold text-[#11181C] dark:text-white mb-2">No timeline events</Text>
                <Text className="text-base font-medium text-[#8E8E93] text-center px-8">
                  Enjoy your free time, or switch to another day to review your schedule.
                </Text>
              </Animated.View>
            )}
            renderItem={({ item, index }) => <TimelineTaskCard item={item} toggleTask={toggleTask} deleteTask={deleteTask} isLast={index === filteredTasks.length - 1} isDark={isDark} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
// src/app/(tabs)/insights.tsx
import { useTaskStore } from '@/store/useTaskStore';
import { TrendingUp } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Upgraded Premium Chart Bar (Workload vs Completed) ---
const AnimatedBar = ({ total, completed, maxTotal, label, index, isDark, isToday }: any) => {
  const trackHeight = maxTotal > 0 ? Math.max((total / maxTotal) * 100, 8) : 8;
  const fillHeight = total > 0 ? (completed / total) * 100 : 0;
  
  const trackStyle = useAnimatedStyle(() => ({
    height: withDelay(index * 50, withSpring(`${trackHeight}%`, { damping: 14 }))
  }));

  const fillStyle = useAnimatedStyle(() => ({
    height: withDelay((index * 50) + 300, withSpring(`${fillHeight}%`, { damping: 14 }))
  }));

  return (
    <View className="items-center flex-1">
      <View className="h-40 w-full justify-end items-center mb-2">
        {/* BULLETPROOF FIX: Inline backgrounds for the Chart Track */}
        <Animated.View 
          style={[
            trackStyle, 
            { 
              width: '100%', 
              overflow: 'hidden', 
              justifyContent: 'flex-end',
              backgroundColor: isToday ? (isDark ? 'rgba(50, 215, 75, 0.2)' : 'rgba(10, 126, 164, 0.2)') : (isDark ? '#2A2A2A' : '#E6E8EB')
            }
          ]} 
          className="rounded-xl absolute"
        >
          {/* BULLETPROOF FIX: Inline backgrounds for the Chart Fill */}
          <Animated.View 
            style={[
              fillStyle, 
              { 
                width: '100%',
                backgroundColor: isToday ? (isDark ? '#32D74B' : '#0A7EA4') : (isDark ? '#4C5155' : '#9BA1A6')
              }
            ]}
            className="rounded-xl"
          />
        </Animated.View>
      </View>
      <Text className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? (isDark ? 'text-white' : 'text-[#11181C]') : 'text-[#9BA1A6]'}`}>
        {label}
      </Text>
    </View>
  );
};

export default function InsightsScreen() {
  const { tasks } = useTaskStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { totalTasks, completedTasks, completionRate, weeklyData, maxTasksInOneDay } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const slidingWindow = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + (i - 3)); 
      return {
        id: i,
        label: i === 3 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateString: d.toDateString(),
        total: 0,
        completed: 0,
        isToday: i === 3
      };
    });

    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      const dayIndex = slidingWindow.findIndex(d => d.dateString === taskDate);
      if (dayIndex !== -1) {
        slidingWindow[dayIndex].total += 1;
        if (task.isCompleted) slidingWindow[dayIndex].completed += 1;
      }
    });

    const maxCount = Math.max(...slidingWindow.map(d => d.total), 1); 

    return { totalTasks: total, completedTasks: completed, completionRate: rate, weeklyData: slidingWindow, maxTasksInOneDay: maxCount };
  }, [tasks]);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7] dark:bg-[#000000]">
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        
        <View className="mb-8">
          <Text className="text-4xl font-bold text-[#11181C] dark:text-white tracking-tight">Analytics.</Text>
          <Text className="text-base font-medium text-[#687076] dark:text-[#8E8E93] mt-1">
            Workload & Completion Tracking.
          </Text>
        </View>

        {/* BULLETPROOF FIX: Inline background for the Master Score Card */}
        <Animated.View 
          entering={FadeInDown.springify().damping(14)} 
          style={{ backgroundColor: isDark ? '#1C1C1E' : '#0A7EA4' }}
          className="rounded-[32px] p-6 mb-6 shadow-md shadow-[#0A7EA4]/20 dark:shadow-none border border-transparent dark:border-[#2C2C2E]"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-white/20 dark:bg-[#32D74B]/20 p-3 rounded-2xl">
              <TrendingUp size={24} color={isDark ? "#32D74B" : "#ffffff"} />
            </View>
            <Text className="text-white/80 dark:text-[#8E8E93] font-bold uppercase tracking-wider text-xs">Overall Completion</Text>
          </View>
          <View className="flex-row items-baseline">
            <Text className="text-6xl font-black text-white dark:text-white tracking-tighter">{completionRate}</Text>
            <Text className="text-2xl font-bold text-white/70 dark:text-[#8E8E93] ml-1">%</Text>
          </View>
          <Text className="text-white/80 dark:text-[#8E8E93] mt-2 font-medium">
            You have completed {completedTasks} out of {totalTasks} lifetime tasks.
          </Text>
        </Animated.View>

        {/* BULLETPROOF FIX: Inline background for the Heatmap Card */}
        <Animated.View 
          entering={FadeInDown.springify().damping(14).delay(100)} 
          style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}
          className="rounded-[32px] p-6 mb-6 shadow-sm shadow-black/5 dark:shadow-none border border-[#E6E8EB] dark:border-[#2C2C2E]"
        >
          <Text className="text-lg font-bold text-[#11181C] dark:text-white mb-6">7-Day Forecast</Text>
          <View className="flex-row justify-between items-end gap-2 h-48">
            {weeklyData.map((data) => (
              <AnimatedBar 
                key={data.id} 
                index={data.id} 
                total={data.total} 
                completed={data.completed}
                maxTotal={maxTasksInOneDay} 
                label={data.label} 
                isDark={isDark} 
                isToday={data.isToday}
              />
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">내 정보</ThemedText>
      <ThemedText type="default" style={styles.body}>
        로그인 후 연습 기록, 피드백 리포트, 목표 설정을 확인할 수 있습니다.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  body: {
    lineHeight: 22,
  },
});

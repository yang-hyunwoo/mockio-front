import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NoticeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">공지사항</ThemedText>
      <ThemedText type="default" style={styles.body}>
        이번 주 신규 질문 세트가 추가되었습니다. 게스트로 확인해보고 마음에 들면 바로 시작해보세요.
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

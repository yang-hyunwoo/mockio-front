import { Image } from 'expo-image';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { keycloakConfig, keycloakRedirectPath, keycloakRedirectScheme } from '@/constants/keycloak';

const mockioText = require('../../../../packages/theme/assets/img/mockio-text-logo.png');

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const discovery = AuthSession.useAutoDiscovery(keycloakConfig.issuer);
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: keycloakRedirectScheme,
        path: keycloakRedirectPath,
      }),
    []
  );

  const [tokenResponse, setTokenResponse] = useState<AuthSession.TokenResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const isAuthenticated = Boolean(tokenResponse?.accessToken);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: keycloakConfig.clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    },
    discovery
  );

  useEffect(() => {
    if (!response || !discovery) {
      return;
    }

    if (response.type === 'error') {
      setAuthError(response.error?.message ?? 'Login failed.');
      return;
    }

    if (response.type !== 'success') {
      return;
    }

    const exchangeAsync = async () => {
      try {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: keycloakConfig.clientId,
            code: response.params.code,
            redirectUri,
            extraParams: request?.codeVerifier
              ? { code_verifier: request.codeVerifier }
              : undefined,
          },
          discovery
        );

        setTokenResponse(tokenResult);
        setAuthError(null);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Login failed.');
      }
    };

    exchangeAsync();
  }, [response, discovery, redirectUri, request?.codeVerifier]);

  const handleLogin = () => {
    setAuthError(null);
    promptAsync({ useProxy: false });
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#F8F5EE', dark: '#0B1020' }}>
      <ThemedView style={styles.brandRow}>
        <Image
          source={mockioText}
          style={styles.brandText}
          contentFit="contain"
          contentPosition="left"
        />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">게스트 미리보기</ThemedText>
        <ThemedText type="default">
          샘플 흐름을 먼저 체험해보세요. 실제 면접을 시작할 때 로그인하면 됩니다.
        </ThemedText>
        <View style={styles.previewList}>
          <ThemedText type="default">- 어려운 문제를 해결한 경험을 말해보세요.</ThemedText>
          <ThemedText type="default">- 모든 일이 급할 때 우선순위를 어떻게 정하나요?</ThemedText>
          <ThemedText type="default">- 최근 프로젝트를 처음부터 끝까지 설명해보세요.</ThemedText>
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">면접 시작</ThemedText>
        <View style={styles.authRow}>
          <Pressable
            onPress={handleLogin}
            disabled={!request || !discovery || isAuthenticated}
          >
            <ThemedText type="defaultSemiBold">
              {isAuthenticated
                ? '로그인됨'
                : request
                  ? '면접 시작 (로그인)'
                  : '로그인 준비 중...'}
            </ThemedText>
          </Pressable>
        </View>
        {tokenResponse ? (
          <ThemedText type="default">
            로그인 완료. 액세스 토큰 만료까지 {tokenResponse.expiresIn ?? 0}초 남았습니다.
          </ThemedText>
        ) : null}
        {authError ? <ThemedText type="default">오류: {authError}</ThemedText> : null}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  authRow: {
    paddingVertical: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    height: 56,
    width: 240,
  },
  previewList: {
    gap: 6,
    paddingTop: 6,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});

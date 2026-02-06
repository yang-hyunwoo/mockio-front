import { Image } from 'expo-image';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { keycloakConfig, keycloakRedirectPath, keycloakRedirectScheme } from '@/constants/keycloak';

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const discovery = AuthSession.useAutoDiscovery(keycloakConfig.issuer);
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: keycloakRedirectScheme,
        path: keycloakRedirectPath,
      }),
    [],
  );
  console.log('redirectUri', redirectUri);
  const [tokenResponse, setTokenResponse] = useState<AuthSession.TokenResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: keycloakConfig.clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    },
    discovery,
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
          discovery,
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Keycloak Login</ThemedText>
        <View style={styles.authRow}>
          <Pressable onPress={handleLogin} disabled={!request || !discovery}>
            <ThemedText type="defaultSemiBold">
              {request ? 'Sign in with Keycloak' : 'Loading auth...'}
            </ThemedText>
          </Pressable>
        </View>
        {tokenResponse ? (
          <ThemedText type="default">
            Signed in. Access token expires in {tokenResponse.expiresIn ?? 0} seconds.
          </ThemedText>
        ) : null}
        {authError ? <ThemedText type="default">Error: {authError}</ThemedText> : null}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  authRow: {
    paddingVertical: 4,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

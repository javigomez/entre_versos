import { Component, type ReactNode, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrainingScreen } from './ui/TrainingScreen';
import { colors as c } from './ui/theme';
import { createContentRepository } from './content/content-repository';
import { contentKeyFromSearch } from './content/content-selection';
import { createAsyncStorageProgressRepository } from './storage/async-storage-progress-repository';
import { createChallengeImageResolver } from './content/content-images';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <View style={styles.error}><Text style={{ color: c.text }}>No s’ha pogut obrir l’entrenament. Revisa el contingut i torna a carregar l’app.</Text></View> : this.props.children; }
}

function ContentApp() {
  const search = Platform.OS === 'web' ? globalThis.location?.search ?? '' : '';
  const key = contentKeyFromSearch(search);
  const content = useMemo(() => createContentRepository(key), [key]);
  const progress = useMemo(() => createAsyncStorageProgressRepository(key), [key]);
  const resolveImage = useMemo(() => createChallengeImageResolver(key), [key]);
  return <TrainingScreen content={content} progress={progress} resolveImage={resolveImage} />;
}

export default function App() {
  return <SafeAreaProvider><View style={styles.stage}><View style={styles.phone}><StatusBar style="light" /><ErrorBoundary><ContentApp /></ErrorBoundary></View></View></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: c.outside, alignItems: 'center', justifyContent: 'center' },
  phone: { width: '100%', maxWidth: 430, flex: 1, backgroundColor: c.bg, ...(Platform.OS === 'web' ? { maxHeight: 900, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#292b2d' } : {}) },
  error: { padding: 30, flex: 1, justifyContent: 'center' },
});

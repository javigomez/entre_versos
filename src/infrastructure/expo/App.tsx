import { Component, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrainingScreen } from './ui/TrainingScreen';
import { colors as c } from './ui/theme';
import { createYamlContentRepository } from './content/yaml-content-repository';
import { contentKeyFromSearch } from './content/content-selection';
import { createAsyncStorageProgressRepository } from './storage/async-storage-progress-repository';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <View style={styles.error}><Text style={{ color: c.text }}>No se ha podido abrir el entrenamiento. Revisa el contenido y recarga la app.</Text></View> : this.props.children; }
}

const progress = createAsyncStorageProgressRepository();

function ContentApp() {
  const search = Platform.OS === 'web' ? globalThis.location?.search ?? '' : '';
  const content = createYamlContentRepository(contentKeyFromSearch(search));
  return <TrainingScreen content={content} progress={progress} />;
}

export default function App() {
  return <SafeAreaProvider><View style={styles.stage}><View style={styles.phone}><StatusBar style="light" /><ErrorBoundary><ContentApp /></ErrorBoundary></View></View></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: c.outside, alignItems: 'center', justifyContent: 'center' },
  phone: { width: '100%', maxWidth: 430, flex: 1, backgroundColor: c.bg, ...(Platform.OS === 'web' ? { maxHeight: 900, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#292b2d' } : {}) },
  error: { padding: 30, flex: 1, justifyContent: 'center' },
});

import { PreferencesProvider } from '@/context/PreferencesContext';
import {AuthProvider} from '../context/AuthContext';
import { Stack } from "expo-router";


export default function RootLayout() {
  return <AuthProvider>
            <PreferencesProvider>
              <Stack screenOptions={{ headerShown: false, animation: "none" }}/>
            </PreferencesProvider>
        </AuthProvider>
}

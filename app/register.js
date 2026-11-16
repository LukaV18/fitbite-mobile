import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { COLORS } from '../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const showError = (title, message) => {
    setErrorMsg(message);
    Alert.alert(title, message);
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (name.trim().length < 2) {
      showError('Nombre requerido', 'Ingresá tu nombre para crear la cuenta.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showError('Email inválido', 'Ingresá un correo electrónico válido.');
      return;
    }
    if (password.length < 4) {
      showError('Contraseña corta', 'Usá al menos 4 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (error) {
      showError('Error en el registro', error.message || 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Guardá tus recetas favoritas en tu perfil</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Luka"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tuemail@ejemplo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 4 caracteres"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
          <Text style={styles.linkText}>Ya tengo cuenta, volver al login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

import { Alert } from 'react-native';

// A confirmation prompt before any destructive CRUD action, native to the
// platform (Android's system alert dialog) rather than a custom modal.
export function confirmarEliminar(mensaje: string, onConfirm: () => void) {
  Alert.alert('¿Seguro que quieres eliminar?', mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

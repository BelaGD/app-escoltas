import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { color, font } from '../../theme/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Btn({
  label, onPress, variant = 'secondary', block, disabled, style, small,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  block?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        block && styles.block,
        small && styles.small,
        pressed && !disabled && (variant === 'primary' ? styles.primaryPressed : styles.pressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.labelPrimary,
          variant === 'ghost' && styles.labelGhost,
          small && styles.labelSmall,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: color.accent, borderColor: color.accent },
  primaryPressed: { backgroundColor: color.accent700 },
  secondary: { borderColor: color.divider },
  pressed: { backgroundColor: 'rgba(29,31,32,0.07)' },
  ghost: { borderColor: 'transparent' },
  block: { alignSelf: 'stretch', marginTop: 7 },
  small: { paddingVertical: 7, paddingHorizontal: 8 },
  disabled: { opacity: 0.45 },
  label: { fontFamily: font.heading, fontSize: 14, color: color.text, letterSpacing: 0.3 },
  labelPrimary: { color: color.bg },
  labelGhost: { color: color.accent },
  labelSmall: { fontSize: 12.5 },
});

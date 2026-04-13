import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BottomSheet({ visible, onClose, children, style }: BottomSheetProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.spacer} />
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }, style]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    borderTopStartRadius: borderRadius.xl,
    borderTopEndRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.md,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
});

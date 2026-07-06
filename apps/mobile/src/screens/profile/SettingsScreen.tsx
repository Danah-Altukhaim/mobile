import React from 'react';
import { ScrollView, View, StyleSheet, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Text, ListItem, Switch, Icon } from '../../components/ui';
import { LanguageToggle } from '../../components/common';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const isAr = i18n.language === 'ar';
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const themeMode = useUIStore((s) => s.themeMode);
  const toggleThemeMode = useUIStore((s) => s.toggleThemeMode);
  const appVersion = Constants.expoConfig?.version || '0.1.0';

  const confirmLogout = () => {
    haptic.warning();
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm') || '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: () => {
          haptic.medium();
          clearAuth();
        },
      },
    ]);
  };

  const iconWedge = (name: any, tint = colors.primary) => (
    <View style={[styles.iconWedge, { backgroundColor: colors.primaryWash }]}>
      <Icon name={name} size={16} color={tint} />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <View style={styles.titleBlock}>
        <Text
          variant="overline"
          color={colors.primary}
          style={[styles.eyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}
        >
          CCK Hub
        </Text>
        <Text variant="h1" accessibilityRole="header" style={{ textAlign, writingDirection }}>
          {t('profile.settings')}
        </Text>
      </View>

      <SectionEyebrow label={isAr ? 'التفضيلات' : 'Preferences'} colors={colors} isAr={isAr} />
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ListItem
          title={t('profile.language')}
          left={iconWedge('language')}
          right={<LanguageToggle />}
          showChevron={false}
        />
        <View style={[styles.switchRow, { flexDirection: rowDirection, borderBottomColor: colors.divider }]}>
          {iconWedge('moon')}
          <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
            {t('profile.darkMode')}
          </Text>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleThemeMode}
            label=""
          />
        </View>
        <ListItem
          title={t('profile.notificationPreferences')}
          left={iconWedge('notifications')}
          onPress={() => navigation.navigate('NotificationPreferences')}
        />
        <ListItem
          title={t('customizeHome.title')}
          left={iconWedge('home')}
          onPress={() => navigation.navigate('CustomizeHome')}
          isLast
        />
      </View>

      <SectionEyebrow label={isAr ? 'حول التطبيق' : 'About'} colors={colors} isAr={isAr} />
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ListItem
          title={t('profile.about')}
          subtitle={`${t('profile.version')} ${appVersion}`}
          left={iconWedge('document')}
          showChevron={false}
        />
        <ListItem
          title={t('profile.privacyPolicy')}
          left={iconWedge('document')}
          onPress={() => Linking.openURL('https://masari.app/privacy')}
          isLast
        />
      </View>

      <SectionEyebrow label={isAr ? 'الحساب' : 'Account'} colors={colors} isAr={isAr} />
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ListItem
          title={t('profile.logout')}
          destructive
          left={
            <View style={[styles.iconWedge, { backgroundColor: colors.brandRedTint }]}>
              <Icon name="logout" size={16} color={colors.brandRed} />
            </View>
          }
          onPress={confirmLogout}
          showChevron={false}
          isLast
        />
      </View>
    </ScrollView>
  );
}

function SectionEyebrow({
  label,
  colors,
  isAr,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
  isAr: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  titleBlock: { marginBottom: spacing.lg },
  eyebrow: { marginBottom: 6 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  section: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  switchRow: {
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    minHeight: 56,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWedge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

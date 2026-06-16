import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronRight, Pencil} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {profileStyles as ps} from './profileStyles';
import type {UserDocumentDto} from '../../../api/types';

export type ProfileScreenProps = {
  fullName: string;
  email: string;
  countryLabel: string;
  avatarInitial: string;
  completionPct: number;
  completionHint: string;
  academic: {
    qualification: string;
    subjects: string;
    grades?: string;
    graduationYear: string;
  };
  studyPrefs: {
    countries: string;
    field: string;
    budget: string;
  };
  documents: {key: string; label: string; status: string; uploaded: boolean}[];
  counselor: {
    name: string;
    role: string;
    location: string;
    rating: string;
    placed: string;
    initials: string;
  } | null;
  onEditProfile: () => void;
  onStudyPreferences: () => void;
  onUploadDocument: (key: string) => void;
  onNotifications: () => void;
  onAbout: () => void;
  onAccount: () => void;
  onHelp: () => void;
  onLogout: () => void;
};

function Section({
  title,
  children,
  onPress,
}: {
  title: string;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const body = (
    <View style={ps.section}>
      <Text style={ps.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{body}</Pressable>;
  }
  return body;
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={ps.infoRow}>
      <Text style={ps.infoLabel}>{label}</Text>
      <Text style={ps.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function SettingsRow({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable style={ps.settingsRow} onPress={onPress}>
      <Text style={ps.settingsLabel}>{label}</Text>
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export function ProfileScreen({
  fullName,
  email,
  countryLabel,
  avatarInitial,
  completionPct,
  completionHint,
  academic,
  studyPrefs,
  documents,
  counselor,
  onEditProfile,
  onStudyPreferences,
  onUploadDocument,
  onNotifications,
  onAbout,
  onAccount,
  onHelp,
  onLogout,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={ps.screen}
      contentContainerStyle={[
        ps.scroll,
        {paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24},
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={ps.pageTitle}>My Profile</Text>

      {/* Avatar card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarInitial}>{avatarInitial}</Text>
        </View>
        <View style={styles.avatarMeta}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <Text style={styles.country}>{countryLabel}</Text>
      </View>

      <Pressable style={ps.editBtn} onPress={onEditProfile}>
        <Text style={ps.editBtnLabel}>Edit profile</Text>
      </Pressable>

      <View style={styles.progressWrap}>
        <View style={ps.progressTrack}>
          <View style={[ps.progressFill, {width: `${completionPct}%`}]} />
        </View>
        <Text style={ps.progressHint}>{completionHint}</Text>
      </View>

      <Section title="Academic Info">
        <InfoRow label="Highest qualification" value={academic.qualification} />
        <InfoRow label="Subjects" value={academic.subjects} />
        {academic.grades ? (
          <InfoRow label="Grades / GPA" value={academic.grades} />
        ) : null}
        <InfoRow label="Graduation year" value={academic.graduationYear} />
      </Section>

      <Section title="My Documents">
        {documents.map(doc => (
          <View key={doc.key} style={styles.docRow}>
            <View style={styles.docLeft}>
              <Text style={styles.docTitle}>{doc.label}</Text>
              <Text
                style={[
                  styles.docStatus,
                  doc.uploaded ? styles.docUploaded : styles.docPending,
                ]}>
                {doc.status}
              </Text>
            </View>
            <Pressable onPress={() => onUploadDocument(doc.key)} hitSlop={8}>
              <Text style={styles.uploadLink}>Upload →</Text>
            </Pressable>
          </View>
        ))}
      </Section>

      <View style={styles.studyPrefsBlock}>
        <View style={styles.studyPrefsHeader}>
          <Text style={ps.sectionTitleStandalone}>Study preferences</Text>
          <Pressable
            style={({pressed}) => [
              styles.studyPrefsEditBtn,
              pressed && styles.studyPrefsEditBtnPressed,
            ]}
            onPress={onStudyPreferences}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit study preferences">
            <Pencil size={16} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View style={ps.section}>
          <InfoRow label="Preferred countries" value={studyPrefs.countries} />
          <InfoRow label="Field of study" value={studyPrefs.field} />
          <InfoRow label="Budget range" value={studyPrefs.budget} />
        </View>
      </View>

      {counselor ? (
        <Section title="Your counselor">
          <View style={styles.counselorRow}>
            <View style={styles.counselorAvatar}>
              <Text style={styles.counselorInitials}>{counselor.initials}</Text>
            </View>
            <View style={styles.counselorMeta}>
              <Text style={styles.counselorName}>{counselor.name}</Text>
              <Text style={styles.counselorRole}>{counselor.role}</Text>
              <Text style={styles.counselorLoc}>{counselor.location}</Text>
              <View style={styles.counselorStats}>
                <Text style={styles.counselorStat}>{counselor.rating}</Text>
                <Text style={styles.counselorStatDot}> · </Text>
                <Text style={styles.counselorStat}>{counselor.placed}</Text>
              </View>
            </View>
          </View>
          <View style={styles.counselorActions}>
            <Pressable style={styles.counselorBtn}>
              <Text style={styles.counselorBtnLabel}>WhatApp</Text>
            </Pressable>
            <Pressable style={[styles.counselorBtn, styles.counselorBtnPrimary]}>
              <Text style={styles.counselorBtnLabelPrimary}>Message in app</Text>
            </Pressable>
          </View>
          <Text style={styles.counselorHint}>
            {counselor.name.split(' ')[0]} is your dedicated counsellor. Reach out anytime.
          </Text>
        </Section>
      ) : null}

      <Section title="Settings">
        <SettingsRow label="Notifications" onPress={onNotifications} />
        <SettingsRow label="About us" onPress={onAbout} />
        <SettingsRow label="Account & security" onPress={onAccount} />
        <SettingsRow label="Help & support" onPress={onHelp} />
      </Section>

      <Pressable style={ps.logout} onPress={onLogout}>
        <Text style={ps.logoutLabel}>-→ Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitial: {fontSize: 28, fontWeight: '800', color: colors.white},
  avatarMeta: {alignItems: 'center', marginBottom: 4},
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 22,
  },
  email: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  country: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  progressWrap: {marginBottom: 14},
  studyPrefsBlock: {marginBottom: 14},
  studyPrefsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studyPrefsEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyPrefsEditBtnPressed: {opacity: 0.85},
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docLeft: {flex: 1},
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 18,
  },
  docStatus: {fontSize: 12, fontWeight: '500', lineHeight: 16, marginTop: 2},
  docUploaded: {color: colors.textSecondary},
  docPending: {color: colors.textMuted},
  uploadLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 16,
  },
  counselorRow: {flexDirection: 'row', gap: 12, marginBottom: 12},
  counselorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counselorInitials: {fontSize: 20, fontWeight: '800', color: colors.white},
  counselorMeta: {flex: 1},
  counselorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 22,
  },
  counselorRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 16,
    marginTop: 1,
  },
  counselorLoc: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    lineHeight: 14,
    marginTop: 2,
  },
  counselorStats: {flexDirection: 'row', marginTop: 4},
  counselorStat: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 14,
  },
  counselorStatDot: {fontSize: 11, color: colors.textSecondary},
  counselorActions: {flexDirection: 'row', gap: 10, marginBottom: 10},
  counselorBtn: {
    flex: 1,
    height: 40,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  counselorBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counselorBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  counselorBtnLabelPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  counselorHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

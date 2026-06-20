import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronRight, MessageCircle, Pencil, Upload} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WaveHeader} from '../../../components/WaveHeader';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {profileStyles as ps} from './profileStyles';

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
  onEditAcademic: () => void;
  onStudyPreferences: () => void;
  onUploadDocument: (key: string) => void;
  onNotifications: () => void;
  onAbout: () => void;
  onAccount: () => void;
  onHelp: () => void;
  onLogout: () => void;
};

function SectionEditButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        ps.sectionEditBtn,
        pressed && ps.sectionEditBtnPressed,
      ]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Pencil size={16} color={colors.white} strokeWidth={2.5} />
    </Pressable>
  );
}

function SectionHeader({
  title,
  onEdit,
  editLabel,
}: {
  title: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <View style={ps.sectionHeaderRow}>
      <Text style={ps.sectionTitleStandalone}>{title}</Text>
      {onEdit ? (
        <SectionEditButton label={editLabel ?? `Edit ${title}`} onPress={onEdit} />
      ) : null}
    </View>
  );
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

function DocumentUploadIcon() {
  return (
    <View style={styles.docIconWrap}>
      <View style={styles.docIconCircle}>
        <Upload size={12} color={colors.white} strokeWidth={2.5} />
      </View>
    </View>
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
  onEditAcademic,
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
    <View style={ps.screen}>
      <WaveHeader title="My Profile" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          ps.scroll,
          styles.scrollContent,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Profile card — Figma node 620:894 Frame 121075722 */}
        <View style={ps.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.email}>{email}</Text>
              <Text style={styles.country}>{countryLabel}</Text>
            </View>
          </View>

          <PrimaryButton
            label="Edit profile"
            onPress={onEditProfile}
            style={styles.editProfileBtn}
          />
        </View>

        <View style={styles.progressWrap}>
          <View style={ps.progressTrack}>
            <View style={[ps.progressFill, {width: `${completionPct}%`}]} />
          </View>
          <Text style={ps.progressHint}>{completionHint}</Text>
        </View>

        {/* Academic Info — Figma: title + edit icon opens Edit profile (680:10634) */}
        <SectionHeader
          title="Academic Info"
          onEdit={onEditAcademic}
          editLabel="Edit academic info"
        />
        <View style={ps.section}>
          <InfoRow label="Highest qualification" value={academic.qualification} />
          <InfoRow label="Subjects" value={academic.subjects} />
          {/* Grades / GPA shown on expanded academic screen; hidden on main profile per Figma 620:894 */}
          {/* {academic.grades ? (
            <InfoRow label="Grades / GPA" value={academic.grades} />
          ) : null} */}
          <InfoRow label="Graduation year" value={academic.graduationYear} />
        </View>

        <SectionHeader title="My Documents" />
        <View style={ps.section}>
          {documents.map(doc => (
            <View key={doc.key} style={styles.docRow}>
              <DocumentUploadIcon />
              <View style={styles.docBody}>
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
        </View>

        <SectionHeader
          title="Study preferences"
          onEdit={onStudyPreferences}
          editLabel="Edit study preferences"
        />
        <View style={ps.section}>
          <InfoRow label="Preferred countries" value={studyPrefs.countries} />
          <InfoRow label="Field of study" value={studyPrefs.field} />
          <InfoRow label="Budget range" value={studyPrefs.budget} />
        </View>

        {/* Counselor — placeholder until dedicated counselor API is available */}
        {counselor ? (
          <>
            <SectionHeader title="Your counselor" />
            <View style={ps.section}>
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
                {/* onWhatsApp — wire when counselor contact API is available */}
                <Pressable style={styles.counselorBtnWhatsApp}>
                  <MessageCircle size={16} color={colors.white} />
                  <Text style={styles.counselorBtnWhatsAppLabel}>WhatsApp</Text>
                </Pressable>
                {/* onMessageInApp — wire when in-app messaging API is available */}
                <Pressable style={styles.counselorBtnPrimary}>
                  <Text style={styles.counselorBtnPrimaryLabel}>Message in app</Text>
                </Pressable>
              </View>
              <Text style={styles.counselorHint}>
                {counselor.name.split(' ')[0]} is your dedicated counsellor. Reach out anytime.
              </Text>
            </View>
          </>
        ) : null}

        <SectionHeader title="Settings" />
        <View style={ps.section}>
          <SettingsRow label="Notifications" onPress={onNotifications} />
          <SettingsRow label="About us" onPress={onAbout} />
          <SettingsRow label="Account & security" onPress={onAccount} />
          <SettingsRow label="Help & support" onPress={onHelp} />
        </View>

        <Pressable style={ps.logout} onPress={onLogout}>
          <Text style={ps.logoutLabel}>-→ Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  scrollContent: {marginTop: -12},
  profileRow: {flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14},
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {fontSize: 24, fontWeight: '800', color: colors.white},
  profileMeta: {flex: 1},
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 22,
  },
  email: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  country: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  editProfileBtn: {minHeight: 34, borderRadius: 30},
  progressWrap: {marginBottom: 14},
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBody: {flex: 1},
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counselorInitials: {fontSize: 24, fontWeight: '800', color: colors.white},
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
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 1,
  },
  counselorLoc: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
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
  counselorBtnWhatsApp: {
    flex: 1,
    height: 36,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentTeal,
  },
  counselorBtnWhatsAppLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  counselorBtnPrimary: {
    flex: 1,
    height: 36,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  counselorBtnPrimaryLabel: {
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

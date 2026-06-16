import React, {useCallback, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  errorCodes,
  isErrorWithCode,
  pick,
} from '@react-native-documents/picker';

import {
  StartApplicationScreen,
  type RequiredDoc,
} from './StartApplicationScreen';

import {getCourseById} from '../../../api/publicApi';

import {
  documentMatchesUiKey,
  uiKeyToApiDocumentType,
  uploadFilenameForUiKey,
  type ApiDocumentType,
} from '../../../api/documentTypes';

import {
  createApplication,
  getApplications,
  getUserDocuments,
  uploadDocuments,
  type UploadDocumentFile,
} from '../../../api/userApi';

import {countApplications} from '../../../api/applicationsUtils';
import {getApiErrorMessage} from '../../../api/client';
import {DOCUMENT_TYPES} from '../Profile/profileConstants';

import type {AppStackList} from '../../../navigation/AppStackNavigator';

import type {
  CourseListItem,
  UpcomingIntake,
  UserDocumentDto,
} from '../../../api/types';

import {
  formatDeadlineDate,
  intakesForApplication,
  pickDefaultIntake,
} from '../../../utils/applicationFlow';

import {resolvePickedFileForUpload} from '../../../utils/pickedFile';
import {en} from '../../../utils/strings/en';

type Props = NativeStackScreenProps<
  AppStackList,
  'StartApplication'
>;

const APPS_TOTAL = 5;

function mapUploadedDocs(
  docs: UserDocumentDto[] | undefined,
): RequiredDoc[] {
  return DOCUMENT_TYPES.map(def => {
    const match = (docs ?? []).find(d =>
      documentMatchesUiKey(
        d.documentType,
        def.key,
        d.filename,
      ),
    );

    return {
      key: def.key,
      label: def.label,
      uploaded: !!match,
      documentUrl: match?.documentUrl,
    };
  });
}

export function StartApplicationContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackList>>();

  const route = useRoute<Props['route']>();
  const queryClient = useQueryClient();

  const {
    courseId,
    matchPct = 88,
    universityName: routeUni,
    courseData,
  } = route.params;

  const passedCourse: CourseListItem | null = useMemo(() => {
    if (!courseData) {
      return null;
    }

    try {
      return JSON.parse(courseData) as CourseListItem;
    } catch {
      return null;
    }
  }, [courseData]);

  const [uploadingKey, setUploadingKey] = useState<string | null>(
    null,
  );

  const [selectedIntake, setSelectedIntake] =
    useState<UpcomingIntake | null>(null);

  /**
   * Course Query
   */
  const {
    data: fetchedCourse,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !passedCourse,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const course = passedCourse ?? fetchedCourse ?? null;

  const courseLoadFailed =
    !course && !courseLoading && (courseError || !passedCourse);

  /**
   * Intake Handling
   */
  const intakes = course
    ? intakesForApplication(course)
    : [];

  const activeIntake =
    selectedIntake ?? pickDefaultIntake(intakes);

  /**
   * User Documents Query
   */
  const {data: userDocs} = useQuery({
    queryKey: ['userDocuments'],
    queryFn: getUserDocuments,
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Applications Query
   */
  const {data: applications} = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    staleTime: 5 * 60 * 1000,
  });

  const appsUsed = countApplications(applications);

  const requiredDocs = useMemo(
    () => mapUploadedDocs(userDocs),
    [userDocs],
  );

  const deadlineDate = formatDeadlineDate(
    activeIntake?.applicationDeadline,
  );

  /**
   * Upload Mutation
   */
  const {mutate: doUpload} = useMutation({
    mutationFn: ({
      documentType,
      files,
    }: {
      documentType: ApiDocumentType;
      files: UploadDocumentFile[];
    }) => uploadDocuments(documentType, files),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userDocuments'],
      });

      setUploadingKey(null);
    },

    onError: (e: Error) => {
      setUploadingKey(null);

      Alert.alert(
        'Upload failed',
        getApiErrorMessage(e, en.errors.generic),
      );
    },
  });

  /**
   * Submit Application Mutation
   */
  const {
    mutate: submitApplication,
    isPending: submitting,
  } = useMutation({
    mutationFn: () => createApplication({courseId}),

    onSuccess: app => {
      queryClient.invalidateQueries({
        queryKey: ['applications'],
      });

      const fee = course?.applicationFee ?? 0;

      const courseName =
        course?.name ?? route.params.courseName;

      const universityName =
        course?.universityName ?? routeUni;

      if (fee > 0) {
        navigation.replace('ApplicationPayment', {
          applicationId: app.id,
          courseId,
          courseName,
          universityName,
          applicationFee: fee,
          currencySymbol: course?.currencySymbol,
        });

        return;
      }

      navigation.replace('ApplicationSubmitted', {
        applicationId: app.id,
        courseName,
        universityName,
      });
    },

    onError: (e: Error) => {
      Alert.alert(
        'Submission failed',
        getApiErrorMessage(e, en.errors.generic),
      );
    },
  });

  /**
   * Back Handler
   */
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Upload Document Handler
   */
  const onUploadDoc = useCallback(
    async (docKey: string) => {
      const apiType = uiKeyToApiDocumentType(docKey);

      console.log('docKey =>', docKey);
      console.log('apiType =>', apiType);

      if (!apiType) {
        Alert.alert(
          'Error',
          'Unsupported document type.',
        );
        return;
      }

      try {
        const result = await pick({
          allowMultiSelection: false,
          type: [
            'application/pdf',
            'image/jpeg',
            'image/png',
          ],
        });

        const picked = result[0];

        if (!picked?.uri) {
          Alert.alert(
            'Error',
            'Could not read the selected file.',
          );
          return;
        }

        /**
         * Max file size: 5MB
         */
        if (
          picked.size &&
          picked.size > 5 * 1024 * 1024
        ) {
          Alert.alert(
            'Error',
            'File is too large. Please select a file smaller than 5MB.',
          );
          return;
        }

        const local =
          await resolvePickedFileForUpload(picked);

        setUploadingKey(docKey);

        doUpload({
          documentType: apiType,
          files: [
            {
              uri: local.uri,
              name: uploadFilenameForUiKey(
                docKey,
                local.name,
              ),
              type: local.type,
            },
          ],
        });
      } catch (err) {
        if (
          isErrorWithCode(err) &&
          err.code === errorCodes.OPERATION_CANCELED
        ) {
          return;
        }

        Alert.alert(
          'Upload failed',
          getApiErrorMessage(
            err,
            'File selection failed.',
          ),
        );
      }
    },
    [doUpload],
  );

  /**
   * Submit Handler
   */
  const onSubmit = useCallback(() => {
    const allUploaded = requiredDocs.every(
      d => d.uploaded,
    );

    if (!allUploaded) {
      Alert.alert(
        'Missing Documents',
        'Please upload all required documents.',
      );
      return;
    }

    if (intakes.length > 0 && !activeIntake) {
      Alert.alert(
        'Unavailable',
        en.applicationFlow.noIntake,
      );
      return;
    }

    const intakeNote = activeIntake
      ? `\n\nIntake: ${activeIntake.label}`
      : '';

    Alert.alert(
      en.applicationFlow.submitConfirmTitle,
      en.applicationFlow.submitConfirmBody +
        intakeNote,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: () => submitApplication(),
        },
      ],
    );
  }, [
    requiredDocs,
    activeIntake,
    intakes.length,
    submitApplication,
  ]);

  return (
    <StartApplicationScreen
      course={course}
      courseLoading={courseLoading && !course}
      courseLoadFailed={courseLoadFailed}
      matchPct={matchPct}
      requiredDocs={requiredDocs}
      uploadingKey={uploadingKey}
      applicationFee={course?.applicationFee}
      deadlineDate={deadlineDate}
      intakes={intakes}
      selectedIntakeId={activeIntake?.id}
      onSelectIntake={setSelectedIntake}
      submitting={submitting}
      appsUsed={appsUsed}
      appsTotal={APPS_TOTAL}
      onBack={onBack}
      onUploadDoc={onUploadDoc}
      onSubmit={onSubmit}
    />
  );
}
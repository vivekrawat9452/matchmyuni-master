import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
  type FeeBreakdownRow,
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
  getApplicationsByIds,
  getUserDetails,
  getUserDocuments,
  uploadDocuments,
  type UploadDocumentFile,
} from '../../../api/userApi';

import {
  countApplications,
  flattenApplicationItems,
} from '../../../api/applicationsUtils';
import {getApiErrorMessage} from '../../../api/client';
import {DOCUMENT_TYPES} from '../Profile/profileConstants';

import type {AppStackList} from '../../../navigation/AppStackNavigator';

import type {
  ApplicationFeeDto,
  CourseListItem,
  UpcomingIntake,
  UserDocumentDto,
} from '../../../api/types';

import {
  deadlineRelativeLabel,
  formatDeadlineDate,
  intakesForApplication,
  pickDefaultIntake,
} from '../../../utils/applicationFlow';
import {buildCourseCostBreakdown} from '../CourseDetails/courseCostBreakdown';

import {resolvePickedFileForUpload} from '../../../utils/pickedFile';
import {en} from '../../../utils/strings/en';

type Props = NativeStackScreenProps<AppStackList, 'StartApplication'>;

const FLOW_LOG = '[StartApplication 560:826]';
const DOCS_LOG = '[StartApplication What you\'ll need]';
const APPS_TOTAL = 5;

const FEE_TYPE_LABELS: Record<ApplicationFeeDto['feeType'], string> = {
  application_fee: 'Application fee',
  registration_fee: 'Registration fee',
  tuition_fee: 'Tuition fee',
};

function logSkippedSection(section: string, reason: string) {
  console.log(FLOW_LOG, `${section} skipped — ${reason}`);
}

function mapUploadedDocs(docs: UserDocumentDto[] | undefined): RequiredDoc[] {
  return DOCUMENT_TYPES.map(def => {
    const match = (docs ?? []).find(d =>
      documentMatchesUiKey(d.documentType, def.key, d.filename),
    );

    return {
      key: def.key,
      label: def.label,
      uploaded: !!match,
      documentUrl: match?.documentUrl,
    };
  });
}

function feeRowsFromApplicationFees(
  fees: ApplicationFeeDto[] | undefined,
): FeeBreakdownRow[] {
  if (!fees?.length) {
    return [];
  }
  return fees.map(f => ({
    label: FEE_TYPE_LABELS[f.feeType] ?? f.feeType,
    amount: f.requiredAmount,
    status: f.status,
  }));
}

/** Projected fees from GET /courses/:id before an application exists. */
function feeRowsFromCourse(course: CourseListItem): FeeBreakdownRow[] {
  const rows: FeeBreakdownRow[] = [];

  if (course.applicationFee != null && course.applicationFee > 0) {
    rows.push({label: 'Application fee', amount: course.applicationFee});
  }
  if (course.registrationFee != null && course.registrationFee > 0) {
    rows.push({label: 'Registration fee', amount: course.registrationFee});
  }
  if (course.depositFee != null && course.depositFee > 0) {
    rows.push({label: 'Deposit fee', amount: course.depositFee});
  }
  if (course.applicableTuitionFee != null && course.applicableTuitionFee > 0) {
    rows.push({label: 'Tuition (year 1)', amount: course.applicableTuitionFee});
  }
  if (course.examinationFee != null && course.examinationFee > 0) {
    rows.push({label: 'Examination fee', amount: course.examinationFee});
  }
  if (course.hostelFee != null && course.hostelFee > 0) {
    rows.push({label: 'Hostel fee', amount: course.hostelFee});
  }
  if (course.foodFee != null && course.foodFee > 0) {
    rows.push({label: 'Food fee', amount: course.foodFee});
  }
  for (const other of course.otherFees ?? []) {
    if (other.amount > 0) {
      rows.push({label: other.name, amount: other.amount});
    }
  }

  return rows;
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

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [selectedIntake, setSelectedIntake] =
    useState<UpcomingIntake | null>(null);

  useEffect(() => {
    logSkippedSection(
      'Visa rate badge',
      'no visa rate field in prompts/API_Docs.md or prompts/apis',
    );
  }, []);

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

  useEffect(() => {
    if (course && !courseLoading) {
      console.log(FLOW_LOG, 'course ready', {
        courseId: course.id,
        source: fetchedCourse ? 'GET /courses/:id' : 'navigation courseData',
        applicationFee: course.applicationFee,
        depositFee: course.depositFee,
        currencySymbol: course.currencySymbol,
        registrationFee: course.registrationFee,
        applicableTuitionFee: course.applicableTuitionFee,
        isPrime: course.isPrime,
        intakes: course.upcomingIntakes?.length ?? course.intakes?.length ?? 0,
      });
    }
  }, [course, fetchedCourse, courseLoading]);

  const {data: userDetails} = useQuery({
    queryKey: ['userDetails'],
    queryFn: getUserDetails,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (userDetails) {
      console.log(FLOW_LOG, 'user context', {
        source: 'GET /user/details',
        userId: userDetails.user?.id,
        hasProfile: userDetails.studentProfile != null,
      });
    }
  }, [userDetails]);

  const intakes = course ? intakesForApplication(course) : [];
  const activeIntake = selectedIntake ?? pickDefaultIntake(intakes);

  const {data: userDocs} = useQuery({
    queryKey: ['userDocuments'],
    queryFn: getUserDocuments,
    staleTime: 5 * 60 * 1000,
  });

  const {data: applications} = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    staleTime: 5 * 60 * 1000,
  });

  const existingApplicationId = useMemo(() => {
    const items = flattenApplicationItems(applications);
    return items.find(i => i.course.id === courseId)?.application.id;
  }, [applications, courseId]);

  const {data: applicationDetailsList} = useQuery({
    queryKey: ['applicationDetails', existingApplicationId],
    queryFn: () => getApplicationsByIds([existingApplicationId!]),
    enabled: !!existingApplicationId,
    staleTime: 5 * 60 * 1000,
  });

  const applicationDetail = applicationDetailsList?.[0] ?? null;

  useEffect(() => {
    if (existingApplicationId && applicationDetail) {
      console.log(FLOW_LOG, 'application detail', {
        source: 'GET /applications/by-ids',
        applicationId: existingApplicationId,
        status: applicationDetail.application?.status,
        applicationFees: applicationDetail.applicationFees,
      });
    } else if (!existingApplicationId && applications) {
      logSkippedSection(
        'GET /applications/by-ids',
        'no existing application for this course — using GET /courses/:id fee projection',
      );
    }
  }, [existingApplicationId, applicationDetail, applications]);

  const appsUsed = countApplications(applications);

  const requiredDocs = useMemo(
    () => mapUploadedDocs(userDocs),
    [userDocs],
  );

  useEffect(() => {
    if (userDocs == null) {
      return;
    }
    console.log(DOCS_LOG, 'document rows', {
      source: 'GET /user/documents',
      apiCount: userDocs.length,
      apiTypes: userDocs.map(d => ({
        type: d.documentType,
        filename: d.filename,
      })),
      uiRows: requiredDocs.map(d => ({
        key: d.key,
        uploaded: d.uploaded,
      })),
    });
  }, [userDocs, requiredDocs]);

  const deadlineDate = formatDeadlineDate(activeIntake?.applicationDeadline);
  const deadlineRelative = deadlineRelativeLabel(
    activeIntake?.applicationDeadline,
  );

  const projectedFeeRows = useMemo(
    () => (course ? feeRowsFromCourse(course) : []),
    [course],
  );

  const applicationBreakdown = useMemo((): FeeBreakdownRow[] => {
    const fromApi = feeRowsFromApplicationFees(applicationDetail?.applicationFees);
    if (fromApi.length) {
      console.log(FLOW_LOG, 'Application Breakdown', {
        source: 'GET /applications/by-ids applicationFees',
        rows: fromApi.length,
      });
      return fromApi;
    }
    if (projectedFeeRows.length) {
      console.log(FLOW_LOG, 'Application Breakdown', {
        source: 'GET /courses/:id fee fields (projected)',
        rows: projectedFeeRows.length,
      });
      return projectedFeeRows;
    }
    return [];
  }, [applicationDetail?.applicationFees, projectedFeeRows]);

  const costBreakdown = useMemo(
    () => (course ? buildCourseCostBreakdown(course) : null),
    [course],
  );

  useEffect(() => {
    if (!course || !costBreakdown) {
      return;
    }
    console.log(FLOW_LOG, 'Cost Breakdown', {
      source: 'GET /courses/:id fee fields',
      firstYearTotal: costBreakdown.firstYearTotal,
      recurringYearlyCost: costBreakdown.recurringYearlyCost,
      lineItems: costBreakdown.lineItems.length,
    });
  }, [course, costBreakdown]);

  const applicationFeeAmount = useMemo(() => {
    const fromDetail = applicationDetail?.applicationFees?.find(
      f => f.feeType === 'application_fee',
    );
    if (fromDetail != null) {
      return fromDetail.requiredAmount;
    }
    return (
      projectedFeeRows.find(r => r.label === 'Application fee')?.amount ?? null
    );
  }, [applicationDetail?.applicationFees, projectedFeeRows]);

  useEffect(() => {
    if (!course) {
      return;
    }
    if (course.depositFee == null || course.depositFee === 0) {
      logSkippedSection(
        'Application fee card',
        'depositFee is 0 or absent on GET /courses/:id',
      );
    } else {
      console.log(FLOW_LOG, 'Application fee card', {
        source: 'GET /courses/:id depositFee',
        currencySymbol: course.currencySymbol,
        depositFee: course.depositFee,
      });
    }
  }, [course]);

  const {mutate: doUpload} = useMutation({
    mutationFn: ({
      documentType,
      files,
      uiDocKey,
    }: {
      documentType: ApiDocumentType;
      files: UploadDocumentFile[];
      uiDocKey: string;
    }) => uploadDocuments(documentType, files),

    onSuccess: (uploaded, {documentType, uiDocKey}) => {
      console.log(DOCS_LOG, 'upload success', {
        source: 'POST /user/documents',
        uiDocKey,
        documentType,
        uploadedCount: uploaded.length,
        filenames: uploaded.map(d => d.filename),
      });
      queryClient.invalidateQueries({queryKey: ['userDocuments']});
      setUploadingKey(null);
    },

    onError: (e: Error, {documentType, uiDocKey}) => {
      console.error(DOCS_LOG, 'upload failed', {
        source: 'POST /user/documents',
        uiDocKey,
        documentType,
        error: e.message,
      });
      setUploadingKey(null);
      Alert.alert('Upload failed', getApiErrorMessage(e, en.errors.generic));
    },
  });

  const {mutate: submitApplication, isPending: submitting} = useMutation({
    mutationFn: () => {
      const intakeId =
        activeIntake && activeIntake.id > 0 ? activeIntake.id : undefined;
      return createApplication({courseId, intakeId});
    },

    onSuccess: app => {
      console.log(FLOW_LOG, 'create application success', {
        applicationId: app.id,
        courseId: app.courseId,
        intakeId: app.intakeId,
        status: app.status,
        feeCurrency: app.feeCurrency,
      });
      queryClient.invalidateQueries({queryKey: ['applications']});

      const fee = applicationFeeAmount ?? course?.applicationFee ?? 0;
      const courseName = course?.name ?? route.params.courseName;
      const universityName = course?.universityName ?? routeUni;

      const courseDataJson = course
        ? JSON.stringify(course)
        : route.params.courseData;

      if (fee > 0) {
        navigation.replace('ApplicationPayment', {
          applicationId: app.id,
          courseId,
          courseName,
          universityName,
          applicationFee: fee,
          currencySymbol: course?.currencySymbol,
          matchPct: route.params.matchPct,
          courseData: courseDataJson,
        });
        return;
      }

      navigation.replace('ApplicationSubmitted', {
        applicationId: app.id,
        courseId,
        courseName,
        universityName,
        matchPct: route.params.matchPct,
        courseData: courseDataJson,
        intakeLabel: app.intakeLabel ?? activeIntake?.label,
      });
    },

    onError: (e: Error) => {
      console.error(FLOW_LOG, 'create application failed', {
        courseId,
        intakeId:
          activeIntake && activeIntake.id > 0 ? activeIntake.id : undefined,
        err: e,
      });
      Alert.alert(
        'Submission failed',
        getApiErrorMessage(e, en.errors.generic),
      );
    },
  });

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onUploadDoc = useCallback(
    async (docKey: string) => {
      console.log(DOCS_LOG, 'upload tapped', {uiDocKey: docKey});

      const apiType = uiKeyToApiDocumentType(docKey);
      console.log(DOCS_LOG, 'document type mapping', {
        uiDocKey: docKey,
        apiDocumentType: apiType ?? null,
        spec: 'prompts/apis/user-documents.md documentTypes',
      });

      if (!apiType) {
        console.error(DOCS_LOG, 'unsupported ui key — no API documentTypes mapping', {
          uiDocKey: docKey,
        });
        Alert.alert('Error', 'Unsupported document type.');
        return;
      }

      try {
        console.log(DOCS_LOG, 'opening file picker', {
          allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
          ],
        });

        const result = await pick({
          allowMultiSelection: false,
          type: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
          ],
        });

        const picked = result[0];
        console.log(DOCS_LOG, 'file picked', {
          name: picked?.name,
          type: picked?.type,
          size: picked?.size,
          uriPrefix: picked?.uri?.slice(0, 48),
        });

        if (!picked?.uri) {
          console.warn(DOCS_LOG, 'picker returned no uri');
          Alert.alert('Error', 'Could not read the selected file.');
          return;
        }

        if (picked.size && picked.size > 5 * 1024 * 1024) {
          console.warn(DOCS_LOG, 'file too large', {sizeBytes: picked.size});
          Alert.alert(
            'Error',
            'File is too large. Please select a file smaller than 5MB.',
          );
          return;
        }

        const local = await resolvePickedFileForUpload(picked);
        console.log(DOCS_LOG, 'file resolved for upload', {
          name: local.name,
          type: local.type,
          uriPrefix: local.uri.slice(0, 48),
        });

        const uploadFile = {
          uri: local.uri,
          name: uploadFilenameForUiKey(docKey, local.name),
          type: local.type,
        };

        setUploadingKey(docKey);

        console.log(DOCS_LOG, 'calling POST /user/documents', {
          uiDocKey: docKey,
          documentType: apiType,
          filename: uploadFile.name,
          mimeType: uploadFile.type,
        });

        doUpload({
          documentType: apiType,
          uiDocKey: docKey,
          files: [uploadFile],
        });
      } catch (err) {
        if (
          isErrorWithCode(err) &&
          err.code === errorCodes.OPERATION_CANCELED
        ) {
          console.log(DOCS_LOG, 'picker cancelled');
          return;
        }

        console.error(DOCS_LOG, 'pick/resolve failed', {
          uiDocKey: docKey,
          error: err instanceof Error ? err.message : String(err),
        });

        Alert.alert(
          'Upload failed',
          getApiErrorMessage(err, 'File selection failed.'),
        );
      }
    },
    [doUpload],
  );

  const onSubmit = useCallback(() => {
    const allUploaded = requiredDocs.every(d => d.uploaded);

    if (!allUploaded) {
      Alert.alert(
        'Missing Documents',
        'Please upload all required documents.',
      );
      return;
    }

    if (intakes.length > 0 && !activeIntake) {
      Alert.alert('Unavailable', en.applicationFlow.noIntake);
      return;
    }

    const intakeNote = activeIntake
      ? `\n\nIntake: ${activeIntake.label}`
      : '';

    Alert.alert(
      en.applicationFlow.submitConfirmTitle,
      en.applicationFlow.submitConfirmBody + intakeNote,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Submit', onPress: () => submitApplication()},
      ],
    );
  }, [requiredDocs, activeIntake, intakes.length, submitApplication]);

  return (
    <StartApplicationScreen
      course={course}
      courseLoading={courseLoading && !course}
      courseLoadFailed={courseLoadFailed}
      matchPct={matchPct}
      requiredDocs={requiredDocs}
      uploadingKey={uploadingKey}
      applicationBreakdown={applicationBreakdown}
      costBreakdown={costBreakdown}
      deadlineDate={deadlineDate}
      deadlineRelative={deadlineRelative}
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

import React, {useCallback, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentApplicationsShortlistScreen} from './AgentApplicationsShortlistScreen';
import {
  getPartnerStudentShortlist,
  getPartnerStudents,
} from '../../../../api/partnerApi';
import type {PartnerShortlistItemDto} from '../../../../api/partnerTypes';
import type {AgentApplicationsStackList} from '../../../../navigation/AgentApplicationsStackNavigator';

export function AgentApplicationsShortlistContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentApplicationsStackList>>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const studentsQuery = useQuery({
    queryKey: ['partner', 'students', 'shortlist-picker'],
    queryFn: () => getPartnerStudents({page: 1, limit: 50}),
    staleTime: 60 * 1000,
  });

  const students = studentsQuery.data?.students ?? [];
  const activeUserId = selectedUserId ?? students[0]?.userId ?? null;

  const shortlistQuery = useQuery({
    queryKey: ['partner', 'student', activeUserId, 'shortlist'],
    queryFn: () => getPartnerStudentShortlist(activeUserId!),
    enabled: activeUserId != null,
    staleTime: 60 * 1000,
  });

  const enrichedShortlist = useMemo(() => {
    const student = students.find(s => s.userId === activeUserId);
    return (shortlistQuery.data ?? []).map((item: PartnerShortlistItemDto) => ({
      ...item,
      studentUserId: activeUserId ?? undefined,
      studentName: student?.name,
    }));
  }, [activeUserId, shortlistQuery.data, students]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AgentApplicationsShortlistScreen
      students={students}
      selectedUserId={activeUserId}
      shortlist={enrichedShortlist}
      loading={studentsQuery.isLoading || shortlistQuery.isLoading}
      refreshing={shortlistQuery.isRefetching}
      onRefresh={() => void shortlistQuery.refetch()}
      onSelectStudent={setSelectedUserId}
      onBack={onBack}
    />
  );
}

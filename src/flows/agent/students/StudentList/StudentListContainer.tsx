import React, {useCallback, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {StudentListScreen} from './StudentListScreen';
import {getPartnerStudents} from '../../../../api/partnerApi';
import type {StudentFilterTab} from '../../../../api/partnerTypes';
import type {AgentStudentsStackList} from '../../../../navigation/AgentStudentsStackNavigator';

export function StudentListContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStudentsStackList>>();
  const [filter, setFilter] = useState<StudentFilterTab>('all');
  const [search, setSearch] = useState('');

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'students', filter, search],
    queryFn: () =>
      getPartnerStudents({
        filter,
        search: search.trim() || undefined,
        page: 1,
        limit: 50,
      }),
    staleTime: 60 * 1000,
  });

  const onAddStudent = useCallback(() => {
    navigation.navigate('AddStudent');
  }, [navigation]);

  const onStudentPress = useCallback(
    (userId: string) => {
      navigation.navigate('StudentProfile', {userId});
    },
    [navigation],
  );

  return (
    <StudentListScreen
      students={data?.students}
      filterCounts={data?.filterCounts}
      total={data?.total ?? 0}
      filter={filter}
      search={search}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onFilterChange={setFilter}
      onSearchChange={setSearch}
      onAddStudent={onAddStudent}
      onStudentPress={onStudentPress}
    />
  );
}

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StudentListContainer} from '../flows/agent/students/StudentList/StudentListContainer';
import {AddStudentContainer} from '../flows/agent/students/AddStudent/AddStudentContainer';
import {StudentProfileContainer} from '../flows/agent/students/StudentProfile/StudentProfileContainer';
import {StudentApplicationContainer} from '../flows/agent/students/StudentApplication/StudentApplicationContainer';

export type AgentStudentsStackList = {
  StudentList: undefined;
  AddStudent: undefined;
  StudentProfile: {userId: string};
  StudentApplication: {applicationId: string};
};

const Stack = createNativeStackNavigator<AgentStudentsStackList>();

export function AgentStudentsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="StudentList" component={StudentListContainer} />
      <Stack.Screen
        name="AddStudent"
        component={AddStudentContainer}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="StudentApplication"
        component={StudentApplicationContainer}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}

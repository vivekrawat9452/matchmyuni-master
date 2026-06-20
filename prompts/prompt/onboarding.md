1>using figma dump @assets/studentflow/figma/student_flow_screen_map.json create accurate screen ui for Onboarding flow in @src/flows/onboarding/  screens

2>show Acoount Detrails screen @src/flows/onboarding/AccountDetails/AccountDetailsContainer.tsx as accurate as figma dump
2.1> same for country picker view
3>study intrest screen @src/flows/onboarding/StudyInterests/StudyInterestsContainer.tsx 
3.1> icons or assets in ui must be similar as the figma 
4> in preparing screen @src/flows/onboarding/Preparing/PreparingContainer.tsx > dont show static country, budget etc show user selected study preferences(dynamic values)
5> signup tutorial screen @src/flows/tutorial/SignupTutorialContainer.tsx >> should be acurate as figma dump 
5.1> there are three signup tutorial overlays in figma >> show then exactly as in figma dump file
6> IMPORTANT>>> signup flow recommended discover courses screen @src/flows/tutorial/SignupTutorialRecommendedScreen.tsx must be exactly like in figma and  like Home tab recommended discover tab @src/flows/main/Discover/DiscoverContainer.tsx 
6.1> even the card swipe functionality and calling of shortlist api on swiping right, and other functionalities,on @src/flows/tutorial/SignupTutorialRecommendedScreen.tsx  must be exactly same as to  @src/flows/main/Discover/DiscoverContainer.tsx screen
Important >> add api logs for all above apis and 
dont remove ui elements from scrreen if they are not persent in api , only comment them for later reusability


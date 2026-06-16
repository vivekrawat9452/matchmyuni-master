Below is Tutorial flow for student role only after signup complete (after preparing screen), 
using below figma access token download all assets require for ui, 
sizes in exact pixels and use as per our app global declaration src/utils/,
color codes exactly as per figma for all child and parent components 
src/utils/colors 
         /themes 
         /styles
** save all the extracted and downloaded files in dir /assets/profile/  **

Personal access token: $FIGMA_TOKEN

*****STRICT NOTES:: *****
1>use grapify graph files for navigation , stacks , components at graph-context/ and graphify-out/
2>try to be as accurate as you can to make screen similar to figma and sceenshot at /prompts/screenshots/profile/
3>(truncated to ~5000 token per screen budget)

1> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=416-5401&t=TWLeHP852hKX9xNw-0
Course details screen>> this opens on click a course from discover page in home screen
already implemeted >> fix if its missing any views> 

2>https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=560-826&t=TWLeHP852hKX9xNw-0
Application Start Screen
this opens when in  Course details screen>> on click Start Application buttton

2.1> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=560-1496&t=TWLeHP852hKX9xNw-0
Application Start Screen >> when all required documents are uploaded
For this screen we need to adda file system library so that user can pick documents from devices


3>if Application Start Screen(2) has payment required start Payment screen flow, empty for now
3.1> if Application Start Screen is free > https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=567-1943&t=TWLeHP852hKX9xNw-0
opens Application submitted screen

****** This Application flow will need apis for it to work , use prompts/apis/applications-student-apis and use prompts/apis/courses-student-apis for courses and course details 
Also apply these apis in the app code where they are required prompts/apis/shortlist-student-apis ******

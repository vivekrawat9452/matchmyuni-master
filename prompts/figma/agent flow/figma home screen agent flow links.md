Below are agent home and my student bottom tab flow  for agent role , 
using curl request for figma for below node ids and access token download all assets require for ui, 
sizes in exact pixels and use as per our app global declaration,
color codes exactly as per figma for all child and parent components
can use some global style library (skip if already installed)
** save all the extracted and downloaded files in dir /assets/agentflow/  **

Personal access token: $FIGMA_TOKEN

For api reference use file : /prompts/

1> Home tab> after agent login> all screens till 3 are under home tab stack 
Api> ### `GET /partner/dashboard`
1.0> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=776-3650&t=VhlNd8jWOdJcJo0l-0
1.1> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=776-3650&t=VhlNd8jWOdJcJo0l-0
2> Notification> navigation from home
2.1>https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=776-8357&t=VhlNd8jWOdJcJo0l-0
3>My Milestone >
### `GET /partner/milestones`
3.1>https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=867-979&t=VhlNd8jWOdJcJo0l-0
3.2>https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=912-3115&t=VhlNd8jWOdJcJo0l-0

2> My students >> 2nd bottom tab > all screens till 5 are under My students tab stack
Api> `GET /partner/students`
4.1>No student screen add student> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=811-1021&t=VhlNd8jWOdJcJo0l-0
4.2>Students list from api>> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=797-1936&t=VhlNd8jWOdJcJo0l-0

5.1> Student profile>api ### `GET /partner/students/:userId`>
 https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=814-960&t=VhlNd8jWOdJcJo0l-0
5.1.1> Student profile dialog box> on click chase from 5.1> https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=859-1758&t=VhlNd8jWOdJcJo0l-0
5.2> Student Application>> navigation from 5.1>
/partner/applications/:id
 https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id=823-7659&t=VhlNd8jWOdJcJo0l-0



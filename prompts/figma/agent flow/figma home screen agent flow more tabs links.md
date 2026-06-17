Below are agent home and my student bottom tab flow  for agent role , 
sizes in exact pixels and use as per our app global declaration,
color codes exactly as per figma for all child and parent components
can use some global style library (skip if already installed)
** save all the extracted and downloaded files in dir /assets/agentflow/  **

Personal access token: $FIGMA_TOKEN

For api reference use file : /prompts/agent flow/


 *********IMPORTANT************    

figmna file url : https://www.figma.com/design/pHnQspQkvUJvE9TyiQN5Zv/MatchMyUni-Mobile-app?node-id={node_ids}

using curl request for figma for below node ids and access token download all assets require for ui, 
Instead of looping through each ID individually, simply join your IDs with a comma and dump all the below screen exact ui data loacally in prompts/figma/agent flow , directory:
Bash
# Example of a single bulk request
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=797:1936,811:1021,814:960" \
     -o "bulk_nodes.json"

In My student tab  when no student is there , on click Add first student 
1> My student tab>> no student Add student on click> > all screens till 3 are under my student tab stack 
1.0>form> node-id=825-978&t=VhlNd8jWOdJcJo0l-0
1.1>form filled ui>node-id=918-2380&t=VhlNd8jWOdJcJo0l-0
1.2> add country >node-id=918-2787&t=VhlNd8jWOdJcJo0l-0
1.3> add country selected >node-id=919-3267&t=VhlNd8jWOdJcJo0l-0
2> Add student> navigation from 1 continue on click
2.1>node-id=826-1997&t=VhlNd8jWOdJcJo0l-0
3>student added > application submitted> node-id=826-1997&t=VhlNd8jWOdJcJo0l-0

--------------------------------------------
Bottom Tabs 
------------

1> 3rd bottom tab> Applications
1.1>node-id=826-2346&t=VhlNd8jWOdJcJo0l-0
1.2> on click "view shortlist from 1.1">> node-id=840-5672&t=VhlNd8jWOdJcJo0l-0
1.3> on click "see all applications" from 1.1> node-id=834-4587&t=VhlNd8jWOdJcJo0l-0
1.4> on click application from 1.3 > node-id=918-1724&t=VhlNd8jWOdJcJo0l-0

2> 4th tab > Matches
2.1> node-id=831-4082&t=VhlNd8jWOdJcJo0l-0
2.2> matches filter> node-id=884-3025&t=VhlNd8jWOdJcJo0l-0
2.3> on click compare from 1.1> node-id=880-1813&t=VhlNd8jWOdJcJo0l-0
2.3> on click shortlist from 1.1> node-id=887-3591&t=VhlNd8jWOdJcJo0l-0

3> 5th tab > my profile
3.1> node-id=831-3548&t=VhlNd8jWOdJcJo0l-0
3.2> profile notification > node-id=909-1811&t=VhlNd8jWOdJcJo0l-0
3.3> profile accounts and security > node-id=909-2236&t=VhlNd8jWOdJcJo0l-0
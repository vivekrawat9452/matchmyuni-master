1>using figma dump @assets/studentflow/figma/student_flow_screen_map.json create accurate screen ui for Application Status screen in @src/flows/main/ApplicationSubmitted/ApplicationSubmittedContainer.tsx  TrackApplicationStatusScreen screen and @src/flows/main/TrackApplicationStatus/TrackApplicationStatusContainer.tsx 
1.1>in Screen @src/flows/main/ApplicationSubmitted/ApplicationSubmittedContainer.tsx  TrackApplicationStatusScreen screen use the same ui component as @src/flows/main/TrackApplicationStatus/TrackApplicationStatusContainer.tsx, as they are same screen in figma. 
2>show UI as exactly as per the figmaid respective views and navigations to respective screens
2.1>Show course details and breakdown section >> use api ## GET `/applications/by-ids` >> to show course and other details
2.2>The below progress bar(Your application journey) is static view> but the ticked green progress bar will be acquired using ## GET `/applications/by-ids`
 "status": "created",
Important >> add api logs for all above apis and 
dont remove ui elements from screen if they are not persent in api , only comment them for later reusability


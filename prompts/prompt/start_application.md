1>using figma dump @assets/studentflow/figma/student_flow_screen_map.json create accurate screen ui for Discocver tab @src/flows/main/Discover/DiscoverContainer.tsx screen 
2> use api reference for below student course details screen tab flow  from @prompts/apis/courses-student-apis.md or in  @prompts/apis and add api logs also
2.1> get courses details using ## GET `/courses/:id`>> res.data.results[]
2.2>show "select intake" >in api /course:id show Month Year> can be multiple (array)> 1st item selected initially
2.3> show application fee wies as per in figma dump >> just make the fee value dynamic and get it from api >application fee> /course:id applicationFee
2.4> all the details present in figma are shown in the UI  from @prompts/apis/courses-student-apis.md or in  @prompts/apis
2.5> show percentage match== match_score in api and prime badge>>in api its isPrime as in figma 
2.6>make sure that "application deadline" is as follows >get value from /course:id upcomintIntaked[selected intake(from 1)].applicationDeadline
the deadline progressbar will be from today date to applicationDeadline drom api
Important >> add api logs for all above apis and 
dont remove ui elements from screen if they are not persent in api , only comment them for later reusability


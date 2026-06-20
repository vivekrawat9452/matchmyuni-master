1>using figma dump @assets/studentflow/figma/student_flow_screen_map.json create accurate screen ui for Discocver tab @src/flows/main/Discover/DiscoverContainer.tsx screen 
1.1> 
2> use api reference for below student course details screen tab flow  from @prompts/apis/recommendation-student-apis.md or in  @prompts/apis and add api logs also
2.1> get courses details using ## GET `/recommendations/discover`>> res.data.results[]
2.2> show scholarship data and remove visa view 
res.data.results[].courses[]
if scholarshipAvailable
: 
false hide scholarship data if truue show data from below
scholarshipDetails
: 
{}
2.3> scholarship types> 4 types ahow sh=cholarship percentage as below 
SCHOLARSHIP TYPES WITH RESPONSE:

Shared base fields (all types)

{
  percentageMin: number;
  percentageMax: number;
  description: string;
  appliesTo: "tuition_only" | "total_package";
  additionalNotes?: string;
}
flat_automatic — fixed discount, auto-applied


{
  ...base,
  validForYears: "all_years" | "year_1_only" | number;
  renewalCondition?: string;
}
grade_based — discount depends on academic performance


{
  ...base,
  validForYears: "all_years" | "year_1_only" | number;
  renewalCondition?: string;
  gradeTiers?: {
    minGrade: number;
    maxGrade: number;
    percentage: number;  // override percentage for this tier
  }[];
}
package — bundled cost coverage


{
  ...base,
  validForYears: "all_years" | "year_1_only" | number;
  includes?: ("tuition" | "hostel" | "meals" | "registration" | "examination")[];
}
post_bursary — cashback after payment


{
  ...base,
  cashbackTimeline?: string;  // e.g. "within 3 months of semester start"
}
2.4> all the details present in figma are shown in the UI  from @prompts/apis/recommendation-student-apis.md or in  @prompts/apis
2.5> show percentage match== match_score in api and prime badge>>in api its isPrime as in figma 
Important >> add api logs for all above apis and 
dont remove ui elements from screen if they are not persent in api , only comment them for later reusability


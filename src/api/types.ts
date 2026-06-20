/** API response envelope from API_Docs.md */
export type ApiStatus = 'success' | 'error';

export interface ApiEnvelope<T> {
  status: ApiStatus;
  data: T;
  message?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SessionDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export type UserRole = 'student' | 'agent' | 'partner' | 'counsellor' | 'admin';

export interface UserDto {
  id: string;
  studentId?: string;
  role?: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  contact: string;
  avatarUrl: string | null;
  referralCodeUsed?: string | null;
  createdAt: string;
}

export interface SignupPayload {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  contact: string;
  password: string;
  referralCodeUsed?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupResponse {
  user: UserDto;
  session: SessionDto;
}

// ─── Student Profile ───────────────────────────────────────────────────────────

export interface StudentProfileDto {
  id: string;
  userId: string;
  dateOfBirth?: string;
  sex?: string;
  nationality?: string;
  passportNumber?: string;
  nationalIdNumber?: string;
  profilePhotoUrl?: string;
  guardianName?: string;
  guardianContact?: string;
  guardianCountryCode?: string;
  guardianRelation?: string;
  guardianOccupation?: string;
  highestQualification?: string;
  institutionName?: string;
  institutionCity?: string;
  institutionCountry?: string;
  gradesObtained?: string;
  preferredDestination?: string;
  preferredIntake?: string;
  budgetCurrency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileUpdatePayload {
  preferredDestination?: string;
  preferredIntake?: string;
  budgetTier?: string;
  budgetCurrency?: string;
  countryCode?: string;
  contact?: string;
  referralCodeUsed?: string;
}

export interface UserDetailsDto {
  user: UserDto;
  studentProfile: StudentProfileDto | null;
}

// ─── Courses ───────────────────────────────────────────────────────────────────

export interface UpcomingIntake {
  id: number;
  month: number;
  year: number;
  season?: string;
  label: string;
  status: 'yet_to_open' | 'open' | 'full' | 'closed' | 'cancelled';
  applicationDeadline?: string | null;
  documentDeadline?: string | null;
  startDate?: string | null;
}

/** GET /courses/:id — prompts/apis/courses-student-apis.md */
export interface ScholarshipDetails {
  percentageMin?: number;
  percentageMax?: number;
  description?: string;
  appliesTo?: string;
  validForYears?: string;
  renewalCondition?: string | null;
  additionalNotes?: string | null;
}

export interface CourseOtherFee {
  name: string;
  amount: number;
  required?: boolean;
  frequency?: string;
}

export interface CourseListItem {
  id: number;
  universityId: number;
  universityName: string;
  universityLogo?: string;
  /** Present on GET /user/shortlist items */
  shortlistId?: number;
  addedAt?: string;
  name: string;
  description?: string;
  country?: string;
  city?: string;
  applicableTuitionFee?: number;
  applicationFee?: number;
  registrationFee?: number | null;
  depositFee?: number | null;
  examinationFee?: number | null;
  hostelFee?: number | null;
  foodFee?: number | null;
  otherFees?: CourseOtherFee[];
  currency?: string;
  currencySymbol?: string;
  category?: string;
  degreeLevel?: string;
  duration?: number;
  intakes?: string[];
  upcomingIntakes?: UpcomingIntake[];
  offerTime?: string;
  minimumGPA?: string;
  minimumLevelOfEducation?: string;
  additionalRequirements?: string;
  language?: string;
  scholarshipOnTuitionFee?: string;
  scholarshipAvailable?: boolean;
  scholarshipType?: string;
  scholarshipDetails?: ScholarshipDetails | null;
  isPrime?: boolean;
  tags?: string[];
}

/** Lightweight item from GET /courses/search autocomplete */
export interface CourseSearchResult {
  id: number;
  name: string;
  universityName?: string;
  search?: string;
}

/** Normalised page returned by getCourses() after shaping the real API response */
export interface CoursesPage {
  courses: CourseListItem[];
  total: number;       // totalItems from API
  page: number;        // currentPage from API
  limit: number;       // itemsPerPage from API
  totalPages: number;  // totalPages from API
}

/** {label, value} pair used in filter arrays */
export interface FilterOption {
  label: string;
  value: string | number;
}

/**
 * Real /courses/filters response shape.
 * Field names match the actual API (degree_levels, countries — NOT degreelevels/destinations).
 */
export interface CourseFiltersDto {
  degree_levels: FilterOption[];
  countries:     FilterOption[];
  categories:    FilterOption[];
  durations:     FilterOption[];
  intakes:       FilterOption[];
  universities:  FilterOption[];
  fees:          FilterOption[];   // e.g. {label:"$0 - $2500", value:"0-2500"}
  sort:          FilterOption[];   // e.g. {label:"Fee Low→High", value:"applicableTuitionFee,asc"}
}

/**
 * Query params that /courses actually accepts.
 * sort = "field,order" combined string (from filters.sort[i].value).
 * fee  = "min-max"   combined string (from filters.fees[i].value).
 */
export interface CoursesQueryParams {
  search?:       string;
  degree_level?: string;
  duration?:     number;
  category?:     string;
  destination?:  string;   // maps to country filter
  intake?:       string;
  university_id?: number;
  fee?:          string;   // "0-2500" range string from filters.fees
  sort?:         string;   // "applicableTuitionFee,asc" from filters.sort
  page?:         number;
  limit?:        number;
}

// ─── Universities ──────────────────────────────────────────────────────────────

export interface UniversityDto {
  id: number;
  name: string;
  city: string;
  country: string;
  description?: string;
  type?: string;
  averageProcessingTime?: string;
  intakes?: string;
  isFeatured?: boolean;
  logoUrl?: string;
}

// ─── Countries ─────────────────────────────────────────────────────────────────

export interface CountryDto {
  id: number;
  name: string;
  flag?: string;
  description?: string;
  averageTuitionFee?: number;
  costOfLiving?: number;
  intakes?: string[];
  localCurrencyCode?: string;
  feeCurrencyCode?: string;
  feeCurrencySymbol?: string;
  language?: string;
  population?: string;
  location?: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface EventDto {
  id: number;
  name: string;
  description?: string;
  dateTime: string;
  eventType: 'Online' | 'Offline';
  address?: string;
  city?: string;
  country?: string;
  imageLink?: string;
  locationLink?: string;
  tags?: string[];
  entryConditions?: string;
}

// ─── Applications ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'created'
  | 'applied'
  | 'submitted'
  | 'under_review'
  | 'conditional_offer'
  | 'unconditional_offer'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'accepted'
  | 'visa_applied'
  | 'visa_approved'
  | 'visa_rejected'
  | 'registered'
  | 'deferred'
  | 'withdrawn'
  | 'reported'
  | 'rejected';

export interface ApplicationDto {
  id: string;
  userId: string;
  universityId: number;
  courseId: number;
  status: ApplicationStatus;
  feeCurrency?: string;
  receiptUrl?: string | null;
  eligibilityStatus?: string;
  isPartiallyRegistered?: boolean | null;
  createdAt: string;
  submittedAt?: string | null;
  updatedAt: string;
  course?: CourseListItem;
  university?: UniversityDto;
}

export interface ApplicationSummaryDto {
  id: string;
  status: string;
  receiptUrl?: string | null;
}

export interface ApplicationFeeDto {
  id: string;
  applicationId: string;
  feeType: 'application_fee' | 'registration_fee' | 'tuition_fee';
  requiredAmount: number;
  paidAmount: number;
  status: 'unpaid' | 'pending' | 'partially_paid' | 'paid' | 'waived' | 'refunded';
}

export interface ApplicationPaymentDto {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ApplicationListItemDto {
  application: ApplicationSummaryDto;
  course: CourseListItem;
  university: {name: string; logoUrl?: string};
  appFeeStatus?: string | null;
  registrationFee?: {status: string; requiredAmount: number; paidAmount: number} | null;
  tuitionFee?: {status: string; requiredAmount: number; paidAmount: number} | null;
  hasPendingPayment?: boolean;
}

export interface ApplicationDetailDto {
  application: ApplicationDto & {
    intakeId?: number;
    intakeMonth?: number;
    intakeYear?: number;
    intakeLabel?: string;
    receiptUploadedAt?: string | null;
    eligibilityMarkedAt?: string | null;
  };
  course: CourseListItem;
  university: {name: string; logoUrl?: string};
  applicationFees?: ApplicationFeeDto[];
  payments?: ApplicationPaymentDto[];
}

export interface ApplicationsGroupedDto {
  unpaid: ApplicationListItemDto[];
  pending: ApplicationListItemDto[];
  paid: ApplicationListItemDto[];
}

export interface CreatedApplicationDto {
  id: string;
  userId: string;
  universityId: number;
  courseId: number;
  intakeId: number;
  intakeLabel?: string;
  status: ApplicationStatus;
  feeCurrency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  courseId: number;
  /** Required by POST /applications/create when course has API intakes */
  intakeId?: number;
}

export interface ShortlistEntryDto {
  shortlistId: number;
  addedAt: string;
  id: number;
  name: string;
  universityId: number;
  universityName: string;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface PaymentHistoryDto {
  id: string;
  applicationId: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentType: string;
  status: string;
  paymentDate: string;
  application?: ApplicationDto;
  course?: CourseListItem;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface UserDocumentDto {
  id: string;
  userId: string;
  applicationId?: string;
  documentType: string;
  documentUrl: string;
  filename: string;
  filesize: number;
  mimeType: string;
  verified: boolean;
  uploadedAt: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthDto {
  status: string;
  uptime: number;
}

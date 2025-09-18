export const MESSAGES = {
  AUTH: {
    // Success Messages
    ACCESS_TOKEN_REFRESHED: 'Access token refreshed successfully',
    PASSWORD_RESET_LINK_SENT:
      'Password reset link sent. Please check your email to update your password.',
    PASSWORD_RESET_SUCCESS:
      "You've successfully reset your password. Please log in to continue.",

    // Conflict / BadRequest
    EMAIL_ALREADY_VERIFIED: 'Email already verified.',
    EMAIL_ALREADY_EXISTS: 'User already exists. Try with another email.',
    CANNOT_UPDATE_PASSWORD: "Can't update password. Try again.",
    PASSWORD_MISMATCH_ERROR:
      'The current password you entered is incorrect. Please try again.',

    // Unauthorized
    INVALID_GOOGLE_TOKEN: 'Invalid Google Token',
    FAILED_USER_CREATION_DURING_LOGIN:
      'Failed to create new user during the login',
    FAILED_GOOGLE_LINK: 'Failed to link Google account to the existing user',
    UNAUTHORIZED_ADMIN_ACCESS:
      'You are not authorized to access the admin panel.',
    UNVERIFIED_USER: 'Unverified User. Please verify your account.',
    INVALID_EMAIL_PASSWORD: 'Invalid Email or Password',
    INVALID_USER_ROLE: 'Invalid user role',
    EMAIL_NOT_VERIFIED: 'Please verify your email address.',
    VERIFICATION_TOKEN_MISSING: 'Verification token is missing.',
    VERIFICATION_LINK_INVALID_OR_EXPIRED:
      'Invalid or expired verification link.',
    USER_NOT_FOUD: 'User not found',
    ACCOUNT_LINKED_WITH_GOOGLE:
      'This account is linked with Google. Use Google to sign in.',
    PROFILE_CREATION_FAIILD: 'Profile Creation faild try again..',

    // Forbidden
    USER_BLOCKED: 'You are currently blocked. Please contact the admin.',

    // Registration/Login

    REGISTRATION_SUCCESS: 'User registered successfully.',
    LOGIN_SUCCESS: 'User logged in successfully.',
    EMAIL_SEND: 'Email sent successfully.',
    EMAIL_VERIFIED: 'Email verification was successful.',
    LOGOUT_SUCCESS: 'User logged Out successfully..',
  },
  COMPANY: {
    PROFILE_UPDATE_SUCCESS: 'Profile data updated successfully.',
    PROFILE_FETCH_SUCCESS: 'Company profile fetched successfully.',
    ALREADY_EXIST: 'Email alredy exists',
    USERS_GET_SUCCESS: 'Internal Users get Successfully',
    USER_REG_SUCCESS: 'User registration  completed',
    USER_PROFILE_GET: 'User profile get Successfully',

    NEW_JOB_ADDED: 'New Job Successfully added',
    FETCH_ALL_JOBS: 'fetch all jobs',
    GET_JOBDETAIS: 'Job details successfully fetched',
    UPDATE_JOBS: 'Update job Details',
    USER_REMOVED: 'User Removed Successfully',
    UPDATE_ATS_SCORE: 'Update ats Score Successfully',
  },
  CANDIDATE: {
    PROFILE_FETCH_SUCCESS: 'Candidate profile fetched successfully.',
    PROFILE_FETCH_FAIL: 'Error regading feth candiateProfile data',
    PROFILE_UPDATE_SUCCESS: 'Profile data updated successfully.',
    PROFILE_UPDATE_FAIL: 'Error regading updating profile data',
  },
  ADMIN: {
    DATA_RETRIEVED: 'Data retrieved successfully.',
    STATUS_UPDATED: 'Status Updated Sucessfully..!',
    FETCH_ALL_JOBS: 'All jobs Successfully Fetched',
    PROFILE_GET: 'Admin profile get Successfully',
    PROFILE_UPDATE_SUCCESS: 'Profile data updated successfully.',
  },
  APPLICATIONS: {
    SUBMIT_APPLICATION: 'Application Submited successfully',
    SUBMITION_FAILD: 'Creation Faild internalServer Error',
    ALREDY_APPLYED: 'Thsi job role is alredy applayied',
  },
};

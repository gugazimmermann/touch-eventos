import {
  getCurrentUser,
  fetchAuthSession,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  signIn,
  signOut,
  updatePassword,
  fetchUserAttributes,
  updateUserAttribute,
  confirmUserAttribute,
  sendUserAttributeVerificationCode,
} from "aws-amplify/auth";

export const handleSignIn = async (email, password) => {
  try {
    const { isSignedIn } = await signIn({ username: email, password });
    return isSignedIn;
  } catch (err) {
    return err;
  }
};

export const handleForgotPassword = async (email) => {
  try {
    const { nextStep } = await resetPassword({ username: email });
    if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE")
      return nextStep.codeDeliveryDetails.destination;
    else return;
  } catch (err) {
    return err;
  }
};

export const handleNewPassword = async (email, code, password) => {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: password,
    });
  } catch (err) {
    return err;
  }
};

export const handleSignUp = async (email, password) => {
  try {
    const { userId } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
    return userId;
  } catch (err) {
    return err;
  }
};

export const handleConfirmEmail = async (email, code) => {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
    return isSignUpComplete;
  } catch (err) {
    return err;
  }
};

export const handleResendSignUpCode = async (email) => {
  try {
    const { destination } = await resendSignUpCode({ username: email });
    return destination;
  } catch (err) {
    return err;
  }
};

export const handleGetCurrentUser = async () => {
  try {
    const { username, userId } = await getCurrentUser();
    return { username, userId };
  } catch (err) {
    return err;
  }
};

export const handleFetchAuthSession = async () => {
  try {
    const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
    return { accessToken, idToken };
  } catch (err) {
    return err;
  }
};

export const handleUpdateCurrentUserPassword = async (
  password,
  newpassword
) => {
  try {
    await updatePassword({ oldPassword: password, newPassword: newpassword });
  } catch (err) {
    return err;
  }
};

export const handleSignOut = async () => {
  try {
    await signOut();
  } catch (err) {
    return err;
  }
};

export const handleFetchUserEmail = async () => {
  try {
    const { email, email_verified } = await fetchUserAttributes();
    return { email, emailVerified: email_verified };
  } catch (err) {
    return err;
  }
};

export const handleUpdateUserEmail = async (email) => {
  try {
    const { nextStep } = await updateUserAttribute({
      userAttribute: {
        attributeKey: "email",
        value: email,
      },
    });
    if (nextStep.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE")
      return nextStep.codeDeliveryDetails.destination;
  } catch (err) {
    return err;
  }
};

export const handleConfirmUserEmail = async (code) => {
  try {
    await confirmUserAttribute({
      userAttributeKey: "email",
      confirmationCode: code,
    });
  } catch (err) {
    return err;
  }
};

export const handleConfirmUserEmailSendCode = async () => {
  try {
    await sendUserAttributeVerificationCode({ userAttributeKey: "email" });
  } catch (err) {
    return err;
  }
};

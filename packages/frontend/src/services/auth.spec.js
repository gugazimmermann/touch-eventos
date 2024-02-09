import * as AmplifyAuth from "aws-amplify/auth";
import {
  handleSignIn,
  handleForgotPassword,
  handleNewPassword,
  handleSignUp,
  handleConfirmEmail,
  handleResendSignUpCode,
  handleGetCurrentUser,
  handleFetchAuthSession,
  handleUpdateCurrentUserPassword,
  handleSignOut,
} from "./auth";

jest.mock("aws-amplify/auth", () => ({
  ...jest.requireActual("aws-amplify/auth"),
  signIn: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  resendSignUpCode: jest.fn(),
  getCurrentUser: jest.fn(),
  fetchAuthSession: jest.fn(),
  updatePassword: jest.fn(),
  signOut: jest.fn(),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handleSignIn success", async () => {
    AmplifyAuth.signIn.mockImplementation(() => ({ isSignedIn: true }));
    const result = await handleSignIn("test@test.com", "123456");
    expect(AmplifyAuth.signIn).toHaveBeenCalledWith({
      username: "test@test.com",
      password: "123456",
    });
    expect(result).toBe(true);
  });

  test("handleSignIn throws error", async () => {
    AmplifyAuth.signIn.mockImplementation(() => {
      throw new Error("Sign-in failed");
    });
    await expect(handleSignIn("test@test.com", "123456")).rejects.toThrow(
      "Sign-in failed"
    );
  });

  test("handleForgotPassword success", async () => {
    AmplifyAuth.resetPassword.mockImplementation(() => ({
      nextStep: {
        resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE",
        codeDeliveryDetails: { destination: "test@test.com" },
      },
    }));
    const result = await handleForgotPassword("test@test.com");
    expect(AmplifyAuth.resetPassword).toHaveBeenCalledWith({
      username: "test@test.com",
    });
    expect(result).toBe("test@test.com");
  });

  test("handleForgotPassword returns undefined", async () => {
    AmplifyAuth.resetPassword.mockImplementation(() => ({
      nextStep: {
        resetPasswordStep: "SomeOtherStep",
        codeDeliveryDetails: { destination: "test@test.com" },
      },
    }));
    const result = await handleForgotPassword("test@test.com");
    expect(AmplifyAuth.resetPassword).toHaveBeenCalledWith({
      username: "test@test.com",
    });
    expect(result).toBeUndefined();
  });

  test("handleForgotPassword throws error", async () => {
    AmplifyAuth.resetPassword.mockImplementation(() => {
      throw new Error("Reset password failed");
    });
    await expect(handleForgotPassword("test@test.com")).rejects.toThrow(
      "Reset password failed"
    );
  });

  test("handleNewPassword success", async () => {
    AmplifyAuth.confirmResetPassword.mockImplementation(() => {});
    await handleNewPassword("test@test.com", "1234", "123456");
    expect(AmplifyAuth.confirmResetPassword).toHaveBeenCalledWith({
      username: "test@test.com",
      confirmationCode: "1234",
      newPassword: "123456",
    });
  });

  test("handleNewPassword throws error", async () => {
    AmplifyAuth.confirmResetPassword.mockImplementation(() => {
      throw new Error("Confirm reset password failed");
    });
    await expect(
      handleNewPassword("test@test.com", "1234", "123456")
    ).rejects.toThrow("Confirm reset password failed");
  });

  test("handleSignUp success", async () => {
    AmplifyAuth.signUp.mockImplementation(() => ({ userId: "654321" }));
    const result = await handleSignUp("test@test.com", "123456");
    expect(AmplifyAuth.signUp).toHaveBeenCalledWith({
      username: "test@test.com",
      password: "123456",
      options: { userAttributes: { email: "test@test.com" } },
    });
    expect(result).toBe("654321");
  });

  test("handleSignUp throws error", async () => {
    AmplifyAuth.signUp.mockImplementation(() => {
      throw new Error("Sign-up failed");
    });
    await expect(handleSignUp("test@test.com", "123456")).rejects.toThrow(
      "Sign-up failed"
    );
  });

  test("handleConfirmEmail success", async () => {
    AmplifyAuth.confirmSignUp.mockImplementation(() => ({
      isSignUpComplete: true,
    }));
    const result = await handleConfirmEmail("test@test.com", "1234");
    expect(AmplifyAuth.confirmSignUp).toHaveBeenCalledWith({
      username: "test@test.com",
      confirmationCode: "1234",
    });
    expect(result).toBe(true);
  });

  test("handleConfirmEmail throws error", async () => {
    AmplifyAuth.confirmSignUp.mockImplementation(() => {
      throw new Error("Confirm email failed");
    });
    await expect(handleConfirmEmail("test@test.com", "1234")).rejects.toThrow(
      "Confirm email failed"
    );
  });

  test("handleResendSignUpCode success", async () => {
    AmplifyAuth.resendSignUpCode.mockImplementation(() => ({
      destination: "test@test.com",
    }));
    const result = await handleResendSignUpCode("test@test.com");
    expect(AmplifyAuth.resendSignUpCode).toHaveBeenCalledWith({
      username: "test@test.com",
    });
    expect(result).toBe("test@test.com");
  });

  test("handleResendSignUpCode throws error", async () => {
    AmplifyAuth.resendSignUpCode.mockImplementation(() => {
      throw new Error("Resend sign-up code failed");
    });
    await expect(handleResendSignUpCode("test@test.com")).rejects.toThrow(
      "Resend sign-up code failed"
    );
  });

  test("handleGetCurrentUser success", async () => {
    AmplifyAuth.getCurrentUser.mockImplementation(() => ({
      username: "test@test.com",
      userId: "654321",
    }));
    const result = await handleGetCurrentUser();
    expect(result).toEqual({
      username: "test@test.com",
      userId: "654321",
    });
  });

  test("handleGetCurrentUser throws error", async () => {
    AmplifyAuth.getCurrentUser.mockImplementation(() => {
      throw new Error("Fetch current user failed");
    });
    await expect(handleGetCurrentUser()).rejects.toThrow(
      "Fetch current user failed"
    );
  });

  test("handleFetchAuthSession success", async () => {
    AmplifyAuth.fetchAuthSession.mockImplementation(() => ({
      tokens: { accessToken: "098765", idToken: "4321" },
    }));
    const result = await handleFetchAuthSession();
    expect(result).toEqual({
      accessToken: "098765",
      idToken: "4321",
    });
  });

  test("handleFetchAuthSession success with null tokens", async () => {
    AmplifyAuth.fetchAuthSession.mockImplementation(() => ({}));
    const result = await handleFetchAuthSession();
    expect(result).toEqual({});
    expect(AmplifyAuth.fetchAuthSession).toHaveBeenCalled();
  });

  test("handleFetchAuthSession throws error", async () => {
    AmplifyAuth.fetchAuthSession.mockImplementation(() => {
      throw new Error("Fetch auth session failed");
    });
    await expect(handleFetchAuthSession()).rejects.toThrow(
      "Fetch auth session failed"
    );
  });

  test("handleUpdateCurrentUserPassword success", async () => {
    AmplifyAuth.updatePassword.mockImplementation(() => {});
    await handleUpdateCurrentUserPassword("123456", "654321");
    expect(AmplifyAuth.updatePassword).toHaveBeenCalledWith({
      oldPassword: "123456",
      newPassword: "654321",
    });
  });

  test("handleUpdateCurrentUserPassword throws error", async () => {
    AmplifyAuth.updatePassword.mockImplementation(() => {
      throw new Error("Update password failed");
    });
    await expect(
      handleUpdateCurrentUserPassword("123456", "654321")
    ).rejects.toThrow("Update password failed");
  });

  test("handleSignOut success", async () => {
    AmplifyAuth.signOut.mockImplementation(() => {});
    await handleSignOut();
    expect(AmplifyAuth.signOut).toHaveBeenCalled();
  });

  test("handleSignOut throws error on signOut failure", async () => {
    AmplifyAuth.signOut.mockImplementation(() => {
      throw new Error("Sign-out failed");
    });
    await expect(handleSignOut()).rejects.toThrow("Sign-out failed");
  });
});

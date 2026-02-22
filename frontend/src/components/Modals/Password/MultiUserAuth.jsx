import React, { useEffect, useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import System from "../../../models/system";
import { AUTH_TOKEN, AUTH_USER } from "../../../utils/constants";
import { projectIdentity } from "@/config/projectIdentity";
import paths from "../../../utils/paths";
import showToast from "@/utils/toast";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import RecoveryCodeModal from "@/components/Modals/DisplayRecoveryCodeModal";

const RecoveryForm = ({ onSubmit, setShowRecoveryForm }) => {
  const [username, setUsername] = useState("");
  const [recoveryCodeInputs, setRecoveryCodeInputs] = useState(
    Array(2).fill("")
  );

  const handleRecoveryCodeChange = (index, value) => {
    const updatedCodes = [...recoveryCodeInputs];
    updatedCodes[index] = value;
    setRecoveryCodeInputs(updatedCodes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const recoveryCodes = recoveryCodeInputs.filter(
      (code) => code.trim() !== ""
    );
    onSubmit(username, recoveryCodes);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center relative rounded-2xl md:bg-login-gradient md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-8 px-0 py-4 w-full md:w-fit mt-10 md:mt-0"
    >
      <div className="flex items-start justify-between pt-11 pb-9 w-screen md:w-full md:px-12 px-6 ">
        <div className="flex flex-col gap-y-4 w-full">
          <h3 className="text-4xl md:text-lg font-bold text-theme-text text-center md:text-left">
            Password Reset
          </h3>
          <p className="text-sm text-theme-text-muted md:text-left md:max-w-[300px] px-4 md:px-0 text-center">
            Provide the necessary information below to reset your password.
          </p>
        </div>
      </div>
      <div className="md:px-12 px-6 space-y-6 flex h-full w-full">
        <div className="w-full flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <label className="text-theme-text text-sm font-bold">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="theme-input w-full h-[48px] md:w-[300px] md:h-[34px]"
              required
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <label className="text-theme-text text-sm font-bold">
              Recovery Codes
            </label>
            {recoveryCodeInputs.map((code, index) => (
              <div key={index}>
                <input
                  type="text"
                  name={`recoveryCode${index + 1}`}
                  placeholder={`Recovery Code ${index + 1}`}
                  value={code}
                  onChange={(e) =>
                    handleRecoveryCodeChange(index, e.target.value)
                  }
                  className="theme-input w-full h-[48px] md:w-[300px] md:h-[34px]"
                  required
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center md:p-12 md:px-0 px-6 mt-12 md:mt-0 space-x-2 border-gray-600 w-full flex-col gap-y-8">
        <button
          type="submit"
          className="md:text-[#46C8FF] md:bg-transparent md:w-[300px] text-[#222628] text-sm font-bold focus:ring-4 focus:outline-none rounded-md border-[1.5px] border-[#46C8FF] md:h-[34px] h-[48px] md:hover:text-white md:hover:bg-[#46C8FF] bg-[#46C8FF] focus:z-10 w-full"
        >
          Reset Password
        </button>
        <button
          type="button"
          className="text-theme-text text-sm flex gap-x-1 hover:text-[#46C8FF] hover:underline -mb-8"
          onClick={() => setShowRecoveryForm(false)}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};

const ResetPasswordForm = ({ onSubmit }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword, confirmPassword);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center relative rounded-2xl md:bg-login-gradient md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-12 px-0 py-4 w-full md:w-fit -mt-24 md:-mt-28"
    >
      <div className="flex items-start justify-between pt-11 pb-9 w-screen md:w-full md:px-12 px-6">
        <div className="flex flex-col gap-y-4 w-full">
          <h3 className="text-4xl md:text-2xl font-bold text-theme-text text-center md:text-left">
            Reset Password
          </h3>
          <p className="text-sm text-theme-text-muted md:text-left md:max-w-[300px] px-4 md:px-0 text-center">
            Enter your new password.
          </p>
        </div>
      </div>
      <div className="md:px-12 px-6 space-y-6 flex h-full w-full">
        <div className="w-full flex flex-col gap-y-4">
          <div>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="theme-input w-full h-[48px] md:w-[300px] md:h-[34px]"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="theme-input w-full h-[48px] md:w-[300px] md:h-[34px]"
              required
            />
          </div>
        </div>
      </div>
      <div className="flex items-center md:p-12 md:px-0 px-6 mt-12 md:mt-0 space-x-2 border-gray-600 w-full flex-col gap-y-8">
        <button
          type="submit"
          className="md:text-[#46C8FF] md:bg-transparent md:w-[300px] text-[#222628] text-sm font-bold focus:ring-4 focus:outline-none rounded-md border-[1.5px] border-[#46C8FF] md:h-[34px] h-[48px] md:hover:text-white md:hover:bg-[#46C8FF] bg-[#46C8FF] focus:z-10 w-full"
        >
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default function MultiUserAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [customAppName, setCustomAppName] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    isOpen: isRecoveryCodeModalOpen,
    openModal: openRecoveryCodeModal,
    closeModal: closeRecoveryCodeModal,
  } = useModal();

  const handleLogin = async (e) => {
    setError(null);
    setLoading(true);
    e.preventDefault();
    const data = {};
    const form = new FormData(e.target);
    for (var [key, value] of form.entries()) data[key] = value;
    const { valid, user, token, message, recoveryCodes } =
      await System.requestToken(data);
    if (valid && !!token && !!user) {
      setUser(user);
      setToken(token);

      if (recoveryCodes) {
        setRecoveryCodes(recoveryCodes);
        openRecoveryCodeModal();
      } else {
        window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
        window.localStorage.setItem(AUTH_TOKEN, token);
        window.location = paths.home();
      }
    } else {
      setError(message);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleDownloadComplete = () => setDownloadComplete(true);
  const handleResetPassword = () => setShowRecoveryForm(true);
  const handleRecoverySubmit = async (username, recoveryCodes) => {
    const { success, resetToken, error } = await System.recoverAccount(
      username,
      recoveryCodes
    );

    if (success && resetToken) {
      window.localStorage.setItem("resetToken", resetToken);
      setShowRecoveryForm(false);
      setShowResetPasswordForm(true);
    } else {
      showToast(error, "error", { clear: true });
    }
  };

  const handleResetSubmit = async (newPassword, confirmPassword) => {
    const resetToken = window.localStorage.getItem("resetToken");

    if (resetToken) {
      const { success, error } = await System.resetPassword(
        resetToken,
        newPassword,
        confirmPassword
      );

      if (success) {
        window.localStorage.removeItem("resetToken");
        setShowResetPasswordForm(false);
        showToast("Password reset successful", "success", { clear: true });
      } else {
        showToast(error, "error", { clear: true });
      }
    } else {
      showToast("Invalid reset token", "error", { clear: true });
    }
  };

  useEffect(() => {
    if (downloadComplete && user && token) {
      window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
      window.localStorage.setItem(AUTH_TOKEN, token);
      window.location = paths.home();
    }
  }, [downloadComplete, user, token]);

  useEffect(() => {
    const fetchCustomAppName = async () => {
      const { appName } = await System.fetchCustomAppName();
      setCustomAppName(appName || "");
      setLoading(false);
    };
    fetchCustomAppName();
  }, []);

  if (showRecoveryForm) {
    return (
      <RecoveryForm
        onSubmit={handleRecoverySubmit}
        setShowRecoveryForm={setShowRecoveryForm}
      />
    );
  }

  if (showResetPasswordForm)
    return <ResetPasswordForm onSubmit={handleResetSubmit} />;
  const appName = customAppName || projectIdentity.defaultAppName;
  const isKbtg = /KBTG\s*Regional\s*Team/i.test(appName);
  const titleParts = isKbtg
    ? { blue: "KBTG Regional", white: " Team" }
    : { blue: appName, white: "" };

  return (
    <>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col justify-center items-center relative rounded-2xl md:bg-login-gradient md:shadow-[0_4px_14px_rgba(0,0,0,0.25)] md:px-12 py-10 -mt-4 md:mt-0">
          <div className="flex flex-col items-center pb-6 rounded-t">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
              <span className="text-[#75D6FF]">{titleParts.blue}</span>
              <span className="text-white">{titleParts.white}</span>
            </h1>
            <p className="text-sm text-gray-400 text-center">
              Sign in to your {appName} account.
            </p>
          </div>
          <div className="w-full px-4 md:px-12">
            <div className="w-full flex flex-col gap-y-4">
              <div className="w-screen md:w-full md:px-0 px-6 flex flex-col gap-y-1">
                <label htmlFor="login-username" className="text-theme-text text-sm font-medium">
                  Username
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="theme-input w-full h-[48px] md:w-[300px] md:h-[40px]"
                  required={true}
                  autoComplete="off"
                />
              </div>
              <div className="w-screen md:w-full md:px-0 px-6 flex flex-col gap-y-1 relative">
                <label htmlFor="login-password" className="text-theme-text text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="theme-input w-full h-[48px] md:w-[300px] md:h-[40px] pr-10"
                    required={true}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-theme-text-muted hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-[#46C8FF] focus:ring-offset-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlash className="h-5 w-5" weight="bold" />
                    ) : (
                      <Eye className="h-5 w-5" weight="bold" />
                    )}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">Error: {error}</p>}
            </div>
          </div>
          <div className="flex flex-col items-center w-full px-4 md:px-12 pt-6 gap-y-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full md:w-[300px] h-[48px] md:h-[44px] rounded-md font-semibold text-white bg-[#46C8FF] hover:bg-[#3ab5e6] focus:ring-4 focus:ring-[#46C8FF]/50 focus:outline-none transition-colors"
            >
              {loading ? "Validating..." : "Login"}
            </button>
            <button
              type="button"
              className="text-gray-400 text-sm hover:text-[#46C8FF] hover:underline"
              onClick={handleResetPassword}
            >
              Forgot password? <b className="text-theme-text">Reset</b>
            </button>
          </div>
        </div>
      </form>

      <ModalWrapper isOpen={isRecoveryCodeModalOpen}>
        <RecoveryCodeModal
          recoveryCodes={recoveryCodes}
          onDownloadComplete={handleDownloadComplete}
          onClose={closeRecoveryCodeModal}
        />
      </ModalWrapper>
    </>
  );
}

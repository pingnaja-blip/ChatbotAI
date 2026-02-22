import Admin from "@/models/admin";
import System from "@/models/system";
import { projectIdentity } from "@/config/projectIdentity";
import showToast from "@/utils/toast";
import { useEffect, useState } from "react";

export default function CustomAppName() {
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [customAppName, setCustomAppName] = useState("");
  const [originalAppName, setOriginalAppName] = useState("");
  const [canCustomize, setCanCustomize] = useState(false);

  useEffect(() => {
    const fetchInitialParams = async () => {
      const settings = await System.keys();
      if (!settings?.MultiUserMode && !settings?.RequiresAuth) {
        setCanCustomize(false);
        return false;
      }

      const { appName } = await System.fetchCustomAppName();
      setCustomAppName(appName || "");
      setOriginalAppName(appName || "");
      setCanCustomize(true);
      setLoading(false);
    };
    fetchInitialParams();
  }, []);

  const updateCustomAppName = async (e, newValue = null) => {
    e.preventDefault();
    let custom_app_name = newValue;
    if (newValue === null) {
      const form = new FormData(e.target);
      custom_app_name = form.get("customAppName");
    }
    const { success, error } = await Admin.updateSystemPreferences({
      custom_app_name,
    });
    if (!success) {
      showToast(`Failed to update custom app name: ${error}`, "error");
      return;
    } else {
      showToast("Successfully updated custom app name.", "success");
      window.localStorage.removeItem(System.cacheKeys.customAppName);
      setCustomAppName(custom_app_name);
      setOriginalAppName(custom_app_name);
      setHasChanges(false);
    }
  };

  const handleChange = (e) => {
    setCustomAppName(e.target.value);
    setHasChanges(true);
  };

  if (!canCustomize || loading) return null;

  return (
    <form className="mb-6" onSubmit={updateCustomAppName}>
      <div className="flex flex-col gap-y-1">
        <h2 className="text-base leading-6 font-bold text-theme-text">
          Custom App Name
        </h2>
        <p className="text-xs leading-[18px] font-base text-theme-text/60">
          Set a custom app name that is displayed on the login page.
        </p>
      </div>
      <div className="flex items-center gap-x-4">
        <input
          name="customAppName"
          type="text"
          className="theme-input mt-3 block w-full max-w-[275px]"
          placeholder={projectIdentity.defaultAppName}
          required={true}
          autoComplete="off"
          onChange={handleChange}
          value={customAppName}
        />
        {originalAppName !== "" && (
          <button
            type="button"
            onClick={(e) => updateCustomAppName(e, "")}
            className="mt-4 text-theme-text text-base font-medium hover:text-opacity-60"
          >
            Clear
          </button>
        )}
      </div>
      {hasChanges && (
        <button
          type="submit"
          className="transition-all mt-6 w-fit duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-theme-text text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
        >
          Save
        </button>
      )}
    </form>
  );
}

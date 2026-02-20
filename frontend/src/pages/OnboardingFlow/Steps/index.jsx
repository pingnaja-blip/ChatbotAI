import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import Home from "./Home";
import LLMPreference from "./LLMPreference";
import UserSetup from "./UserSetup";
import DataHandling from "./DataHandling";
import Survey from "./Survey";
import CreateWorkspace from "./CreateWorkspace";

const OnboardingSteps = {
  home: Home,
  "llm-preference": LLMPreference,
  "user-setup": UserSetup,
  "data-handling": DataHandling,
  survey: Survey,
  "create-workspace": CreateWorkspace,
};

export default OnboardingSteps;

export function OnboardingLayout({ children }) {
  const [header, setHeader] = useState({
    title: "",
    description: "",
  });
  const [backBtn, setBackBtn] = useState({
    showing: false,
    disabled: true,
    onClick: () => null,
  });
  const [forwardBtn, setForwardBtn] = useState({
    showing: false,
    disabled: true,
    onClick: () => null,
  });

  if (isMobile) {
    return (
      <div className="w-screen h-screen overflow-y-auto bg-sidebar overflow-hidden">
        <div className="flex flex-col">
          <div className="w-full relative py-10 px-2">
            <div className="flex flex-col w-fit mx-auto gap-y-1 mb-[55px]">
              <h1 className="text-theme-text font-semibold text-center text-2xl">
                {header.title}
              </h1>
              <p className="text-theme-text-muted text-base text-center">
                {header.description}
              </p>
            </div>
            {children(setHeader, setBackBtn, setForwardBtn)}
          </div>
          <div className="flex w-full justify-center gap-x-4 pb-20">
            <div className="flex justify-center items-center">
              {backBtn.showing && (
                <button
                  disabled={backBtn.disabled}
                  onClick={backBtn.onClick}
                  className="group p-2 rounded-lg border-2 border-outline disabled:border-outline/50 h-fit w-fit disabled:not-allowed hover:bg-accent/20 disabled:hover:bg-transparent"
                >
                  <ArrowLeft
                    className="text-theme-text group-hover:text-theme-text group-disabled:text-theme-text-muted"
                    size={30}
                  />
                </button>
              )}
            </div>

            <div className="flex justify-center items-center">
              {forwardBtn.showing && (
                <button
                  disabled={forwardBtn.disabled}
                  onClick={forwardBtn.onClick}
                  className="group p-2 rounded-lg border-2 border-outline disabled:border-outline/50 h-fit w-fit disabled:not-allowed hover:bg-accent/20 disabled:hover:bg-transparent"
                >
                  <ArrowRight
                    className="text-theme-text group-hover:text-theme-text group-disabled:text-theme-text-muted"
                    size={30}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen overflow-y-auto bg-sidebar md:bg-main-gradient flex justify-center overflow-hidden">
      <div className="flex w-1/5 h-screen justify-center items-center">
        {backBtn.showing && (
          <button
            disabled={backBtn.disabled}
            onClick={backBtn.onClick}
            className="group p-2 rounded-lg border-2 border-outline disabled:border-outline/50 h-fit w-fit disabled:not-allowed hover:bg-accent/20 disabled:hover:bg-transparent"
            aria-label="Back"
          >
            <ArrowLeft
              className="text-theme-text group-hover:text-theme-text group-disabled:text-theme-text-muted"
              size={30}
            />
          </button>
        )}
      </div>

      <div className="w-full md:w-3/5 relative h-full py-10">
        <div className="flex flex-col w-fit mx-auto gap-y-1 mb-[55px]">
          <h1 className="text-theme-text font-semibold text-center text-2xl">
            {header.title}
          </h1>
          <p className="text-theme-text-muted text-base text-center">
            {header.description}
          </p>
        </div>
        {children(setHeader, setBackBtn, setForwardBtn)}
      </div>

      <div className="flex w-1/5 h-screen justify-center items-center">
        {forwardBtn.showing && (
          <button
            disabled={forwardBtn.disabled}
            onClick={forwardBtn.onClick}
            className="group p-2 rounded-lg border-2 border-outline disabled:border-outline/50 h-fit w-fit disabled:not-allowed hover:bg-accent/20 disabled:hover:bg-transparent"
            aria-label="Continue"
          >
            <ArrowRight
              className="text-theme-text group-hover:text-theme-text group-disabled:text-theme-text-muted"
              size={30}
            />
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import { isMobile } from "react-device-detect";
import { SidebarMobileHeader } from "../Sidebar";
import ChatBubble from "../ChatBubble";
import System from "@/models/system";
import useUser from "@/hooks/useUser";

export default function DefaultChatContainer() {
  const { user } = useUser();
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();

  useEffect(() => {
    const fetchData = async () => {
      const messages = await System.getWelcomeMessages();
      setFetchedMessages(messages);
    };
    fetchData();
  }, []);

  return (
    <div
      style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
      className="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-main-gradient w-full h-full overflow-y-scroll border-2 border-outline flex flex-col"
    >
      {isMobile && <SidebarMobileHeader />}
      {fetchedMessages.length > 0 ? (
        fetchedMessages.map((fetchedMessage, i) => (
          <ChatBubble
            key={i}
            message={
              fetchedMessage.user === ""
                ? fetchedMessage.response
                : fetchedMessage.user
            }
            type={fetchedMessage.user === "" ? "response" : "user"}
          />
        ))
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center gap-6 py-12">
          {(!user || user?.role !== "default") && (
            <button
              onClick={showNewWsModal}
              className="w-fit transition-all duration-300 border-2 border-outline px-6 py-3 rounded-xl text-theme-text text-sm font-semibold flex items-center gap-2 hover:bg-accent/30"
            >
              <Plus className="h-5 w-5" />
              Create your first workspace
            </button>
          )}
        </div>
      )}
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
    </div>
  );
}

import { useContext } from "react";
import { LibraryContext } from "@/puck-splat/PuckSplatEditor";
import { LibraryModal } from "./LibraryModal";

type Props = {
  children: React.ReactNode;
};

export function ComponentsPanelWithTabs({ children }: Props) {
  const { showLibrary, setShowLibrary } = useContext(LibraryContext);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", background: "#f5f5f5" }}>
        {children}
      </div>
      {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}
    </div>
  );
}

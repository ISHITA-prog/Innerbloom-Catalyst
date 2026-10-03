import React, { useRef, useEffect, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import chooseYourAvatarRiv from "../assets/choose_your_avatar.riv";

const STATE_MACHINE_NAME = "State Machine 1"; // Update if your Rive file uses a different state machine name
const INPUT_NAME = "avatar"; // Update if your Rive file uses a different input name

export default function AvatarCustomization({ onAvatarChange }: { onAvatarChange?: (avatarIndex: number) => void }) {
  const [selectedAvatar, setSelectedAvatar] = useState<number>(() => {
    const saved = localStorage.getItem("selectedAvatar");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [saved, setSaved] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: chooseYourAvatarRiv,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
  });

  // Get the input for avatar selection
  const avatarInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

  useEffect(() => {
    if (avatarInput) {
      avatarInput.value = selectedAvatar;
    }
  }, [avatarInput, selectedAvatar]);

  const handleNextAvatar = () => {
    const next = (selectedAvatar + 1) % 5; // Assume 5 avatars, update if different
    setSelectedAvatar(next);
    localStorage.setItem("selectedAvatar", next.toString());
    if (onAvatarChange) onAvatarChange(next);
  };

  const handleSave = () => {
    localStorage.setItem("selectedAvatar", selectedAvatar.toString());
    if (onAvatarChange) onAvatarChange(selectedAvatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-soft">
      <h3 className="text-lg font-bold mb-2 text-primary">Customize Your Avatar</h3>
      <div className="w-64 h-64 cursor-pointer" onClick={handleNextAvatar} title="Click to change avatar">
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>
      <button
        className="bg-primary text-white px-4 py-2 rounded mt-2"
        onClick={handleSave}
      >
        Save Avatar
      </button>
      {saved && <div className="text-green-600 text-sm pt-2">Avatar saved!</div>}
      <div className="text-xs text-muted-foreground">Click the avatar to cycle through options.</div>
    </div>
  );
} 
import { ReactElement } from "react";

import {
  DeviceConnectControl,
  FullScreenControl,
  LyricsPIPButton,
  VolumeControl,
} from "components";
import { FullScreen, Lyrics, Queue } from "components/icons";
import { useAuth, useSpotify } from "hooks";
import { DisplayInFullScreen } from "types/spotify";

export default function PlaybackExtraControls(): ReactElement {
  const { currentlyPlaying } = useSpotify();
  const { isPremium } = useAuth();
  return (
    <div className="extras">
      {currentlyPlaying?.type === "track"}
      <FullScreenControl
        icon={Queue}
        displayInFullScreen={DisplayInFullScreen.Queue}
      />
      <DeviceConnectControl />
      <VolumeControl />
      <style jsx>{`
        .extras {
          display: flex;
          width: 100%;
          column-gap: 0px;
          align-items: center;
          justify-content: flex-end;
        }
        @media (max-width: 1100px) {
          .extras {
            column-gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { handleSaveToPlaylistClick } from "./utils";
import {
  CardTrack,
  ContentContainer,
  Heading,
  PageHeader,
  PlayButton,
  PlaylistTopBarExtraField,
  RemoveTracksModal,
  SearchInputElement,
  TrackListHeader,
  VirtualizedList,
} from "components";
import { CardType } from "components/CardTrack/CardTrack";
import { Broom, Heart } from "components/icons";
import {
  useAnalytics,
  useAuth,
  useHeader,
  useModal,
  useSpotify,
  useToast,
  useTranslations,
} from "hooks";
import { PlaylistProps } from "pages/playlist/[playlist]";
import { HeaderType } from "types/pageHeader";
import { ITrack } from "types/spotify";
import { chooseImage, getIdFromUri, templateReplace } from "utils";
import {
  addItemsToPlaylist,
  checkUsersFollowAPlaylist,
  followPlaylist,
  unfollowPlaylist,
} from "utils/spotifyCalls";

const Playlist: NextPage<
  PlaylistProps & { isLibrary: boolean; isGeneratedPlaylist?: boolean }
> = ({
  pageDetails,
  playListTracks,
  tracksInLibrary,
  isLibrary,
  isGeneratedPlaylist,
}) => {
  const router = useRouter();
  const { translations } = useTranslations();
  const { user, isPremium } = useAuth();
  const { trackWithGoogleAnalytics } = useAnalytics();
  const {
    player,
    isPlaying,
    deviceId,
    setPlaylistPlayingId,
    setPageDetails,
    setAllTracks,
    allTracks,
    setPlaylists,
  } = useSpotify();
  const { setElement } = useHeader();
  const [isPin, setIsPin] = useState(false);
  const isMyPlaylist = pageDetails?.owner?.id === user?.id;
  const [isFollowingThisPlaylist, setIsFollowingThisPlaylist] = useState(false);
  const [searchedData, setSearchedData] =
    useState<SpotifyApi.SearchResponse | null>(null);
  const { addToast } = useToast();
  const { setModalData } = useModal();

  const tracks = useMemo(() => {
    return (
      playListTracks?.map((track) => {
        return {
          ...track,
          album: {
            ...track.album,
            type: track.type === "episode" ? "show" : "album",
          },
        } as ITrack;
      }) ?? []
    );
  }, [playListTracks]);

  useEffect(() => {
    if (isMyPlaylist) {
      return;
    }
    async function fetchData() {
      const userFollowThisPlaylist = await checkUsersFollowAPlaylist(
        [user?.id ?? ""],
        getIdFromUri(pageDetails?.uri, "id")
      );
      setIsFollowingThisPlaylist(!!userFollowThisPlaylist?.[0]);
    }
    fetchData();
  }, [pageDetails?.uri, user?.id, isMyPlaylist]);

  useEffect(() => {
    if (!pageDetails) {
      router.push("/");
    }
    setElement(() => <PlaylistTopBarExtraField uri={pageDetails?.uri} />);
    setPageDetails(pageDetails);
    trackWithGoogleAnalytics();
    setAllTracks(tracks);
  }, [
    isGeneratedPlaylist,
    setElement,
    setPageDetails,
    pageDetails,
    trackWithGoogleAnalytics,
    router,
    setAllTracks,
    tracks,
  ]);

  useEffect(() => {
    if (deviceId && isPlaying && isPremium) {
      (player as Spotify.Player)
        ?.getCurrentState()
        .then((e) => {
          if (e?.context.uri === pageDetails?.uri) {
            setPlaylistPlayingId(getIdFromUri(pageDetails?.uri, "id"));
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [
    isPlaying,
    deviceId,
    player,
    pageDetails,
    setPlaylistPlayingId,
    isPremium,
  ]);

  useEffect(() => {
    const emptyTrackItem: ITrack = {
      name: "",
      id: "",
      album: { images: [{ url: "" }], name: "", uri: "", type: "track" },
      type: "track",
    };

    const totalTracks = pageDetails?.tracks?.total ?? tracks.length;

    const restTrackItems = new Array(totalTracks - tracks.length).fill(
      emptyTrackItem
    ) as ITrack[];

    setAllTracks([...tracks, ...restTrackItems]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContentContainer hasPageHeader>
      {!isPlaying && (
        <Head>
          <title>{`Spotify: ${pageDetails?.name || ""}`}</title>
        </Head>
      )}
      <PageHeader
        key={pageDetails?.uri ?? pageDetails?.id}
        type={
          pageDetails?.type === "concert"
            ? HeaderType.Concert
            : pageDetails?.type === "radio"
              ? HeaderType.Radio
              : pageDetails?.type === "episode"
                ? HeaderType.Episode
                : pageDetails?.type === "podcast"
                  ? HeaderType.Podcast
                  : pageDetails?.type === "top"
                    ? HeaderType.Top
                    : HeaderType.Playlist
        }
        title={pageDetails?.name ?? ""}
        description={pageDetails?.description ?? ""}
        coverImg={chooseImage(pageDetails?.images, 300).url}
        ownerDisplayName={pageDetails?.owner?.display_name ?? ""}
        ownerId={pageDetails?.owner?.id ?? ""}
        totalFollowers={pageDetails?.followers?.total ?? 0}
        totalTracks={pageDetails?.tracks?.total ?? 0}
      />
      <div className="tracksContainer">
        {allTracks.length > 0 ? (
          <>
            <div className="options">
              {
                <PlayButton
                  uri={pageDetails?.uri}
                  size={56}
                  centerSize={28}
                  allTracks={allTracks}
                />
              }
            </div>
            <div className="trc">
              <TrackListHeader
                isPin={isPin}
                type={CardType.Playlist}
                setIsPin={setIsPin}
              />
              <VirtualizedList
                type={CardType.Playlist}
                isLibrary={isLibrary}
                isGeneratedPlaylist={isGeneratedPlaylist}
                initialTracksInLibrary={tracksInLibrary}
              />
            </div>
          </>
        ) : null}
      </div>
      <style jsx>{`
        .save-to-playlist-button {
          border-radius: 500px;
          text-decoration: none;
          color: #fff;
          cursor: pointer;
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.76px;
          line-height: 18px;
          padding: 12px 34px;
          text-align: center;
          text-transform: uppercase;
          transition: all 33ms cubic-bezier(0.3, 0, 0, 1);
          white-space: nowrap;
          background-color: #000000;
          border: 1px solid #ffffffb3;
          will-change: transform;
          max-width: calc(100% - 16px);
        }
        .save-to-playlist-button:focus,
        .save-to-playlist-button:hover {
          transform: scale(1.06);
          background-color: #000;
          border: 1px solid #fff;
        }
        .save-to-playlist-button:active {
          transform: scale(1);
        }
        .info :global(button) {
          margin-left: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border: none;
        }
        .info button.broom {
          margin-left: 28px;
          color: #fff;
        }
        .info button.broom:hover,
        .info button.broom:focus {
          transform: scale(1.1);
        }
        .info button.broom:active {
          transform: scale(1);
        }
        .options {
          display: flex;
          padding: 24px 0;
          position: relative;
          width: 100%;
          align-items: center;
          margin: 16px 0;
          flex-direction: row;
          gap: 16px;
        }
        .tracksContainer {
          padding: 0 32px;
        }
        .trc {
          margin-bottom: 50px;
        }
        .noTracks {
          z-index: 2;
          position: relative;
        }
        .trc :global(.titles) {
          border-bottom: 1px solid transparent;
          box-sizing: content-box;
          height: 36px;
          margin: ${isPin ? "0 -32px 8px" : "0 -16px 8px"};
          padding: ${isPin ? "0 32px" : "0 16px"};
          position: sticky;
          top: 60px;
          z-index: 2;
          display: grid;
          grid-gap: 16px;
          background-color: ${isPin ? "#181818" : "transparent"};
          border-bottom: 1px solid #ffffff1a;
          grid-template-columns: [index] 48px [first] 6fr [var1] 4fr [var2] 3fr [popularity] 1fr [last] minmax(
              160px,
              1fr
            );
        }
        .trc :global(.titles span) {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: #ffffffb3;
          font-family: sans-serif;
        }
        .trc :global(.titles span:nth-of-type(1)) {
          font-size: 16px;
          justify-self: center;
          margin-left: 16px;
        }
        .trc :global(.titles span:nth-of-type(2)) {
          margin-left: 70px;
        }
        .trc :global(.titles span:nth-of-type(5)) {
          justify-content: center;
        }
        @media (max-width: 768px) {
          .options {
            padding: 32px 16px;
            gap: 8px;
          }
          .tracksContainer {
            padding: 0;
          }
          .trc {
            padding: 0;
          }
        }
      `}</style>
    </ContentContainer>
  );
};

export default Playlist;
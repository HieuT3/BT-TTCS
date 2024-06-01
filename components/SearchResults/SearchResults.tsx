import { ReactElement } from "react";

import { decode } from "html-entities";

import { Carousel, MainTracks, PresentationCard } from "components";
import { CardType } from "components/CardContent";
import { useTranslations } from "hooks";
import { getYear } from "utils";

interface ISearchResultsProps {
  searchResponse: SpotifyApi.SearchResponse;
}

export default function SearchResults({
  searchResponse,
}: Readonly<ISearchResultsProps>): ReactElement {
  const { translations } = useTranslations();

  return (
    <div>
      {searchResponse.tracks?.items &&
      searchResponse.tracks?.items?.length > 0 ? (
        <>
          <MainTracks
            title={translations.pages.search.songs}
            tracksRecommendations={searchResponse.tracks?.items.slice(0, 5)}
          />
        </>
      ) : null}
    </div>
  );
}

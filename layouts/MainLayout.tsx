import { PropsWithChildren, ReactElement, useEffect } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { SpotifyPlayer, TopBar } from "components";
import { useDisableGlobalContextMenu, useRefreshAccessToken } from "hooks";
import { AppContainer } from "layouts/AppContainer";
import { ITranslations } from "types/translations";

export default function MainLayout({
  children,
  translations,
}: Readonly<PropsWithChildren<{ translations: ITranslations }>>): ReactElement {
  const router = useRouter();
  const isLoginPage = router.pathname === "/";
  const isNotFoundPage = router.pathname === "/404";
  const isErrorPage = router.pathname === "/500";

  useRefreshAccessToken();
  useDisableGlobalContextMenu();

  useEffect(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }, []);

  if (isNotFoundPage || isErrorPage) {
    return <>{children}</>;
  }

  if (isLoginPage) {
    return (
      <div>
        <Head>
          <title>Spotify - Web Player</title>
        </Head>
        <TopBar />
        {children}
      </div>
    );
  }

  return (
    <>
      <AppContainer translations={translations}>{children}</AppContainer>
      <SpotifyPlayer translations={translations} />
    </>
  );
}

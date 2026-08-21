import { router, type Href } from "expo-router";

/** Goes back if there's history to go back to, otherwise replaces to `fallbackHref`. */
export function goBackOrReplace(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}

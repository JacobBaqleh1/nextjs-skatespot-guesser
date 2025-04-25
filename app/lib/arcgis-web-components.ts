import { defineCustomElements } from "@arcgis/map-components/loader";

if (typeof window !== "undefined") {
  defineCustomElements(window);
}

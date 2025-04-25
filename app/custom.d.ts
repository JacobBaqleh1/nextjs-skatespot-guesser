/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    "arcgis-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      itemId?: string;
      apiKey?: string;
      basemap?: string;
      center?: string;
      zoom?: string | number;
    };
  }
}

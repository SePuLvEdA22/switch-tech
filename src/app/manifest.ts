import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Switch&Tech — Cargadores, fundas y termos",
    short_name: "Switch&Tech",
    description: "Cargadores, cables, fundas, termos y personalizados con envío a toda Colombia.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDF0EF",
    theme_color: "#0F4C4A",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}

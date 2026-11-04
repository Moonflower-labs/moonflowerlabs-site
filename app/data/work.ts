const SCREENSHOT_WIDTHS = [640, 960, 1280];

// Importing through Vite gives each file a hashed name, so browsers can cache it for good.
const screenshots = import.meta.glob<string>("/app/assets/work/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

function screenshotSet(name: string) {
  return SCREENSHOT_WIDTHS.map((width) => `${screenshots[`/app/assets/work/${name}-${width}.webp`]} ${width}w`).join(", ");
}

export const projects: {
  name: string;
  type: string;
  description: string;
  built: string[];
  url: string;
  imageSet: string;
  placeholder: string;
}[] = [
  {
    name: "The Chic Noir",
    type: "Online store",
    description: "A maternity and wellbeing brand selling clothing, accessories and made-to-order essences, in English and Spanish.",
    built: ["Online store and Stripe checkout", "English and Spanish versions", "Journal and customer reviews"],
    url: "https://thechicnoir.com",
    imageSet: screenshotSet("chic-noir"),
    placeholder: "#dbd5d2",
  },
  {
    name: "Ëlabba Play",
    type: "Community initiative",
    description: "A London initiative creating free milestone celebrations for children facing disadvantage, funded by donations and paid services.",
    built: ["Online donations", "Free celebration requests", "Services, gallery and journal"],
    url: "https://elabbaplay.com",
    imageSet: screenshotSet("elabba-play"),
    placeholder: "#9e8b8d",
  },
  {
    name: "Ëlabba Bar",
    type: "Brand experience",
    description: "An elegant virtual bar, with cocktails, events and experiences designed for the screen.",
    built: ["Age check", "Drinks and experiences catalogue", "Store checkout"],
    url: "https://bar.elabba.com",
    imageSet: screenshotSet("elabba-bar"),
    placeholder: "#181617",
  },
  {
    name: "Esther DCS",
    type: "Business website",
    description: "The main site for an events, branding and consultancy business.",
    built: ["Service packages", "Media galleries", "Blog"],
    url: "https://estherdcs.com",
    imageSet: screenshotSet("esther-dcs"),
    placeholder: "#d9cdc7",
  },
];

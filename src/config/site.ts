export const siteConfig = {
  name: "VizhaTickets",
  description:
    "Discover amazing events around you. Find and book tickets for concerts, cultural events, comedy shows, sports, festivals and more.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  navigation: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "Categories",
      href: "/categories",
    },
    {
      label: "About Us",
      href: "/about",
    },
  ],
};
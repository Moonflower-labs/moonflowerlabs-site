import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("services", "routes/services.tsx"),
  route("work", "routes/work.tsx"),
  route("thanks", "routes/thanks.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

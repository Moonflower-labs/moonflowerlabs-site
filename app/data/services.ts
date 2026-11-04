export const services: { title: string; description: string; goodFor: string; includes: string[] }[] = [
  {
    title: "Websites and online stores",
    description: "A fast site that works well on phones and that you can update yourself. If you sell online, it takes orders and payments too.",
    goodFor: "A business with no website, an old one that’s slow or hard to update, or one that’s ready to sell online.",
    includes: ["A design made for your business", "A site that works on phones", "Content you can update", "Stripe checkout if you sell online"],
  },
  {
    title: "Apps and internal tools",
    description: "Booking systems, customer portals and dashboards, for the parts of your business that off-the-shelf tools don’t handle well.",
    goodFor: "A business running on spreadsheets and email, or paying for software that only half fits.",
    includes: ["A web app built around how you work", "Your data in one place", "Booking systems and customer portals", "Dashboards and reports"],
  },
  {
    title: "Integrations and automation",
    description: "Connect Stripe, your accounting and your other tools, so orders and customer details stop being copied by hand.",
    goodFor: "A team retyping the same orders or customer details into several systems.",
    includes: ["Your tools connected", "Payments and orders that flow through", "Fewer copying mistakes", "Less admin each week"],
  },
];

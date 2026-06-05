/**
 * Seed 2 ready-to-use page templates into the Section Library (SavedBlock table).
 * Run with: node scripts/seed-section-library.mjs [shop]
 *   e.g.   node scripts/seed-section-library.mjs your-dev-store.myshopify.com
 * If no shop is passed, the script auto-detects from the Session table.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Template 1: Home Page ──────────────────────────────────────────────────
const homePageContent = [
  {
    type: "MarqueeBar",
    props: {
      id: "MarqueeBar-home-1",
      items: [
        { text: "Free Shipping on Orders Over $50" },
        { text: "New Arrivals Every Week" },
        { text: "Use Code WELCOME10 for 10% Off" },
        { text: "Shop Our Best Sellers" },
      ],
      speed: 40,
      backgroundColor: "#111827",
      textColor: "#ffffff",
      fontSize: 14,
      gap: 60,
      pauseOnHover: true,
    },
  },
  {
    type: "Hero",
    props: {
      id: "Hero-home-1",
      title: "Welcome to Our Store",
      subtitle: "Discover our curated collection of premium products",
      description:
        "Find everything you need with our wide selection of high-quality items, crafted for those who appreciate the finer things in life.",
      buttons: [
        { label: "Shop Now", link: "/collections/all", variant: "primary" },
        { label: "Learn More", link: "/pages/about", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
        alt: "Hero background",
        position: { x: "50%", y: "50%" },
      },
      overlayOpacity: 50,
      minHeight: 600,
      contentAlignment: "center",
      textColor: "#ffffff",
    },
  },
  {
    type: "ServiceSection",
    props: {
      id: "ServiceSection-home-1",
      title: "Why Choose Us",
      subtitle: "Everything you need, in one place",
      description:
        "We're committed to delivering the best experience for our customers.",
      columns: 3,
      cardStyle: "shadow",
      layoutStyle: "icon-center",
      contentAlign: "center",
      backgroundColor: "#ffffff",
      padding: 80,
      services: [
        {
          icon: "🚚",
          title: "Fast Delivery",
          description:
            "Get your orders delivered to your doorstep within 2-5 business days.",
        },
        {
          icon: "🔒",
          title: "Secure Payments",
          description:
            "Shop with confidence with our 100% secure payment gateway.",
        },
        {
          icon: "↩️",
          title: "Easy Returns",
          description:
            "Not satisfied? Return any product within 30 days, no questions asked.",
        },
      ],
    },
  },
  {
    type: "TestimonialSection",
    props: {
      id: "TestimonialSection-home-1",
      title: "What Our Customers Say",
      subtitle: "Thousands of happy customers and counting",
      columns: 3,
      layoutStyle: "centered",
      cardStyle: "shadow",
      showQuotes: true,
      sliderEnabled: false,
      contentAlign: "center",
      backgroundColor: "#f9fafb",
      padding: 80,
      testimonials: [
        {
          quote:
            "Absolutely love the quality! The products exceeded my expectations and the delivery was super fast.",
          author: "Sarah Johnson",
          role: "Verified Buyer",
          rating: 5,
        },
        {
          quote:
            "Best online shopping experience I've had. Customer support was incredibly helpful.",
          author: "Michael Chen",
          role: "Repeat Customer",
          rating: 5,
        },
        {
          quote:
            "Great selection, competitive prices, and beautiful packaging. Will definitely order again!",
          author: "Emma Williams",
          role: "Verified Buyer",
          rating: 5,
        },
      ],
    },
  },
  {
    type: "ContactSection",
    props: {
      id: "ContactSection-home-1",
      title: "Get in Touch",
      subtitle: "We'd love to hear from you",
      description:
        "Have a question or need help? Our team is here 7 days a week.",
      email: "hello@yourstore.com",
      phone: "+1 (555) 000-1234",
      showForm: true,
      layoutStyle: "split",
      buttonLabel: "Send Message",
      backgroundColor: "#ffffff",
      padding: 80,
      spacing: "normal",
      hoverEffects: true,
    },
  },
];

// ─── Template 2: About Us Page ──────────────────────────────────────────────
const aboutPageContent = [
  {
    type: "HeadingBlock",
    props: {
      id: "HeadingBlock-about-1",
      title: "About Us",
      alignment: "center",
    },
  },
  {
    type: "AboutSection",
    props: {
      id: "AboutSection-about-1",
      badge: "Our Story",
      title: "Built with Passion, Driven by Purpose",
      subtitle: "A brand that cares about quality and community",
      description:
        "We started with a simple idea: create products that people love and make the shopping experience genuinely enjoyable. Over the years, we've grown into a brand trusted by thousands of customers around the world. Our team is small but mighty, and every decision we make puts our customers first.",
      stats: [
        { value: "10K+", label: "Happy Customers" },
        { value: "500+", label: "Products" },
        { value: "5 ★", label: "Average Rating" },
        { value: "8+", label: "Years in Business" },
      ],
      primaryButtonLabel: "Shop Our Collection",
      primaryButtonLink: "/collections/all",
      secondaryButtonLabel: "",
      secondaryButtonLink: "",
      image: {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
      },
      imagePosition: "right",
      imageStyle: "rounded",
      imageRadius: 16,
      imageHeight: 460,
      imageShadow: false,
      textAlign: "left",
      verticalAlign: "center",
      columnGap: 64,
      maxWidth: 1200,
      padding: 80,
      showStats: true,
      backgroundColor: "#ffffff",
    },
  },
  {
    type: "GallerySection",
    props: {
      id: "GallerySection-about-1",
      title: "Our World",
      subtitle: "A glimpse behind the scenes",
      columns: 3,
      gap: 16,
      backgroundColor: "#f9fafb",
      padding: 80,
      images: [
        {
          url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
          alt: "Team meeting",
          caption: "Collaboration",
        },
        {
          url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
          alt: "Workspace",
          caption: "Our Studio",
        },
        {
          url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
          alt: "Team working",
          caption: "Teamwork",
        },
        {
          url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
          alt: "Products",
          caption: "Quality Products",
        },
        {
          url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
          alt: "Innovation",
          caption: "Always Innovating",
        },
        {
          url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
          alt: "Community",
          caption: "Community First",
        },
      ],
    },
  },
  {
    type: "TestimonialSection",
    props: {
      id: "TestimonialSection-about-1",
      title: "Loved by Our Community",
      subtitle: "Real words from real people",
      columns: 2,
      layoutStyle: "avatar-top",
      cardStyle: "bordered",
      showQuotes: true,
      sliderEnabled: false,
      contentAlign: "center",
      backgroundColor: "#ffffff",
      padding: 80,
      testimonials: [
        {
          quote:
            "This brand stands out. You can feel the care that goes into every product. I'm a customer for life.",
          author: "Jessica Taylor",
          role: "Brand Ambassador",
          rating: 5,
        },
        {
          quote:
            "I've recommended them to all my friends. The quality is unmatched and the team is super responsive.",
          author: "David Park",
          role: "Loyal Customer",
          rating: 5,
        },
      ],
    },
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  let shop = process.argv[2];

  if (!shop) {
    // Auto-detect from the Session table
    const session = await prisma.session.findFirst({
      orderBy: { id: "desc" },
    });
    if (!session) {
      console.error(
        "No shop provided and no Session found in DB.\n" +
          "Usage: node scripts/seed-section-library.mjs your-dev-store.myshopify.com"
      );
      process.exit(1);
    }
    shop = session.shop;
    console.log(`Auto-detected shop: ${shop}`);
  }

  const templates = [
    { name: "🏠 Home Page Template", content: homePageContent },
    { name: "👥 About Us Page Template", content: aboutPageContent },
  ];

  for (const { name, content } of templates) {
    // Check if a saved block with this name already exists for the shop
    const existing = await prisma.savedBlock.findFirst({
      where: { shop, name },
    });

    if (existing) {
      console.log(`  ⚠️  Already exists, skipping: "${name}"`);
      continue;
    }

    await prisma.savedBlock.create({
      data: {
        shop,
        name,
        content: JSON.stringify(content),
      },
    });
    console.log(`  ✅  Added: "${name}"`);
  }

  console.log("\nDone! Open the editor to see the templates in Section Library.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

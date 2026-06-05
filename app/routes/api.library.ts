import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import type { LibraryItem, LibraryTab } from "../lib/library.types";

// ─── Static library data ──────────────────────────────────────────────────────

const PAGES: LibraryItem[] = [
  {
    id: "page-home-template",
    name: "Home Page",
    description: "Complete home page with hero, services, testimonials, and contact section.",
    thumbnail: "",
    preview: "",
    category: "landing",
    tags: ["home", "hero", "services", "testimonials"],
    isPremium: false,
    difficulty: "beginner",
    usageCount: 0,
    rating: 4.8,
    data: {
      content: [
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
            description: "We're committed to delivering the best experience for our customers.",
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
                description: "Get your orders delivered to your doorstep within 2-5 business days.",
              },
              {
                icon: "🔒",
                title: "Secure Payments",
                description: "Shop with confidence with our 100% secure payment gateway.",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                description: "Not satisfied? Return any product within 30 days, no questions asked.",
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
            description: "Have a question or need help? Our team is here 7 days a week.",
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
      ],
      zones: {},
    },
  },
  {
    id: "page-about-template",
    name: "About Us Page",
    description: "Professional about page with story section, gallery, and testimonials.",
    thumbnail: "",
    preview: "",
    category: "about",
    tags: ["about", "story", "gallery", "team"],
    isPremium: false,
    difficulty: "beginner",
    usageCount: 0,
    rating: 4.7,
    data: {
      content: [
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
              "We started with a simple idea: create products that people love and make the shopping experience genuinely enjoyable. Over the years, we've grown into a brand trusted by thousands of customers around the world.",
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
      ],
      zones: {},
    },
  },
];

const BLOCKS: LibraryItem[] = [];

// ─── Categories ───────────────────────────────────────────────────────────────

const PAGE_CATEGORIES = [
  { id: "landing", name: "Landing / Home", icon: "🏠" },
  { id: "about", name: "About", icon: "👥" },
];

const BLOCK_CATEGORIES: { id: string; name: string; icon: string }[] = [];

// ─── Loader ───────────────────────────────────────────────────────────────────

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const tab = (url.searchParams.get("tab") ?? "blocks") as LibraryTab;
  const category = url.searchParams.get("category") ?? "";
  const search = (url.searchParams.get("search") ?? "").toLowerCase();

  const sourceItems = tab === "pages" ? PAGES : BLOCKS;
  const categories = tab === "pages" ? PAGE_CATEGORIES : BLOCK_CATEGORIES;

  let items = sourceItems;

  if (category) {
    items = items.filter((it) => it.category === category);
  }

  if (search) {
    items = items.filter(
      (it) =>
        it.name.toLowerCase().includes(search) ||
        it.description.toLowerCase().includes(search) ||
        it.tags.some((t) => t.includes(search)),
    );
  }

  return new Response(
    JSON.stringify({ tab, items, categories }),
    { headers: { "Content-Type": "application/json" } },
  );
};

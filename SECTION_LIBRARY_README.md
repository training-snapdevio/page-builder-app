# Section Library — Ready-to-Use Pages Guide

This guide covers every block available in the section library, the Puck data format, and how to build and seed complete page templates so merchants start with a polished page instead of a blank canvas.

---

## Table of Contents

1. [How the Data Format Works](#1-how-the-data-format-works)
2. [All Available Blocks](#2-all-available-blocks)
3. [Page Template Recipes](#3-page-template-recipes)
4. [Seeding Templates into the Database](#4-seeding-templates-into-the-database)
5. [Registering Blocks as Saved Blocks (Section Library)](#5-registering-blocks-as-saved-blocks-section-library)
6. [Complete JSON Examples](#6-complete-json-examples)

---

## 1. How the Data Format Works

Every page is stored in the `Page.data` column as a JSON string with this shape:

```jsonc
{
  "content": [
    // array of top-level blocks on the page
    {
      "type": "Hero",          // must match a key in puck.config.tsx components
      "props": { /* ... */ }   // all editable props for that block
    }
  ],
  "root": {
    "props": {
      "title": "My Page"       // page-level settings (title, theme, colors…)
    }
  },
  "zones": {
    // ColumnSection drop zones: "<blockId>:zone-0", "<blockId>:zone-1" …
    "abc123:zone-0": [
      { "type": "HeadingBlock", "props": { "title": "Hello", "alignment": "center" } }
    ]
  }
}
```

**Key rules:**
- `content` holds blocks in render order (top → bottom).
- Blocks that use `DropZone` (i.e. `ColumnSection`) store their children in `zones` using the key `"<parentId>:zone-N"`.
- `root.props` accepts: `title`, `theme`, `primaryColor`, `fontFamily`, `containerWidth`, `backgroundColor`, `textColor`.

---

## 2. All Available Blocks

### Layout

| Block | Purpose | Key Props |
|---|---|---|
| `ColumnSection` | Multi-column layout with drop zones | `layoutId` (preset), `gap`, `padding`, `background`, `minHeight` |
| `GlobalBlock` | Embed a saved global block by ID | `globalBlockId`, `_name` |
| `GlobalHeader` | Site header | `siteTitle`, `backgroundColor`, `textColor`, `navigationLinks[]`, `logo`, `ctaLabel`, `ctaLink`, `layoutStyle` (`default`/`centered`/`split`/`minimal`) |
| `GlobalFooter` | Site footer | `companyName`, `companyDescription`, `backgroundColor`, `textColor`, `quickLinks[]`, `socialLinks{}`, `copyrightText`, `showNewsletter` |

### Hero / Banners

| Block | Purpose | Key Props |
|---|---|---|
| `Hero` | Full-featured hero (supports slider, video bg, gradient, patterns) | `title`, `subtitle`, `badge`, `description`, `image{url,mode,position}`, `buttons[]`, `backgroundColor`, `gradientStartColor/EndColor`, `patternType`, `sliderEnabled`, `slides[]` |
| `GradientHero` | Simpler gradient-only hero with wave divider | `title`, `subtitle`, `description`, `gradientStart`, `gradientEnd`, `buttons[]` |
| `MarqueeBar` | Scrolling announcement ticker | `text`, `speed`, `direction` (`left`/`right`), `pauseOnHover`, `backgroundColor`, `textColor`, `fontSize`, `repeat` |

### Content Sections

| Block | Purpose | Key Props |
|---|---|---|
| `AboutSection` | Company/brand about section | `title`, `description`, `image{url,position}`, `stats[]`, `buttonLabel`, `buttonLink`, `badge` |
| `ServiceSection` | Services / features grid | `title`, `subtitle`, `services[]`, `columns` (2/3/4), `cardStyle` (`bordered`/`shadow`/`flat`), `layoutStyle` |
| `GallerySection` | Image gallery grid | `title`, `images[]`, `columns` (2/3/4), `gap`, `backgroundColor` |
| `PhotoCollage` | Multi-image collage with layouts | `images[]`, `layout` (`simple`/`mixed`/`hero`/`balanced`), `gap`, `borderRadius` |
| `TestimonialSection` | Customer testimonials | `testimonials[]`, `columns` (1/2/3), `sliderEnabled`, `layoutStyle`, `cardStyle` |
| `ContactSection` | Contact info + form | `title`, `email`, `phone`, `address`, `showForm`, `layoutStyle`, `socialLinks[]`, `workingHours[]`, `mapEmbed` |
| `Article` | Blog post / long-form article | `articleTitle`, `author`, `publishDate`, `body`, `titleColor`, `bodyFontSize` |
| `Accordian` | FAQ / accordion | `details[]` (each: `question`, `answer`) |
| `HeadingBlock` | Simple heading | `title`, `alignment` (`left`/`center`/`right`) |
| `Text` | Simple paragraph text | `title`, `alignment` |

---

## 3. Page Template Recipes

Here are the recommended block stacks for common page types. Combine them in `content[]` in this order.

### 🏠 Home Page
```
MarqueeBar        → "Free Shipping on all orders over $50 | New arrivals every week"
Hero              → gradient or image bg, two CTA buttons, slider for promotions
ServiceSection    → "Why Choose Us" — 3 icon cards (Quality / Speed / Support)
GallerySection    → Product / lifestyle image grid
TestimonialSection → Customer reviews slider
ContactSection    → Newsletter + contact info (no form)
```

### 👤 About Us Page
```
Hero              → image bg, single headline, no buttons
AboutSection      → brand story, team photo, 3 stats (Years / Orders / Countries)
ServiceSection    → "Our Values" — 3 cards (flat style)
TestimonialSection → Team or press quotes
ContactSection    → Contact info + form
```

### 📞 Contact Page
```
HeadingBlock      → "Get In Touch"
ContactSection    → split layout — form left, info + map right
GallerySection    → optional office/team photos
```

### 🛍 Landing / Campaign Page
```
MarqueeBar        → countdown or promo text
Hero              → full-screen bg image, bold headline, primary CTA
ServiceSection    → "What's Included" — 3 feature cards
TestimonialSection → social proof (slider, 1 column)
GallerySection    → product or lifestyle gallery
ContactSection    → email capture (showForm: true, no phone/address)
```

### 📝 Blog / Article Page
```
HeadingBlock      → article category label
Article           → full article body
TestimonialSection → related quotes (optional)
ServiceSection    → "Related Posts" (card layout with image-top style)
```

### ❓ FAQ Page
```
HeadingBlock      → "Frequently Asked Questions"
Accordian         → FAQ items
ContactSection    → "Still have questions?" — simple centered layout
```

---

## 4. Seeding Templates into the Database

### Option A — Prisma seed script (recommended)

Create `prisma/seed.ts` (or `seed.js`):

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Template definitions ────────────────────────────────────────────────────

const HOME_PAGE_DATA = {
  root: { props: { title: "Home" } },
  zones: {},
  content: [
    {
      type: "MarqueeBar",
      props: {
        text: "🔥 Free Shipping on Orders Over $50 | New Arrivals Every Week | COD Available 🔥",
        speed: 25,
        direction: "left",
        pauseOnHover: true,
        backgroundColor: "#000000",
        textColor: "#ffffff",
        fontSize: 14,
        padding: 10,
        repeat: 10,
      },
    },
    {
      type: "Hero",
      props: {
        title: "Welcome to Our Store",
        subtitle: "New Collection 2026",
        badge: "🔥 Limited Offer",
        description: "Discover premium products crafted just for you.",
        buttons: [
          { label: "Shop Now", link: "/collections/all", variant: "primary" },
          { label: "Learn More", link: "/pages/about-us", variant: "outline" },
        ],
        image: {
          url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400",
          mode: "bg",
          position: "right",
        },
        padding: 100,
        align: "text-center",
        overlayOpacity: 0.45,
        backgroundColor: "#1a1a2e",
        textColor: "#ffffff",
        verticalAlign: "items-center",
        contentWidth: "max-w-xl",
        patternType: "dots",
        sliderEnabled: false,
        slides: [],
        autoplay: true,
        interval: 5,
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
        transitionDuration: 500,
      },
    },
    {
      type: "ServiceSection",
      props: {
        title: "Why Choose Us",
        subtitle: "Built for you",
        columns: 3,
        cardStyle: "shadow",
        layoutStyle: "icon-center",
        contentAlign: "center",
        backgroundColor: "#ffffff",
        padding: 80,
        services: [
          {
            icon: "🚀",
            title: "Fast Delivery",
            description: "We ship to your door in 2–3 business days, guaranteed.",
          },
          {
            icon: "💎",
            title: "Premium Quality",
            description: "Every product is quality-checked before it ships.",
          },
          {
            icon: "🔄",
            title: "Easy Returns",
            description: "Not happy? Return within 30 days, no questions asked.",
          },
        ],
      },
    },
    {
      type: "TestimonialSection",
      props: {
        title: "What Our Customers Say",
        columns: 3,
        layoutStyle: "standard",
        cardStyle: "shadow",
        showQuotes: true,
        contentAlign: "center",
        backgroundColor: "#f8fafc",
        padding: 80,
        sliderEnabled: false,
        testimonials: [
          {
            quote: "Absolutely love the quality! Will definitely order again.",
            author: "Sarah M.",
            role: "Verified Buyer",
            rating: 5,
          },
          {
            quote: "Fast shipping and great packaging. Very impressed!",
            author: "James T.",
            role: "Verified Buyer",
            rating: 5,
          },
          {
            quote: "Best purchase I've made this year. Highly recommend.",
            author: "Priya K.",
            role: "Verified Buyer",
            rating: 5,
          },
        ],
      },
    },
  ],
};

const ABOUT_PAGE_DATA = {
  root: { props: { title: "About Us" } },
  zones: {},
  content: [
    {
      type: "Hero",
      props: {
        title: "Our Story",
        subtitle: "Built with passion since 2020",
        description: "We believe great products change lives.",
        buttons: [],
        image: {
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400",
          mode: "bg",
          position: "right",
        },
        padding: 100,
        align: "text-center",
        overlayOpacity: 0.5,
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        verticalAlign: "items-center",
        contentWidth: "max-w-xl",
        sliderEnabled: false,
        slides: [],
      },
    },
    {
      type: "AboutSection",
      props: {
        badge: "Who We Are",
        title: "A team that cares",
        description:
          "Founded in 2020, we've helped thousands of customers find products they love. Our mission is simple: deliver quality you can trust, every single time.",
        image: {
          url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
          position: "right",
        },
        stats: [
          { value: "50K+", label: "Happy Customers" },
          { value: "99%", label: "Satisfaction Rate" },
          { value: "5 Years", label: "In Business" },
        ],
        buttonLabel: "Meet the Team",
        buttonLink: "#",
        backgroundColor: "#ffffff",
        padding: 80,
        textAlign: "left",
      },
    },
    {
      type: "TestimonialSection",
      props: {
        title: "Trusted by Thousands",
        columns: 1,
        layoutStyle: "centered",
        cardStyle: "minimal",
        sliderEnabled: true,
        autoplay: true,
        interval: 4,
        showArrows: true,
        showDots: true,
        backgroundColor: "#f1f5f9",
        padding: 80,
        testimonials: [
          {
            quote: "This brand has completely changed how I shop online.",
            author: "Alex R.",
            role: "Loyal Customer",
            rating: 5,
          },
          {
            quote: "Every order arrives on time and exactly as described.",
            author: "Maria L.",
            role: "Returning Customer",
            rating: 5,
          },
        ],
      },
    },
  ],
};

const CONTACT_PAGE_DATA = {
  root: { props: { title: "Contact Us" } },
  zones: {},
  content: [
    {
      type: "HeadingBlock",
      props: { title: "Get In Touch", alignment: "center" },
    },
    {
      type: "ContactSection",
      props: {
        title: "We'd Love to Hear from You",
        subtitle: "Contact Us",
        description: "Fill in the form and we'll get back to you within 24 hours.",
        email: "hello@yourstore.com",
        phone: "+1 (800) 123-4567",
        address: "123 Commerce St, New York, NY 10001",
        showForm: true,
        buttonLabel: "Send Message",
        layoutStyle: "split",
        cardStyle: "modern",
        backgroundColor: "#f8fafc",
        padding: 80,
        accentColor: "#0158ad",
        workingHours: [
          { days: "Mon – Fri", hours: "9:00 AM – 6:00 PM" },
          { days: "Saturday", hours: "10:00 AM – 4:00 PM" },
          { days: "Sunday", hours: "Closed" },
        ],
        responseTime: "Within 24 hours",
      },
    },
  ],
};

const FAQ_PAGE_DATA = {
  root: { props: { title: "FAQ" } },
  zones: {},
  content: [
    {
      type: "HeadingBlock",
      props: { title: "Frequently Asked Questions", alignment: "center" },
    },
    {
      type: "Accordian",
      props: {
        details: [
          {
            question: "How long does shipping take?",
            answer:
              "Standard shipping takes 3–5 business days. Express options are available at checkout.",
          },
          {
            question: "What is your return policy?",
            answer:
              "We offer a full 30-day return policy. Items must be unused and in original packaging.",
          },
          {
            question: "Do you ship internationally?",
            answer:
              "Yes! We ship to over 50 countries. International delivery takes 7–14 business days.",
          },
          {
            question: "How do I track my order?",
            answer:
              "Once shipped, you'll receive a tracking link via email. You can also check your order status in your account.",
          },
          {
            question: "Can I change or cancel my order?",
            answer:
              "Orders can be modified or cancelled within 2 hours of placement. Contact us immediately if needed.",
          },
        ],
      },
    },
    {
      type: "ContactSection",
      props: {
        title: "Still Have Questions?",
        description: "Our support team is here to help.",
        email: "support@yourstore.com",
        showForm: false,
        layoutStyle: "centered",
        backgroundColor: "#ffffff",
        padding: 60,
        accentColor: "#0158ad",
      },
    },
  ],
};

// ─── Seed function ────────────────────────────────────────────────────────────

const SHOP = "your-dev-store.myshopify.com"; // change to your dev store

async function main() {
  const pages = [
    { shop: SHOP, slug: "home",       title: "Home",       data: HOME_PAGE_DATA },
    { shop: SHOP, slug: "about-us",   title: "About Us",   data: ABOUT_PAGE_DATA },
    { shop: SHOP, slug: "contact-us", title: "Contact Us", data: CONTACT_PAGE_DATA },
    { shop: SHOP, slug: "faq",        title: "FAQ",        data: FAQ_PAGE_DATA },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { shop_slug: { shop: page.shop, slug: page.slug } },
      update: { data: JSON.stringify(page.data), title: page.title },
      create: {
        shop: page.shop,
        slug: page.slug,
        title: page.title,
        data: JSON.stringify(page.data),
      },
    });
    console.log(`✅  Seeded page: /${page.slug}`);
  }

  console.log("\nDone. Open the editor to preview each page.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to `package.json`:**
```json
{
  "prisma": {
    "seed": "ts-node --esm prisma/seed.ts"
  }
}
```

**Run:**
```bash
npx prisma db seed
```

---

### Option B — API call (runtime, per-shop)

Use this to create a template page for a merchant at install time or on demand:

```ts
// In an action or loader after authentication
await fetch(`/api/pages/${slug}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: HOME_PAGE_DATA }),
});
```

Or directly via `createPage` + `updatePage` from `app/lib/pages.server.ts`:

```ts
import { createPage, updatePage } from "../lib/pages.server";

const page = await createPage(shop, "Home");
await updatePage(shop, page.slug, HOME_PAGE_DATA);
```

---

## 5. Registering Blocks as Saved Blocks (Section Library)

Saved blocks appear in the **Section Library** panel in the editor. Any combination of blocks can be saved as a reusable section.

### Via API

```ts
// POST /api/saved-blocks
await fetch("/api/saved-blocks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Hero — Dark Gradient",
    content: [
      {
        type: "Hero",
        props: {
          title: "Your Headline Here",
          description: "Your subheadline.",
          buttons: [{ label: "Shop Now", link: "#", variant: "primary" }],
          image: { url: "", mode: "bg", position: "right" },
          backgroundColor: "#1a1a2e",
          gradientStartColor: "#1a1a2e",
          gradientEndColor: "#0158ad",
          gradientDirection: "135deg",
          textColor: "#ffffff",
          padding: 100,
          align: "text-center",
          overlayOpacity: 0,
          contentWidth: "max-w-xl",
          verticalAlign: "items-center",
          sliderEnabled: false,
          slides: [],
        },
      },
    ],
    thumbnail: "", // optional preview image URL
  }),
});
```

### Seed saved blocks in bulk

Add to your `prisma/seed.ts`:

```ts
const SAVED_BLOCKS = [
  {
    name: "Marquee Bar — Black",
    content: [
      {
        type: "MarqueeBar",
        props: {
          text: "🔥 Free Shipping | 30-Day Returns | COD Available 🔥",
          speed: 25,
          direction: "left",
          pauseOnHover: true,
          backgroundColor: "#000000",
          textColor: "#ffffff",
          fontSize: 14,
          padding: 10,
          repeat: 10,
        },
      },
    ],
  },
  {
    name: "Services — 3 Columns",
    content: [
      {
        type: "ServiceSection",
        props: {
          title: "Our Services",
          columns: 3,
          cardStyle: "shadow",
          layoutStyle: "icon-center",
          contentAlign: "center",
          backgroundColor: "#ffffff",
          padding: 80,
          services: [
            { icon: "⚡", title: "Service One", description: "Description here." },
            { icon: "🎯", title: "Service Two", description: "Description here." },
            { icon: "🔒", title: "Service Three", description: "Description here." },
          ],
        },
      },
    ],
  },
  {
    name: "Testimonials — Slider",
    content: [
      {
        type: "TestimonialSection",
        props: {
          title: "What Customers Say",
          columns: 1,
          layoutStyle: "centered",
          cardStyle: "shadow",
          sliderEnabled: true,
          autoplay: true,
          interval: 4,
          showArrows: true,
          showDots: true,
          backgroundColor: "#f8fafc",
          padding: 80,
          testimonials: [
            { quote: "Amazing product!", author: "Customer A", rating: 5 },
            { quote: "Will order again.", author: "Customer B", rating: 5 },
          ],
        },
      },
    ],
  },
  {
    name: "FAQ — Accordion",
    content: [
      {
        type: "Accordian",
        props: {
          details: [
            { question: "Question 1?", answer: "Answer 1." },
            { question: "Question 2?", answer: "Answer 2." },
            { question: "Question 3?", answer: "Answer 3." },
          ],
        },
      },
    ],
  },
  {
    name: "Contact — Split Layout",
    content: [
      {
        type: "ContactSection",
        props: {
          title: "Get In Touch",
          email: "hello@yourstore.com",
          phone: "+1 (800) 000-0000",
          showForm: true,
          layoutStyle: "split",
          backgroundColor: "#f8fafc",
          padding: 80,
          accentColor: "#0158ad",
        },
      },
    ],
  },
];

for (const block of SAVED_BLOCKS) {
  const exists = await prisma.savedBlock.findFirst({
    where: { shop: SHOP, name: block.name },
  });
  if (!exists) {
    await prisma.savedBlock.create({
      data: {
        shop: SHOP,
        name: block.name,
        content: JSON.stringify(block.content),
      },
    });
    console.log(`✅  Saved block: ${block.name}`);
  }
}
```

---

## 6. Complete JSON Examples

### Minimal valid page (blank canvas)
```json
{
  "content": [],
  "root": { "props": { "title": "New Page" } },
  "zones": {}
}
```

### Single Hero block
```json
{
  "content": [
    {
      "type": "Hero",
      "props": {
        "title": "Welcome",
        "description": "Your tagline here.",
        "buttons": [{ "label": "Shop Now", "link": "/collections/all", "variant": "primary" }],
        "image": { "url": "", "mode": "bg", "position": "right" },
        "backgroundColor": "#1e293b",
        "textColor": "#ffffff",
        "padding": 100,
        "align": "text-center",
        "overlayOpacity": 0,
        "verticalAlign": "items-center",
        "contentWidth": "max-w-xl",
        "sliderEnabled": false,
        "slides": []
      }
    }
  ],
  "root": { "props": { "title": "Home" } },
  "zones": {}
}
```

### ColumnSection with children (2-column)
```json
{
  "content": [
    {
      "type": "ColumnSection",
      "props": {
        "id": "col-abc123",
        "layoutId": "2-equal",
        "gap": "24px",
        "padding": "40px",
        "background": "#ffffff",
        "minHeight": "200px"
      }
    }
  ],
  "root": { "props": { "title": "Columns Demo" } },
  "zones": {
    "col-abc123:zone-0": [
      { "type": "HeadingBlock", "props": { "title": "Left Column", "alignment": "left" } }
    ],
    "col-abc123:zone-1": [
      { "type": "Text", "props": { "title": "Right column content here.", "alignment": "left" } }
    ]
  }
}
```

---

## Quick Reference — Block Defaults

| Block | Required Props | Optional Highlights |
|---|---|---|
| `Hero` | `title`, `description`, `buttons[]`, `image{}` | `gradientStartColor/EndColor`, `sliderEnabled`, `slides[]`, `videoSettings{}`, `patternType` |
| `GradientHero` | `title`, `description` | `gradientStart`, `gradientEnd`, `buttons[]` |
| `MarqueeBar` | `text` | `speed`, `direction`, `pauseOnHover`, `backgroundColor`, `textColor` |
| `AboutSection` | `title`, `description` | `stats[]`, `image{}`, `buttonLabel/Link`, `badge` |
| `ServiceSection` | `services[]` | `columns`, `cardStyle`, `layoutStyle`, `contentAlign` |
| `GallerySection` | `images[]` | `columns`, `gap`, `title` |
| `PhotoCollage` | `images[]` | `layout` (`simple`/`mixed`/`hero`/`balanced`), `gap`, `borderRadius` |
| `TestimonialSection` | `testimonials[]` | `columns`, `sliderEnabled`, `layoutStyle`, `cardStyle` |
| `ContactSection` | — (all optional) | `showForm`, `layoutStyle`, `email`, `phone`, `workingHours[]`, `mapEmbed` |
| `Article` | `articleTitle`, `body` | `author`, `publishDate`, `bodyFontSize`, `titleAlign` |
| `Accordian` | `details[]` | — |
| `HeadingBlock` | `title` | `alignment` |
| `Text` | `title` | `alignment` |
| `ColumnSection` | `layoutId` | `gap`, `padding`, `background`, `minHeight` |
| `GlobalHeader` | `siteTitle` | `navigationLinks[]`, `logo`, `ctaLabel`, `layoutStyle` |
| `GlobalFooter` | `companyName` | `quickLinks[]`, `socialLinks{}`, `showNewsletter`, `copyrightText` |

---

## Tips

- **Images**: Use `https://images.unsplash.com` for placeholder images during development. Replace with Shopify CDN URLs after upload via the editor's image field.
- **Colors**: All color props accept any valid CSS color (`#hex`, `rgb()`, `hsl()`).
- **ColumnSection `layoutId`**: Valid values are the `id` fields from `FLEX_LAYOUTS` and `GRID_LAYOUTS` in `puck.config.tsx` (e.g. `"2-equal"`, `"3-equal"`, `"1-2"`, `"2-1"`, etc.).
- **Block IDs**: When writing `zones`, the parent block must have an explicit `id` prop matching the zone key prefix. Puck normally auto-generates these; set them manually when seeding.
- **Shopify size limit**: The rendered HTML must be under **512 KB**. Avoid embedding base64 images — always use CDN URLs.

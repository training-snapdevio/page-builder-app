// Shared prop types for the Puck page-builder config.
//
// NOTE: puck.config.tsx uses `@ts-nocheck`, so these types are documentation /
// editor-assist only — they are not enforced at build time. They are kept in one
// place so block authors have a single reference for each block's prop shape.

export type RootProps = {
  title?: string;

  theme: "light" | "dark";

  containerWidth: string;

  primaryColor: string;

  fontFamily: string;

  headerData?: any;

  footerData?: any;

  isGlobalEditor?: boolean;

  backgroundColor?: string;

  textColor?: string;
};

type Props = {
  MarqueeBar: {
    text: string;

    speed: number;

    direction: "left" | "right";

    pauseOnHover: boolean;

    backgroundColor: string;

    textColor: string;

    fontSize: number;

    padding: number;

    repeat: number;
  };

  HeadingBlock: {
    title: string;
    alignment: string;
    subtitle?: string;
    subtitleColor?: string;
    subtitleSize?: number;
    dividerType?: "none" | "line" | "double-line" | "line-with-icon";
    dividerColor?: string;
    dividerLength?: number;
    dividerThickness?: number;
    dividerAlignment?: "left" | "center" | "right";
    dividerIcon?: string;
  };

  Text: { title: string; alignment: string };

  GlobalBlock: { globalBlockId: string; _name: string };



  Article: {
    articleTitle: string;
    author: string;
    showAuthor: boolean;
    publishDate: string;
    showDate: boolean;
    body: string;
    featuredImage?: string;
    imagePosition?: "top" | "left" | "right";
    imageStyle?: "none" | "rectangle" | "square" | "circle";
    imageHeight?: number;
    imageBorderRadius?: number;
    titleAlign?: "left" | "center" | "right";
    lineHeight?: number;
    letterSpacing?: number;
    titleFontWeight?: string;
    metaFontWeight?: string;
    bodyFontWeight?: string;
    backgroundColor?: string;
    titleColor?: string;
    bodyColor?: string;
    metaColor?: string;
    contentWidth?: "small" | "medium" | "large";
  };

  PhotoCollage: {
    layout: "mixed" | "grid" | "brick" | "carousel";
    images: { url: string; alt?: string }[];
    gap: number;
    borderRadius: number;
    objectFit: "cover" | "contain" | "fill";
    aspectRatio: "1:1" | "4:3" | "16:9" | "3:2";
    hoverEffect: "none" | "zoom" | "darken";
    boxShadow: boolean;
    shadowStrength: "subtle" | "medium" | "strong";
    hideDesktop: boolean;
    hideTablet: boolean;
    hideMobile: boolean;
  };
};

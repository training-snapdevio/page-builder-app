// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// "Common" components map.
//
// These were originally authored together as a single Puck component map. Each
// member now lives in its own file; this module re-assembles them into the
// `commonComponents` map the registry spreads into `config`/`previewConfig`.
//
//   GlobalBlock / GlobalHeader / GlobalFooter — global (reusable) block slots
//   MarqueeBar, HeadingBlock, Text, Article, PhotoCollage — content blocks
// ─────────────────────────────────────────────────────────────────────────────

import { GlobalBlockComponent } from "@/puck-blocks/blocks/global-block";
import { GlobalHeaderComponent } from "@/puck-blocks/blocks/global-header";
import { GlobalFooterComponent } from "@/puck-blocks/blocks/global-footer";
import { MarqueeBarComponent } from "@/puck-blocks/blocks/marquee";
import { HeadingBlockComponent } from "@/puck-blocks/blocks/heading";
import { TextComponent } from "@/puck-blocks/blocks/text";
import { ArticleComponent } from "@/puck-blocks/blocks/article";
import { PhotoCollageComponent } from "@/puck-blocks/blocks/photo-collage";

const commonComponents: any = {
  GlobalBlock: GlobalBlockComponent,
  GlobalHeader: GlobalHeaderComponent,
  GlobalFooter: GlobalFooterComponent,
  MarqueeBar: MarqueeBarComponent,
  HeadingBlock: HeadingBlockComponent,
  Text: TextComponent,
  Article: ArticleComponent,
  PhotoCollage: PhotoCollageComponent,
};

export { commonComponents };

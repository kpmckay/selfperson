import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Rehype plugin: convert image-only paragraphs into <figure>/<figcaption> elements.
// Handles two cases:
//   1. <p><img><img>…</p>  — Astro collapses adjacent lines into one <p>
//   2. Consecutive <p><img></p> blocks separated by blank lines
// In both cases multiple images are wrapped in <div class="figure-row">.
function rehypeFigure() {
  return function (tree) {
    // Returns all <img> nodes if this paragraph contains only images, else null.
    function extractImgs(node) {
      if (node.type !== 'element' || node.tagName !== 'p') return null;
      const meaningful = node.children.filter(
        c => !(c.type === 'text' && !c.value.trim()) && c.tagName !== 'br'
      );
      if (meaningful.length > 0 && meaningful.every(c => c.tagName === 'img')) {
        return meaningful;
      }
      return null;
    }

    function toFigure(img) {
      const alt = img.properties?.alt || '';
      const children = [img];
      if (alt) {
        children.push({
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: alt }]
        });
      }
      return { type: 'element', tagName: 'figure', properties: {}, children };
    }

    function toRow(figures) {
      return figures.length === 1 ? figures[0] : {
        type: 'element',
        tagName: 'div',
        properties: { className: ['figure-row'] },
        children: figures
      };
    }

    function walk(node) {
      if (!node.children) return;
      const next = [];
      let i = 0;
      while (i < node.children.length) {
        if (node.children[i].type === 'text' && !node.children[i].value.trim()) {
          i++; continue;
        }
        const imgs = extractImgs(node.children[i]);
        if (imgs) {
          if (imgs.length > 1) {
            // Multiple images already in one paragraph — make a row directly
            next.push(toRow(imgs.map(toFigure)));
            i++;
          } else {
            // Single-image paragraph — collect consecutive ones into a row
            const figures = [toFigure(imgs[0])];
            i++;
            while (i < node.children.length) {
              if (node.children[i].type === 'text' && !node.children[i].value.trim()) {
                i++; continue;
              }
              const nextImgs = extractImgs(node.children[i]);
              if (nextImgs?.length === 1) { figures.push(toFigure(nextImgs[0])); i++; }
              else break;
            }
            next.push(toRow(figures));
          }
        } else {
          walk(node.children[i]);
          next.push(node.children[i]);
          i++;
        }
      }
      node.children = next;
    }
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://kpmckay.io',
  integrations: [tailwind()],
  markdown: {
    rehypePlugins: [rehypeFigure],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});

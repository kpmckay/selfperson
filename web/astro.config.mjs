import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Rehype plugin: convert standalone image paragraphs into <figure>/<figcaption>
// elements. Consecutive image paragraphs are wrapped in a <div class="figure-row">
// so they sit side-by-side and wrap when space runs out.
function rehypeFigure() {
  return function (tree) {
    // Returns the single <img> if this node is a paragraph containing only an
    // image (plus optional whitespace/br nodes), otherwise null.
    function extractImg(node) {
      if (node.type !== 'element' || node.tagName !== 'p') return null;
      const meaningful = node.children.filter(
        c => !(c.type === 'text' && !c.value.trim()) && c.tagName !== 'br'
      );
      if (meaningful.length === 1 && meaningful[0].tagName === 'img') return meaningful[0];
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

    function walk(node) {
      if (!node.children) return;
      const next = [];
      let i = 0;
      while (i < node.children.length) {
        // Skip bare whitespace text nodes between block elements
        if (node.children[i].type === 'text' && !node.children[i].value.trim()) {
          i++; continue;
        }
        const img = extractImg(node.children[i]);
        if (img) {
          // Collect all consecutive image paragraphs into one group
          const figures = [toFigure(img)];
          i++;
          while (i < node.children.length) {
            if (node.children[i].type === 'text' && !node.children[i].value.trim()) {
              i++; continue;
            }
            const nextImg = extractImg(node.children[i]);
            if (nextImg) { figures.push(toFigure(nextImg)); i++; }
            else break;
          }
          if (figures.length === 1) {
            next.push(figures[0]);
          } else {
            next.push({
              type: 'element',
              tagName: 'div',
              properties: { className: ['figure-row'] },
              children: figures
            });
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

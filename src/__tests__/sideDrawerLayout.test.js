import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GithubIcon } from '../components/GithubIcon';

describe('SideDrawer & GitHub Integration Validation', () => {
  it('should render GithubIcon SVG with correct attributes', () => {
    const html = renderToString(React.createElement(GithubIcon, { size: 20 }));
    expect(html).toContain('<svg');
    expect(html).toContain('width="20"');
    expect(html).toContain('height="20"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('fill="currentColor"');
  });

  it('should ensure CSS file has balanced braces and no unclosed blocks', async () => {
    const fs = await import('fs');
    const css = fs.readFileSync('src/index.css', 'utf8');
    let depth = 0;
    for (let c of css) {
      if (c === '{') depth++;
      if (c === '}') depth--;
    }
    expect(depth).toBe(0);
  });

  it('should verify drawer-clean-panel and drawer-overlay classes exist in index.css', async () => {
    const fs = await import('fs');
    const css = fs.readFileSync('src/index.css', 'utf8');
    expect(css).toContain('.drawer-clean-panel');
    expect(css).toContain('.drawer-overlay');
    expect(css).toContain('.nav-item-clean');
  });
});

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { AgentWorkspaceScene } from "../agentWorkspaceScene";

vi.mock('next/link', () => ({ default: ({ children, prefetch, ...props }: React.ComponentProps<'a'> & { prefetch?: boolean }) => <a {...props} data-prefetch={String(prefetch)}>{children}</a> }));

describe('Agent 工作台入口', () => {
  it('空会话紧凑布局保留六个真实入口，不加载管理页面或摆放无任务用途的控件', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () => root.render(<AgentWorkspaceScene compact />));
      expect(container.querySelector('section')?.classList.contains('om-agent-station--compact')).toBe(true);
      expect([...container.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['/chat', '/runs', '/approvals', '/skills', '/memories', '/tools']);
      expect([...container.querySelectorAll('a')].every(link => link.getAttribute('data-prefetch') === 'false')).toBe(true);
      expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Agent 工作台入口');
      expect(container.querySelector('a[href="/chat"]')?.getAttribute('aria-current')).toBe('page');
      expect(container.querySelectorAll('button, input')).toHaveLength(0);
      expect(container.querySelectorAll('canvas')).toHaveLength(0);
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});

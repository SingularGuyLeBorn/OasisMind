import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { AgentWorkspaceScene } from "../agentWorkspaceScene";

vi.mock('next/link', () => ({ default: ({ children, prefetch, ...props }: React.ComponentProps<'a'> & { prefetch?: boolean }) => <a {...props} data-prefetch={String(prefetch)}>{children}</a> }));

describe('Agent 工作台视觉交互', () => {
  it('切视角只改变焦点，保留六个真实入口，不触发业务请求', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () => root.render(<AgentWorkspaceScene compact />));
      expect([...container.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['/chat', '/skills', '/memories', '/runs', '/approvals', '/tools']);
      expect([...container.querySelectorAll('a')].every(link => link.getAttribute('data-prefetch') === 'false')).toBe(true);
      const buttons = [...container.querySelectorAll<HTMLButtonElement>('button')];
      await act(async () => buttons[1].click());
      expect(container.querySelector('section')?.getAttribute('data-view')).toBe('execution');
      expect(container.querySelector('button[aria-pressed="true"]')?.textContent).toBe('执行');
      expect([...container.querySelectorAll('.is-highlighted')].map(link => link.textContent)).toEqual(['运行记录', '审批']);
      expect(container.textContent).toContain('处理需要你确认的审批');
      await act(async () => buttons[2].click());
      expect([...container.querySelectorAll('.is-highlighted')].map(link => link.textContent)).toEqual(['技能', '记忆', '工具']);
      expect(container.querySelectorAll('canvas')).toHaveLength(0);
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});

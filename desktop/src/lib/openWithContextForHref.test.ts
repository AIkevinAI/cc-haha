import { describe, it, expect, vi } from 'vitest'

// Mock isLoopbackHostname so previewLinkRouter classifies localhost properly
vi.mock('./desktopRuntime', () => ({
  isLoopbackHostname: (h: string) => h === 'localhost' || h === '127.0.0.1' || h === '::1',
}))

import { openWithContextForHref } from './openWithContextForHref'
import { previewFsUrl } from './handlePreviewLink'

const BASE = 'http://127.0.0.1:4321'
const SESSION = 's1'

describe('openWithContextForHref', () => {
  it('localhost href → {kind:"url", url}', () => {
    const result = openWithContextForHref('http://localhost:5173/', { sessionId: SESSION, serverBaseUrl: BASE })
    expect(result).toEqual({ kind: 'url', url: 'http://localhost:5173/' })
  })

  it('remote href → {kind:"url", url}', () => {
    const result = openWithContextForHref('https://example.com/page', { sessionId: SESSION, serverBaseUrl: BASE })
    expect(result).toEqual({ kind: 'url', url: 'https://example.com/page' })
  })

  it('relative previewable path with workDir → absolutePath resolved', () => {
    const result = openWithContextForHref('docs/a.md', { sessionId: SESSION, serverBaseUrl: BASE, workDir: '/w' })
    expect(result).toEqual({ kind: 'file', absolutePath: '/w/docs/a.md', relPath: 'docs/a.md', previewable: true })
  })

  it('absolute path in browser-file → inAppBrowserUrl via previewFsUrl', () => {
    const result = openWithContextForHref('/x/p.html', { sessionId: SESSION, serverBaseUrl: BASE })
    expect(result).toEqual({
      kind: 'file',
      absolutePath: '/x/p.html',
      inAppBrowserUrl: previewFsUrl(BASE, SESSION, '/x/p.html'),
    })
  })

  it('#anchor href → null (ignored)', () => {
    const result = openWithContextForHref('#anchor', { sessionId: SESSION, serverBaseUrl: BASE })
    expect(result).toBeNull()
  })

  it('empty href → null', () => {
    const result = openWithContextForHref('', { sessionId: SESSION, serverBaseUrl: BASE })
    expect(result).toBeNull()
  })

  it('relative path with trailing slash on workDir → correct absolutePath', () => {
    const result = openWithContextForHref('src/index.ts', { sessionId: SESSION, serverBaseUrl: BASE, workDir: '/proj/' })
    expect(result).toEqual({ kind: 'file', absolutePath: '/proj/src/index.ts', relPath: 'src/index.ts', previewable: true })
  })
})

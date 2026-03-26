import { test, expect } from '@playwright/test'

test.describe('첫 방문', () => {
  test('온보딩 슬라이드 없이 바로 투표 페이지 진입', async ({ page }) => {
    // 첫 방문 시뮬레이션 — localStorage 초기화
    await page.addInitScript(() => {
      localStorage.clear()
    })

    await page.goto('/')

    // 투표 버튼이 바로 노출됨 (온보딩 슬라이드 없음)
    await expect(page.getByRole('button', { name: /올라갈|망할|모르겠/ }).first()).toBeVisible({ timeout: 10000 })
  })
})

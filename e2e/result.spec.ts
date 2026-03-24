import { test, expect } from '@playwright/test'

test.describe('결과 페이지', () => {
  test('결과 + 캐릭터 적중 표시', async ({ page }) => {
    await page.goto('/result')

    // 온보딩 건너뛰기
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 결과 페이지 콘텐츠 확인
    await expect(page.getByText(/결과|적중|점수/).first()).toBeVisible({ timeout: 5000 })
  })
})

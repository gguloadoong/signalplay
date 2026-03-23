import { test, expect } from '@playwright/test'

test.describe('피드 페이지', () => {
  test('피드 표시 + 필터 전환', async ({ page }) => {
    await page.goto('/')

    // 온보딩 건너뛰기
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 피드 탭으로 이동
    await page.getByRole('tab', { name: '피드' }).click()
    await expect(page.getByText('AI 시그널 피드')).toBeVisible()

    // 피드 카드가 최소 1개 표시
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10000 })

    // 필터 버튼 클릭 (AI 토론)
    const debateFilter = page.getByText('🤖 AI 토론')
    if (await debateFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await debateFilter.click()
      // 토론 카드만 표시 확인
      await expect(page.getByText('강세론').first()).toBeVisible()
    }

    // 전체 필터로 복귀
    await page.getByText('전체').click()
  })
})

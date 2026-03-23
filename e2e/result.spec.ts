import { test, expect } from '@playwright/test'

test.describe('결과 페이지', () => {
  test('카드 플립 → 점수 표시', async ({ page }) => {
    await page.goto('/')

    // 온보딩 건너뛰기
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 결과 탭으로 이동
    await page.getByRole('tab', { name: '결과' }).click()
    await expect(page.getByText('어제의 결과')).toBeVisible()

    // 첫 번째 숨겨진 카드 클릭 (플립)
    const hiddenCard = page.getByText('탭하여 결과 확인').first()
    if (await hiddenCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await hiddenCard.click()

      // 결과가 표시됨 (정답 또는 오답)
      await expect(
        page.getByText(/정답|오답/).first()
      ).toBeVisible({ timeout: 3000 })

      // 점수 표시
      await expect(
        page.getByText(/점/).first()
      ).toBeVisible()
    }
  })
})

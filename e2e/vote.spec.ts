import { test, expect } from '@playwright/test'

test.describe('투표 페이지', () => {
  test('질문 표시 → 캐릭터 예측 → 투표 → 군중 비율', async ({ page }) => {
    await page.goto('/')

    // 온보딩 건너뛰기
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 질문이 표시될 때까지 대기
    await expect(page.getByRole('button', { name: /호재/ }).first()).toBeVisible({ timeout: 10000 })

    // 캐릭터 예측이 표시되는지 확인
    await expect(page.getByText('엑셀형').first()).toBeVisible()
    await expect(page.getByText('운형').first()).toBeVisible()

    // 호재 투표
    await page.getByRole('button', { name: /호재/ }).first().click()

    // 투표 후 군중 비율이 나타나는지 확인
    await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 3000 })
  })

  test('하단 탭 전환 (투표 ↔ 결과)', async ({ page }) => {
    await page.goto('/')

    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 결과 탭 클릭
    await page.getByRole('tab', { name: '결과' }).click()
    await expect(page.getByText(/결과|적중|캐릭터/).first()).toBeVisible()

    // 투표 탭 복귀
    await page.getByRole('tab', { name: '투표' }).click()
  })
})

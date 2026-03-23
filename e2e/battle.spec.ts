import { test, expect } from '@playwright/test'

test.describe('배틀 페이지', () => {
  test('시그널 카드 표시 → 예측 → 확신도 → 제출', async ({ page }) => {
    await page.goto('/')

    // 온보딩 건너뛰기 (첫 방문 시)
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 시그널 카드가 표시될 때까지 대기 (예측 버튼이 보이면 카드가 렌더된 것)
    await expect(page.getByRole('button', { name: /호재/ }).first()).toBeVisible({ timeout: 10000 })

    // 첫 번째 시그널에서 "호재" 예측
    const firstBullish = page.getByRole('button', { name: /호재/ }).first()
    await firstBullish.click()

    // 확신도 x2 선택
    const confBtn = page.getByRole('button', { name: /확신도 2배/ }).first()
    if (await confBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confBtn.click()
    }

    // 예측 카운터가 업데이트됐는지 확인
    await expect(page.getByText(/1\/3|1\/1/)).toBeVisible()
  })

  test('하단 네비게이션 탭 전환', async ({ page }) => {
    await page.goto('/')

    // 온보딩 건너뛰기
    const skipBtn = page.getByText('건너뛰기')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // 피드 탭 클릭
    await page.getByRole('tab', { name: '피드' }).click()
    await expect(page.getByText('AI 시그널 피드')).toBeVisible()

    // 결과 탭 클릭
    await page.getByRole('tab', { name: '결과' }).click()
    await expect(page.getByText('어제의 결과')).toBeVisible()

    // 랭킹 탭 클릭
    await page.getByRole('tab', { name: '랭킹' }).click()
    await expect(page.getByText('주간 랭킹')).toBeVisible()

    // 배틀 탭으로 복귀
    await page.getByRole('tab', { name: '배틀' }).click()
  })
})

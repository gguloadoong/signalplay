import { test, expect } from '@playwright/test'

test.describe('온보딩', () => {
  test('슬라이드 3장 완료 → 투표 페이지 진입', async ({ page }) => {
    // 온보딩 기록 삭제 → 항상 온보딩 보이도록
    await page.addInitScript(() => {
      localStorage.removeItem('signalplay-onboarded')
    })

    await page.goto('/')

    // 1번 슬라이드 확인
    await expect(page.getByText('오늘의 투자 시그널')).toBeVisible({ timeout: 5000 })

    // '다음' 클릭 → 2번 슬라이드
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page.getByText('방구석 전문가 5명')).toBeVisible()

    // '다음' 클릭 → 3번 슬라이드
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page.getByText('군중과 비교')).toBeVisible()

    // '시작하기' 클릭 → 온보딩 종료, 투표 페이지 진입
    await page.getByRole('button', { name: '시작하기' }).click()
    await expect(page.getByRole('button', { name: /호재|악재|글쎄/ }).first()).toBeVisible({ timeout: 10000 })
  })
})

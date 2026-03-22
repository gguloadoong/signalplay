-- 시그널플레이 (SignalPlay) — Supabase 스키마
-- 3테이블 최소 구조

-- 1. 일일 시그널 (AI 생성)
CREATE TABLE IF NOT EXISTS daily_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  battle_type TEXT NOT NULL DEFAULT 'morning' CHECK (battle_type IN ('morning', 'flash', 'night')),
  signals JSONB NOT NULL,
  -- signals: [{ index, title, summary, category, actualResult?, resultComment? }]
  deadline TIMESTAMPTZ NOT NULL,
  result_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_result_ready BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 유저 예측
CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  toss_user_id TEXT NOT NULL,
  signal_date DATE NOT NULL,
  battle_type TEXT NOT NULL DEFAULT 'morning',
  predictions JSONB NOT NULL,
  -- predictions: [{ signalIndex, prediction, confidence }]
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (toss_user_id, signal_date, battle_type)
);

-- 3. 유저 통계
CREATE TABLE IF NOT EXISTS user_stats (
  toss_user_id TEXT PRIMARY KEY,
  nickname TEXT,
  total_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  accuracy NUMERIC(5, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_signals_date ON daily_signals (date);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON user_predictions (toss_user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON user_predictions (signal_date);
CREATE INDEX IF NOT EXISTS idx_stats_score ON user_stats (total_score DESC);

-- RLS 정책
ALTER TABLE daily_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 시그널: 인증된 유저 조회 가능
CREATE POLICY "Authenticated users can read signals"
  ON daily_signals FOR SELECT
  TO authenticated
  USING (true);

-- 예측: 본인 데이터만 조회/삽입
CREATE POLICY "Users can read own predictions"
  ON user_predictions FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'sub' = toss_user_id);

CREATE POLICY "Users can insert own predictions"
  ON user_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = toss_user_id);

-- 통계: 전체 조회 가능 (리더보드), 본인만 수정
CREATE POLICY "Anyone can read stats (leaderboard)"
  ON user_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'sub' = toss_user_id);

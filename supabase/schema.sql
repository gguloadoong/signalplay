-- 시그널플레이 (SignalPlay) — Supabase 스키마
-- 4기둥 피벗 반영: 하루 1질문 + AI 캐릭터 예측 + 군중 투표
-- 최종 수정: 2026-03-25

-- 1. 일일 질문 (Gemini 생성, 하루 1개)
CREATE TABLE IF NOT EXISTS daily_questions (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  date          DATE         NOT NULL UNIQUE,
  title         TEXT         NOT NULL,
  question      TEXT         NOT NULL,
  category      TEXT         NOT NULL CHECK (category IN ('종목', '지수', '매크로')),
  deadline      TIMESTAMPTZ  NOT NULL,
  -- AI 캐릭터 예측 (Gemini 생성, JSONB)
  -- [{ character, name, emoji, methodology, prediction, reasoning }]
  character_predictions  JSONB,
  -- 군중 투표 집계 (실시간 업데이트)
  crowd_bullish  INTEGER      DEFAULT 0,
  crowd_bearish  INTEGER      DEFAULT 0,
  crowd_neutral  INTEGER      DEFAULT 0,
  total_votes    INTEGER      DEFAULT 0,
  -- 실제 결과 (결과 공개 후 입력)
  actual_outcome TEXT         CHECK (actual_outcome IN ('bullish', 'bearish', 'neutral')),
  result_ready   BOOLEAN      DEFAULT false,
  ai_comment     TEXT,
  created_at     TIMESTAMPTZ  DEFAULT now()
);

-- 2. 유저 투표 (toss_user_id 기반, Supabase 설정 후 연동)
CREATE TABLE IF NOT EXISTS user_votes (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  toss_user_id  TEXT         NOT NULL,
  question_id   UUID         NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  date          DATE         NOT NULL,
  choice        TEXT         NOT NULL CHECK (choice IN ('bullish', 'bearish', 'neutral')),
  is_correct    BOOLEAN,     -- 결과 공개 후 업데이트
  created_at    TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (toss_user_id, question_id)
);

-- 3. 유저 통계
CREATE TABLE IF NOT EXISTS user_stats (
  toss_user_id     TEXT         PRIMARY KEY,
  total_votes      INTEGER      DEFAULT 0,
  correct_votes    INTEGER      DEFAULT 0,
  current_streak   INTEGER      DEFAULT 0,
  max_streak       INTEGER      DEFAULT 0,
  last_vote_date   DATE,
  updated_at       TIMESTAMPTZ  DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_date    ON daily_questions (date DESC);
CREATE INDEX IF NOT EXISTS idx_questions_ready   ON daily_questions (result_ready);
CREATE INDEX IF NOT EXISTS idx_votes_user        ON user_votes (toss_user_id);
CREATE INDEX IF NOT EXISTS idx_votes_question    ON user_votes (question_id);
CREATE INDEX IF NOT EXISTS idx_stats_correct     ON user_stats (correct_votes DESC);

-- RLS 활성화
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats      ENABLE ROW LEVEL SECURITY;

-- daily_questions: 모든 인증 유저 읽기 가능 (서버사이드 service_role로 쓰기)
CREATE POLICY "Anyone can read questions"
  ON daily_questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- user_votes: 본인 데이터만 읽기/삽입
CREATE POLICY "Users can read own votes"
  ON user_votes FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'sub' = toss_user_id);

CREATE POLICY "Users can insert own votes"
  ON user_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = toss_user_id);

-- user_stats: 리더보드용 전체 읽기, 본인만 수정
CREATE POLICY "Anyone can read stats (leaderboard)"
  ON user_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can upsert own stats"
  ON user_stats FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'sub' = toss_user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = toss_user_id);

-- 군중 투표 집계 함수 (Vercel API에서 호출)
CREATE OR REPLACE FUNCTION increment_vote(
  p_question_id UUID,
  p_choice      TEXT
) RETURNS void AS $$
BEGIN
  UPDATE daily_questions
  SET
    crowd_bullish = crowd_bullish + CASE WHEN p_choice = 'bullish' THEN 1 ELSE 0 END,
    crowd_bearish = crowd_bearish + CASE WHEN p_choice = 'bearish' THEN 1 ELSE 0 END,
    crowd_neutral = crowd_neutral + CASE WHEN p_choice = 'neutral' THEN 1 ELSE 0 END,
    total_votes   = total_votes + 1
  WHERE id = p_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

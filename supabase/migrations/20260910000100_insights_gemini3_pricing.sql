-- ---------------------------------------------------------------------------
-- Refresh the `ai_budget` settings row for the Gemini 3.x line.
--
-- The 2.x models (`gemini-2.0-flash` … `gemini-2.5-*`) are retired or off the
-- free tier, and the code defaults now point at `gemini-3.6-flash` /
-- `gemini-3.5-flash-lite` / `gemini-3.1-flash-image` (see
-- `insights-engine/src/config.ts`). Bring the DB-side budget-guard pricing
-- table in line so cost estimates resolve to a real per-model rate instead of
-- the generic `default`.
--
-- Pricing is approximate — verify against current Gemini pricing.
-- ---------------------------------------------------------------------------

update insights_settings
   set value = jsonb_set(
     value,
     '{pricingPer1MTokensUsd}',
     jsonb_build_object(
       'gemini-3.1-pro-preview', jsonb_build_object('input', 1.25, 'output', 10.00),
       'gemini-3.7-flash',       jsonb_build_object('input', 0.30, 'output', 2.50),
       'gemini-3.6-flash',       jsonb_build_object('input', 0.30, 'output', 2.50),
       'gemini-3.5-flash',       jsonb_build_object('input', 0.30, 'output', 2.50),
       'gemini-3.5-flash-lite',  jsonb_build_object('input', 0.10, 'output', 0.40),
       'gemini-3.1-flash-lite',  jsonb_build_object('input', 0.10, 'output', 0.40),
       'default',                jsonb_build_object('input', 0.50, 'output', 4.00)
     )
   )
 where key = 'ai_budget';

update insights_settings
   set value = jsonb_set(
     value,
     '{imagePricingUsd}',
     jsonb_build_object(
       'gemini-3.1-flash-image',      0.04,
       'gemini-3.1-flash-lite-image', 0.02,
       'gemini-3-pro-image',          0.06,
       'default',                     0.04
     )
   )
 where key = 'ai_budget';

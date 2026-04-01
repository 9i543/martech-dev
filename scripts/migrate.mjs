/**
 * Idempotent startup migration for martech-manager
 * Uses pg directly to support Cloud SQL socket URLs
 */
import pg from 'pg'
const { Client } = pg

async function migrate() {
  console.log('[migrate] Starting martech migration...')

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS "PlanMaster" (
      "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId"        TEXT NOT NULL,
      "planName"      TEXT NOT NULL,
      "brandName"     TEXT,
      "startDate"     TIMESTAMP,
      "endDate"       TIMESTAMP,
      "totalBudget"   DOUBLE PRECISION,
      "objectiveType" TEXT,
      "notes"         TEXT,
      "owner"         TEXT,
      "status"        TEXT NOT NULL DEFAULT 'draft',
      "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)
  console.log('[migrate] PlanMaster table OK')

  await client.query(`
    CREATE TABLE IF NOT EXISTS "PlanRow" (
      "id"                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "planId"              TEXT NOT NULL REFERENCES "PlanMaster"("id") ON DELETE CASCADE,
      "funnelStage"         TEXT,
      "executionStage"      TEXT,
      "channelBucket"       TEXT,
      "channelType"         TEXT,
      "channelRole"         TEXT,
      "utmSource"           TEXT,
      "utmMedium"           TEXT,
      "utmSourcePlatform"   TEXT,
      "utmMarketingTactic"  TEXT,
      "utmTerm"             TEXT,
      "contentPlacement"    TEXT,
      "contentVersion"      TEXT,
      "utmCreativeFormat"   TEXT,
      "campaignGoal"        TEXT,
      "audienceType"        TEXT,
      "audienceDesc"        TEXT,
      "isNewCustomer"       TEXT,
      "plannedBudget"       DOUBLE PRECISION,
      "budgetRatio"         DOUBLE PRECISION,
      "plannedKpiType"      TEXT,
      "plannedKpiValue"     DOUBLE PRECISION,
      "plannedKpiCost"      DOUBLE PRECISION,
      "landingUrl"          TEXT,
      "ctaType"             TEXT,
      "conversionPoint"     TEXT,
      "trackingId"          TEXT,
      "notes"               TEXT,
      "createdAt"           TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt"           TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)
  console.log('[migrate] PlanRow table OK')

  // Rename legacy columns if they still exist (idempotent)
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PlanRow' AND column_name='contentGroup') THEN
        ALTER TABLE "PlanRow" RENAME COLUMN "contentGroup" TO "contentPlacement";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PlanRow' AND column_name='contentVariant') THEN
        ALTER TABLE "PlanRow" RENAME COLUMN "contentVariant" TO "contentVersion";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PlanRow' AND column_name='campaignPlacement') THEN
        ALTER TABLE "PlanRow" DROP COLUMN "campaignPlacement";
      END IF;
    END$$
  `)
  console.log('[migrate] Column migration OK')

  // Add new columns if not exist
  await client.query(`ALTER TABLE "PlanRow" ADD COLUMN IF NOT EXISTS "rowType" TEXT`)
  await client.query(`ALTER TABLE "PlanMaster" ADD COLUMN IF NOT EXISTS "funnelConfigJson" TEXT`)
  await client.query(`ALTER TABLE "PlanRow" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT`)
  console.log('[migrate] New columns OK')

  await client.end()
  console.log('[migrate] Done.')
}

migrate().catch((e) => {
  console.error('[migrate] Error:', e.message)
  process.exit(1)
})

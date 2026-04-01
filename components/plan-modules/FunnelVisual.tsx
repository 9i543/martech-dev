'use client'
import { FunnelStageConfig } from '../PlanForm'

const STAGE_DEFS = [
  { key: 'Awareness',  labelZh: '注意',  labelEn: 'Awareness',  color: '#3b82f6', lightColor: '#dbeafe', desc: 'PV · UV · 曝光觸及' },
  { key: 'Interest',   labelZh: '興趣',  labelEn: 'Interest',   color: '#06b6d4', lightColor: '#cffafe', desc: 'CTR · 互動 · 停留時間' },
  { key: 'Desire',     labelZh: '慾望',  labelEn: 'Desire',     color: '#8b5cf6', lightColor: '#ede9fe', desc: '加購 · 收藏 · 比較' },
  { key: 'Action',     labelZh: '行動',  labelEn: 'Action',     color: '#10b981', lightColor: '#d1fae5', desc: '購買 · 轉換 · ROAS' },
  { key: 'Membership', labelZh: '會員',  labelEn: 'Membership', color: '#f59e0b', lightColor: '#fef3c7', desc: '留存 · 回購 · 再活化' },
]

// Fixed width percentages per stage (funnel shape logic - always narrows)
const STAGE_WIDTHS = [100, 82, 64, 48, 34] // % of container width

interface Props {
  funnelConfig: Record<string, FunnelStageConfig>
  totalBudget: number | ''
}

export default function FunnelVisual({ funnelConfig, totalBudget }: Props) {
  const budget = typeof totalBudget === 'number' ? totalBudget : 0

  // Calculate heights
  const CONTAINER_W = 280
  const DISABLED_H = 10   // height for disabled stages
  const MIN_ENABLED_H = 28 // minimum height for enabled stage
  const TOTAL_H = 320

  const enabledStages = STAGE_DEFS.filter(s => funnelConfig[s.key]?.enabled && s.key !== 'Membership')
  const totalRatio = enabledStages.reduce((sum, s) => sum + (funnelConfig[s.key]?.ratio || 0), 0)

  // Reserve height for disabled stages
  const disabledCount = STAGE_DEFS.filter(s => !funnelConfig[s.key]?.enabled && s.key !== 'Membership').length
  const reservedForDisabled = disabledCount * DISABLED_H
  const availableForEnabled = TOTAL_H - reservedForDisabled

  // Assign heights proportional to budget ratio, with minimum
  const stageHeights: Record<string, number> = {}
  let usedForEnabled = 0

  // First pass: assign minimums
  enabledStages.forEach(s => {
    stageHeights[s.key] = MIN_ENABLED_H
    usedForEnabled += MIN_ENABLED_H
  })

  // Second pass: distribute remaining proportionally
  const extra = availableForEnabled - usedForEnabled
  if (extra > 0 && totalRatio > 0) {
    enabledStages.forEach(s => {
      const ratio = (funnelConfig[s.key]?.ratio || 0) / totalRatio
      stageHeights[s.key] += Math.round(extra * ratio)
    })
  }

  // Build trapezoid segments (excluding Membership - future feature)
  const visibleStages = STAGE_DEFS.filter(s => s.key !== 'Membership')

  // Build SVG paths
  let yOffset = 0
  const segments: {
    key: string
    path: string
    labelPath: string
    h: number
    enabled: boolean
    color: string
    lightColor: string
    ratio: number
    labelZh: string
    labelEn: string
    desc: string
    budget: number
  }[] = []

  const membershipEnabled = funnelConfig['Membership']?.enabled ?? false

  visibleStages.forEach((stage, i) => {
    const enabled = funnelConfig[stage.key]?.enabled ?? false
    const h = enabled ? (stageHeights[stage.key] || MIN_ENABLED_H) : DISABLED_H
    const ratio = funnelConfig[stage.key]?.ratio || 0

    // Top and bottom widths for this trapezoid
    const topWidthPct = STAGE_WIDTHS[i]
    const isLastStage = i === visibleStages.length - 1
    // When Membership is disabled, taper the last stage to a slightly blunt tip
    const botWidthPct = isLastStage && !membershipEnabled
      ? 10
      : (i + 1 < STAGE_WIDTHS.length ? STAGE_WIDTHS[i + 1] : STAGE_WIDTHS[i] - 12)
    const topW = (CONTAINER_W * topWidthPct) / 100
    const botW = (CONTAINER_W * botWidthPct) / 100
    const topX = (CONTAINER_W - topW) / 2
    const botX = (CONTAINER_W - botW) / 2

    const path = `M${topX},${yOffset} L${topX + topW},${yOffset} L${botX + botW},${yOffset + h} L${botX},${yOffset + h} Z`
    const labelY = yOffset + h / 2

    segments.push({
      key: stage.key,
      path,
      labelPath: `M${topX},${labelY} L${topX + topW},${labelY}`,
      h,
      enabled,
      color: stage.color,
      lightColor: stage.lightColor,
      ratio,
      labelZh: stage.labelZh,
      labelEn: stage.labelEn,
      desc: stage.desc,
      budget: budget && ratio ? Math.round(budget * ratio / 100) : 0,
    })

    yOffset += h
  })

  const svgH = yOffset + 8

  return (
    <div className="flex flex-col items-center">
      {/* Funnel SVG */}
      <svg width={CONTAINER_W} height={svgH} className="overflow-visible">
        <defs>
          {segments.map(s => (
            <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={s.enabled ? s.color : '#e5e7eb'} stopOpacity={s.enabled ? 0.7 : 1} />
              <stop offset="50%" stopColor={s.enabled ? s.color : '#e5e7eb'} stopOpacity={s.enabled ? 1 : 1} />
              <stop offset="100%" stopColor={s.enabled ? s.color : '#e5e7eb'} stopOpacity={s.enabled ? 0.7 : 1} />
            </linearGradient>
          ))}
        </defs>

        {segments.map((s, i) => (
          <g key={s.key}>
            {/* Trapezoid fill */}
            <path
              d={s.path}
              fill={`url(#grad-${s.key})`}
              stroke="white"
              strokeWidth={i === 0 ? 0 : 1.5}
              opacity={s.enabled ? 1 : 0.4}
            />

            {/* Labels (only if enabled and tall enough) */}
            {s.enabled && s.h >= MIN_ENABLED_H && (() => {
              const yBase = segments.slice(0, segments.indexOf(s)).reduce((sum, prev) => sum + prev.h, 0)
              const hasRatio = s.h > 32
              // If two lines: name at 35%, ratio at 65%; if one line: name at 50%
              const nameY = yBase + s.h * (hasRatio ? 0.35 : 0.55)
              const ratioY = yBase + s.h * 0.68
              const fontSize = s.h > 44 ? 12 : 10
              return (
                <>
                  {/* Stage name: zh + en */}
                  <text
                    x={CONTAINER_W / 2}
                    y={nameY}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="600"
                    fill="white"
                  >
                    {s.labelZh}（{s.labelEn}）
                  </text>

                  {/* Ratio % — larger font for emphasis */}
                  {hasRatio && (
                    <text
                      x={CONTAINER_W / 2}
                      y={ratioY}
                      textAnchor="middle"
                      fontSize={Math.max(fontSize + 2, 14)}
                      fontWeight="700"
                      fill="rgba(255,255,255,0.95)"
                    >
                      {s.ratio}%
                    </text>
                  )}
                </>
              )
            })()}

            {/* Disabled label */}
            {!s.enabled && (
              <text
                x={CONTAINER_W / 2}
                y={segments.slice(0, segments.indexOf(s)).reduce((sum, prev) => sum + prev.h, 0) + s.h / 2 + 3}
                textAnchor="middle"
                fontSize={8}
                fill="#9ca3af"
              >
                {s.labelEn} (未啟用)
              </text>
            )}
          </g>
        ))}

        {/* Membership placeholder */}
        {!funnelConfig['Membership']?.enabled && (
          <text
            x={CONTAINER_W / 2}
            y={svgH + 2}
            textAnchor="middle"
            fontSize={9}
            fill="#d97706"
          >
            ＋ Membership（未來可啟用）
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 w-full space-y-1">
        {segments.filter(s => s.enabled).map(s => (
          <div key={s.key} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="font-medium">{s.labelZh}</span>
            <span className="text-gray-400">·</span>
            <span>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

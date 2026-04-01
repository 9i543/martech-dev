'use client'
import { PlanData, FunnelStageConfig } from '../PlanForm'
import FunnelVisual from './FunnelVisual'
import { DEFAULT_INTENTS, ALL_ANGLES, TACTIC_AIDAM_RATIOS, AidamRatio } from '@/lib/tactic-config'

const STAGES = [
  {
    key: 'Awareness',
    label: 'Awareness',
    labelZh: '注意',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    activeColor: 'bg-blue-600 text-white',
    tasks: ['導流', '品牌曝光', '擴散觸及'],
  },
  {
    key: 'Interest',
    label: 'Interest',
    labelZh: '興趣',
    color: 'bg-cyan-100 border-cyan-300 text-cyan-800',
    activeColor: 'bg-cyan-600 text-white',
    tasks: ['互動留言', '內容消費', '深度瀏覽'],
  },
  {
    key: 'Desire',
    label: 'Desire',
    labelZh: '慾望',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    activeColor: 'bg-purple-600 text-white',
    tasks: ['導購', '比較考慮', '收藏加購'],
  },
  {
    key: 'Action',
    label: 'Action',
    labelZh: '行動',
    color: 'bg-green-100 border-green-300 text-green-800',
    activeColor: 'bg-green-600 text-white',
    tasks: ['成交', '結帳購買', '完成轉換'],
  },
  {
    key: 'Membership',
    label: 'Membership',
    labelZh: '會員經營',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    activeColor: 'bg-orange-600 text-white',
    tasks: ['留存/回購', '會員升級', '再活化'],
    isFuture: true,
  },
]

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module2Funnel({ plan, update }: Props) {
  const config = plan.funnelConfig

  const setStage = (key: string, patch: Partial<FunnelStageConfig>) => {
    const newConfig = { ...config, [key]: { ...config[key], ...patch } }
    update({ funnelConfig: newConfig })
  }

  const enabledStages = STAGES.filter((s) => config[s.key]?.enabled)
  const totalRatio = enabledStages.reduce((sum, s) => sum + (config[s.key]?.ratio || 0), 0)
  const totalBudget = typeof plan.totalBudget === 'number' ? plan.totalBudget : 0

  const tacticRatios = (plan.tacticIntent && plan.tacticAngle)
    ? TACTIC_AIDAM_RATIOS[plan.tacticIntent]?.[plan.tacticAngle]
    : null
  const ratiosDriftFromTactic = tacticRatios
    ? ['Awareness', 'Interest', 'Desire', 'Action', 'Membership'].some(
        (s) => (plan.funnelConfig[s]?.ratio ?? 0) !== (tacticRatios as Record<string, number>)[s as keyof AidamRatio]
      )
    : false

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>🎯</span> 模組 3：AIDA + M 漏斗配置
      </h2>

      {plan.tacticIntent && plan.tacticAngle && (() => {
        const intentLabel = DEFAULT_INTENTS.find((i) => i.id === plan.tacticIntent)?.label ?? plan.tacticIntent
        const angleLabel  = ALL_ANGLES.find((a) => a.id === plan.tacticAngle)?.label ?? plan.tacticAngle
        return (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-sm text-indigo-800 flex items-center gap-2 flex-wrap">
            <span>💡 已套用行銷策略：<strong>{intentLabel}</strong> × <strong>{angleLabel}</strong></span>
            <span className="ml-auto text-xs text-indigo-400 font-mono">{plan.tacticIntent}__{plan.tacticAngle}</span>
          </div>
        )
      })()}

      <div className="bg-blue-50 rounded-xl px-4 py-2 text-xs text-blue-700">
        💡 比例已由模組 2「行銷策略」自動套入；您可在此手動微調各階段分配
      </div>

      {totalRatio !== 100 && totalRatio > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2 text-sm">
          ⚠️ 目前啟用階段比例總和為 {totalRatio}%，需等於 100%
        </div>
      )}

      {ratiosDriftFromTactic && (
        <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          ⚠️ 請確定您規劃的行銷策略與AIDAM流程比例是否合適
        </div>
      )}

      {/* Two-column layout: funnel visual + config */}
      <div className="flex gap-6">
        {/* Left: Funnel Visual */}
        <div className="w-72 shrink-0 bg-gray-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-500 mb-3 text-center">流量漏斗策略模型</div>
          <FunnelVisual funnelConfig={config} totalBudget={totalBudget} />
        </div>

        {/* Right: Config */}
        <div className="flex-1 space-y-3">
        {STAGES.map((stage) => {
          const cfg = config[stage.key]
          const budget = totalBudget && cfg?.ratio ? Math.round(totalBudget * cfg.ratio / 100) : 0

          return (
            <div
              key={stage.key}
              className={`border-2 rounded-xl p-4 transition ${
                cfg?.enabled ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={cfg?.enabled ?? false}
                    onChange={(e) => setStage(stage.key, { enabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>

                {/* Stage label */}
                <div className="w-40 shrink-0">
                  <div className="font-semibold text-gray-800 text-sm">
                    {stage.labelZh}（{stage.label}）
                    {stage.isFuture && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 rounded">預留</span>
                    )}
                  </div>
                </div>

                {/* Ratio */}
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={!cfg?.enabled}
                    className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    value={cfg?.ratio ?? 0}
                    onChange={(e) => setStage(stage.key, { ratio: Number(e.target.value) })}
                  />
                  <span className="text-2xl font-bold text-gray-700 w-16 text-right">
                    {cfg?.enabled ? `${cfg.ratio}%` : '—'}
                  </span>
                </div>

                {/* Budget */}
                <div className="text-sm font-semibold text-blue-700 w-36 shrink-0">
                  {budget > 0 ? `NT$ ${budget.toLocaleString()}` : (cfg?.enabled ? 'NT$ 0' : '—')}
                </div>

                {/* Task */}
                <div className="flex-1">
                  <select
                    disabled={!cfg?.enabled}
                    className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    value={cfg?.task ?? ''}
                    onChange={(e) => setStage(stage.key, { task: e.target.value })}
                  >
                    {stage.tasks.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Budget bar */}
              {cfg?.enabled && cfg.ratio > 0 && (
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${cfg.ratio}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
        </div> {/* end right config */}
      </div> {/* end two-column */}

      {/* Summary */}
      {totalBudget > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-sm font-medium text-blue-800 mb-2">預算分配摘要</div>
          <div className="grid grid-cols-5 gap-2">
            {STAGES.filter((s) => config[s.key]?.enabled).map((s) => (
              <div key={s.key} className="text-center">
                <div className="text-xs text-gray-500">{s.labelZh}</div>
                <div className="font-bold text-blue-700 text-sm">
                  {config[s.key].ratio}%
                </div>
                <div className="text-xs text-gray-600">
                  NT${Math.round(totalBudget * config[s.key].ratio / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────────────────

const PERIODS = [
  '2024-10-01 to 2024-10-30',
  '2024-09-01 to 2024-09-30',
  '2024-08-01 to 2024-08-31',
]

const STATS = [
  { label: '曝光總數',     value: '12,500,000', unit: '' },
  { label: '點擊總數',     value: '312,500',    unit: '' },
  { label: '連結點擊總數', value: '281,250',    unit: '' },
  { label: '連結點擊率',   value: '2.25',       unit: '%' },
  { label: '連結點擊成本', value: '0.50',       unit: '$' },
  { label: '媒體費用',     value: '140,625',    unit: '$' },
]

const BAR_DATA = [
  { week: 1, new: 350, returning: 150 },
  { week: 2, new: 400, returning: 200 },
  { week: 3, new: 380, returning: 180 },
  { week: 4, new: 420, returning: 180 },
  { week: 5, new: 350, returning: 180 },
  { week: 6, new: 380, returning: 180 },
  { week: 7, new: 400, returning: 200 },
  { week: 8, new: 340, returning: 180 },
]

const PIE_DATA = [
  { label: 'Paid Search',    value: 35, color: '#60a5fa' },
  { label: 'Direct',         value: 20, color: '#34d399' },
  { label: 'Organic Search', value: 18, color: '#fbbf24' },
  { label: 'Social',         value: 12, color: '#a78bfa' },
  { label: 'Display',        value:  7, color: '#f87171' },
  { label: 'Referral',       value:  5, color: '#fb923c' },
  { label: 'Other',          value:  3, color: '#94a3b8' },
]

const ROI_FLOW = [
  { stage: '興趣', type: '廣告活動', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', days: null },
  { stage: null,   type: '導流量',   color: '', days: 2.5 },
  { stage: '慾望', type: '廣告活動', color: 'bg-purple-100 text-purple-800 border-purple-300', days: null },
  { stage: null,   type: '目標量',   color: '', days: 5.1 },
  { stage: '行動', type: '廣告活動', color: 'bg-green-100 text-green-800 border-green-300', days: null },
  { stage: null,   type: '交易量',   color: '', days: 1.2 },
]

const MEDIA_INFLUENCE = [
  { stage: '興趣', label: 'KOL 網紅合作_Q4',    stageColor: 'bg-cyan-100 text-cyan-700' },
  { stage: '行動', label: 'PMAX 效果最大化_Q4', stageColor: 'bg-green-100 text-green-700' },
  { stage: '行動', label: '再行銷名單_Q4',       stageColor: 'bg-green-100 text-green-700' },
]

// ── Gauge Chart ───────────────────────────────────────────────────────────────

function GaugeChart({ percent }: { percent: number }) {
  const r = 78
  const cx = 100
  const cy = 105
  const circ = 2 * Math.PI * r
  const half = circ / 2
  const progress = half * (percent / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-500 mb-1">興趣 費用現況</div>
      <svg viewBox="0 0 200 120" className="w-44">
        {/* Background arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#e5e7eb" strokeWidth="18"
          strokeDasharray={`${half} ${circ}`}
          strokeLinecap="round"
          style={{ transform: `rotate(180deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#3b82f6" strokeWidth="18"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          style={{ transform: `rotate(180deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
        <text x="100" y="108" textAnchor="middle" className="text-2xl" style={{ fontSize: 26, fontWeight: 700, fill: '#1e40af' }}>
          {percent}%
        </text>
        <text x="18"  y="118" textAnchor="middle" style={{ fontSize: 11, fill: '#6b7280' }}>0</text>
        <text x="182" y="118" textAnchor="middle" style={{ fontSize: 11, fill: '#6b7280' }}>100</text>
      </svg>
    </div>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function BarChart() {
  const maxVal = 620
  const chartW = 320
  const chartH = 140
  const barGroupW = chartW / BAR_DATA.length
  const barW = 12
  const gap = 4

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />新訪客</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-300 inline-block" />回訪者</span>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full max-w-xs">
        {BAR_DATA.map((d, i) => {
          const x = i * barGroupW + barGroupW / 2 - barW - gap / 2
          const newH = (d.new / maxVal) * chartH
          const retH = (d.returning / maxVal) * chartH
          return (
            <g key={i}>
              <rect x={x}          y={chartH - newH} width={barW} height={newH} fill="#60a5fa" rx="2" />
              <rect x={x + barW + gap} y={chartH - retH} width={barW} height={retH} fill="#fdba74" rx="2" />
              <text x={x + barW + gap / 2} y={chartH + 14} textAnchor="middle" style={{ fontSize: 9, fill: '#9ca3af' }}>{i + 1}</text>
            </g>
          )
        })}
        <line x1="0" y1={chartH} x2={chartW} y2={chartH} stroke="#e5e7eb" strokeWidth="1" />
      </svg>
      <div className="text-xs text-center text-gray-400 -mt-1">設定目標到訪客超動圖</div>
    </div>
  )
}

// ── Pie / Donut Chart ─────────────────────────────────────────────────────────

function PieChart() {
  const r = 55
  const cx = 80
  const cy = 80
  const circ = 2 * Math.PI * r
  let cumulative = 0

  return (
    <div>
      <div className="flex gap-1.5 items-start">
        <svg viewBox="0 0 160 160" className="w-36 shrink-0">
          {PIE_DATA.map((d, i) => {
            const dashLen = (d.value / 100) * circ
            const offset = circ * 0.25 - (cumulative / 100) * circ
            cumulative += d.value
            return (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="40"
                strokeDasharray={`${dashLen} ${circ}`}
                strokeDashoffset={offset}
              />
            )
          })}
          {/* Donut hole */}
          <circle cx={cx} cy={cy} r="35" fill="white" />
        </svg>
        <div className="flex flex-col gap-0.5 pt-1">
          {PIE_DATA.map((d) => (
            <div key={d.label} className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
              <span>{d.label}</span>
              <span className="text-gray-400 ml-auto">({d.value}%)</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-center text-gray-400 -mt-1">設定目標到訪客管道分配狀態</div>
    </div>
  )
}

// ── Venn / Audience Overlap ───────────────────────────────────────────────────

function VennDiagram() {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 140" className="w-44">
        {/* Left circle */}
        <circle cx="75" cy="70" r="55" fill="#bfdbfe" fillOpacity="0.7" stroke="#93c5fd" strokeWidth="1.5" />
        {/* Right circle */}
        <circle cx="125" cy="70" r="55" fill="#c4b5fd" fillOpacity="0.7" stroke="#a78bfa" strokeWidth="1.5" />
        {/* Labels */}
        <text x="55" y="60" textAnchor="middle" style={{ fontSize: 9, fill: '#1e3a8a', fontWeight: 600 }}>廣告活動</text>
        <text x="55" y="72" textAnchor="middle" style={{ fontSize: 8, fill: '#1e3a8a' }}>KOL.XXX 貼文</text>
        <text x="55" y="84" textAnchor="middle" style={{ fontSize: 9, fill: '#1e3a8a', fontWeight: 600 }}>約 25,000 人</text>
        <text x="145" y="60" textAnchor="middle" style={{ fontSize: 9, fill: '#3730a3', fontWeight: 600 }}>廣告活動</text>
        <text x="145" y="72" textAnchor="middle" style={{ fontSize: 8, fill: '#3730a3' }}>PMAX XXX</text>
        <text x="145" y="84" textAnchor="middle" style={{ fontSize: 9, fill: '#3730a3', fontWeight: 600 }}>約 40,000 人</text>
        {/* Overlap label */}
        <text x="100" y="64" textAnchor="middle" style={{ fontSize: 8, fill: '#374151', fontWeight: 600 }}>重疊率</text>
        <text x="100" y="76" textAnchor="middle" style={{ fontSize: 8, fill: '#374151' }}>約 8,500 人</text>
        <text x="100" y="88" textAnchor="middle" style={{ fontSize: 9, fill: '#374151', fontWeight: 700 }}>(13%)</text>
      </svg>
    </div>
  )
}

// ── ROI Funnel Flow ───────────────────────────────────────────────────────────

function ROIFlow() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex-1">
      <div className="text-xs font-bold text-yellow-700 mb-3">投資報酬最佳組合</div>
      <div className="flex items-center gap-1 flex-wrap">
        {/* 興趣廣告活動 */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-gray-400 mb-0.5">平均需要時間（排除極端值）</div>
          <div className="bg-cyan-100 border border-cyan-300 text-cyan-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-center">
            <div>興趣</div>
            <div>廣告活動</div>
          </div>
        </div>
        <div className="flex flex-col items-center px-1">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap">2.5 days</div>
          <div className="text-gray-400 text-xs mt-0.5">→</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-transparent mb-0.5">.</div>
          <div className="bg-gray-100 border border-gray-200 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium text-center">
            <div>慾望</div>
            <div>導流量</div>
          </div>
        </div>
        <div className="text-gray-300 text-xs px-0.5">→</div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-gray-400 mb-0.5">平均需要時間（排除極端值）</div>
          <div className="bg-purple-100 border border-purple-300 text-purple-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-center">
            <div>慾望</div>
            <div>廣告活動</div>
          </div>
        </div>
        <div className="flex flex-col items-center px-1">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap">5.1 days</div>
          <div className="text-gray-400 text-xs mt-0.5">→</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-transparent mb-0.5">.</div>
          <div className="bg-gray-100 border border-gray-200 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium text-center">
            <div>行動</div>
            <div>目標量</div>
          </div>
        </div>
        <div className="text-gray-300 text-xs px-0.5">→</div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-gray-400 mb-0.5">平均需要時間（排除極端值）</div>
          <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-center">
            <div>行動</div>
            <div>廣告活動</div>
          </div>
        </div>
        <div className="flex flex-col items-center px-1">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap">1.2 days</div>
          <div className="text-gray-400 text-xs mt-0.5">→</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-transparent mb-0.5">.</div>
          <div className="bg-orange-100 border border-orange-300 text-orange-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-center">
            <div>交易量</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Media Influence Panel ─────────────────────────────────────────────────────

function MediaInfluence() {
  const [selections, setSelections] = useState(MEDIA_INFLUENCE.map((m) => m.label))

  return (
    <div className="bg-white border rounded-xl p-4 min-w-[180px]">
      <div className="text-xs font-semibold text-gray-700 mb-3">媒體影響重量度</div>
      <div className="space-y-2">
        {MEDIA_INFLUENCE.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${m.stageColor}`}>{m.stage}</span>
            <select
              className="flex-1 text-xs border rounded px-1.5 py-1 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={selections[i]}
              onChange={(e) => setSelections((prev) => { const n = [...prev]; n[i] = e.target.value; return n })}
            >
              <option>{m.label}</option>
              <option>自然搜尋_Q4</option>
              <option>Email 行銷_Q4</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage({ email }: { email: string }) {
  const [period, setPeriod] = useState(PERIODS[0])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Row 1: Period + ROI Flow */}
        <div className="flex gap-4 items-stretch">
          <div className="bg-white border rounded-xl px-4 py-3 flex flex-col justify-center shrink-0">
            <div className="text-xs text-gray-500 mb-1">期間</div>
            <select
              className="text-sm border rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <ROIFlow />
        </div>

        {/* Row 2: Gauge + Stats */}
        <div className="flex gap-4 items-stretch">
          <div className="bg-white border rounded-xl px-6 py-4 flex flex-col items-center justify-center shrink-0 w-52">
            <GaugeChart percent={72.5} />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border rounded-xl px-4 py-3 flex flex-col justify-center">
                <div className="text-lg font-bold text-gray-800">
                  {s.unit === '$' ? '$' : ''}{s.value}{s.unit === '%' ? '%' : ''}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Charts */}
        <div className="flex gap-4 items-stretch">
          {/* Bar chart */}
          <div className="bg-white border rounded-xl px-5 py-4 flex-1">
            <BarChart />
          </div>
          {/* Pie chart */}
          <div className="bg-white border rounded-xl px-5 py-4 flex-1">
            <PieChart />
          </div>
          {/* Venn */}
          <div className="bg-white border rounded-xl px-5 py-4 flex-1 flex flex-col justify-center">
            <VennDiagram />
          </div>
          {/* Media influence */}
          <MediaInfluence />
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center">
          ※ 目前顯示為示意資料，待串接廣告帳號後將呈現真實成效數據。
        </p>
      </main>
    </div>
  )
}

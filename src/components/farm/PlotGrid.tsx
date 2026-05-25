import { useFocusStore } from '@/store/useFocusStore'
import type { Plot } from '@/store/types'
import { PlotTile } from './PlotTile'

interface Props {
  onPlotClick: (plotId: number, status: Plot['status']) => void
}

export function PlotGrid({ onPlotClick }: Props) {
  const plots = useFocusStore((s) => s.farm?.plots ?? [])
  const cols = plots.length <= 12 ? 'grid-cols-4' : plots.length <= 24 ? 'grid-cols-6' : 'grid-cols-9'

  return (
    <div className={`relative z-10 grid ${cols} gap-2 justify-center p-4`}>
      {plots.map((plot) => (
        <PlotTile
          key={plot.id}
          plot={plot}
          onClick={() => onPlotClick(plot.id, plot.status)}
        />
      ))}
    </div>
  )
}

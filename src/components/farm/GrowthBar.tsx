interface Props {
  progress: number
}

export function GrowthBar({ progress }: Props) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full bg-green transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

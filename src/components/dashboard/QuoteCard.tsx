import { useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

const QUOTES = [
  'التركيز قرار تتخذه كل صباح.',
  'لا قوة إلا بالله — ابدأ بمهمة واحدة.',
  'التخطيط نصف العمل، والإنجاز النصف الآخر.',
  'الاستمرارية أهم من الكمال.',
]

export function QuoteCard() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])
  return (
    <GlassCard className="h-full">
      <h4 className="mb-2 text-sm text-accent">💬 اقتباس اليوم</h4>
      <p className="text-sm leading-relaxed">{quote}</p>
    </GlassCard>
  )
}

import { Howl } from 'howler'

export type SoundKey =
  | 'click'
  | 'coin'
  | 'plant'
  | 'harvest'
  | 'error'
  | 'levelup'
  | 'expand'
  | 'buy'
  | 'attend'
  | 'session-add'
  | 'task-add'
  | 'task-done'

type SynthType = 'coin' | 'harvest' | 'plant' | 'click' | 'error' | 'levelup'

const SYNTH_MAP: Record<SoundKey, SynthType> = {
  click: 'click',
  coin: 'coin',
  plant: 'plant',
  harvest: 'harvest',
  error: 'error',
  levelup: 'levelup',
  expand: 'levelup',
  buy: 'coin',
  attend: 'coin',
  'session-add': 'coin',
  'task-add': 'plant',
  'task-done': 'harvest',
}

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function synthesize(type: SynthType): void {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  const configs: Record<
    SynthType,
    { freq: number; endFreq: number; dur: number; type: OscillatorType }
  > = {
    coin: { freq: 880, endFreq: 1320, dur: 0.15, type: 'sine' },
    harvest: { freq: 440, endFreq: 660, dur: 0.3, type: 'triangle' },
    plant: { freq: 220, endFreq: 330, dur: 0.2, type: 'sine' },
    click: { freq: 600, endFreq: 600, dur: 0.05, type: 'square' },
    error: { freq: 200, endFreq: 150, dur: 0.3, type: 'sawtooth' },
    levelup: { freq: 440, endFreq: 880, dur: 0.5, type: 'sine' },
  }

  const c = configs[type]
  osc.type = c.type
  osc.frequency.setValueAtTime(c.freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(c.endFreq, ctx.currentTime + c.dur)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur)
  osc.start()
  osc.stop(ctx.currentTime + c.dur)
}

const howlCache = new Map<string, Howl>()

function getHowl(file: string): Howl {
  let h = howlCache.get(file)
  if (!h) {
    h = new Howl({
      src: [`/sounds/${file}.mp3`, `/sounds/${file}.wav`],
      volume: 0.4,
      onloaderror: () => {},
    })
    howlCache.set(file, h)
  }
  return h
}

const SOUND_ENABLED = import.meta.env.VITE_SOUND_ENABLED !== 'false'

export function playSound(key: SoundKey): void {
  if (!SOUND_ENABLED) return

  const file = key === 'session-add' ? 'coin' : key === 'task-add' ? 'plant' : key
  const howl = getHowl(file)

  try {
    if (howl.state() === 'loaded') {
      howl.play()
      return
    }
    howl.once('load', () => howl.play())
    howl.once('loaderror', () => synthesize(SYNTH_MAP[key]))
    if (howl.state() === 'unloaded') howl.load()
    setTimeout(() => {
      if (!howl.playing()) synthesize(SYNTH_MAP[key])
    }, 120)
  } catch {
    synthesize(SYNTH_MAP[key])
  }
}

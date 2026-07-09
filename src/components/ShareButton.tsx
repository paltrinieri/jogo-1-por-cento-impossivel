import { useState } from 'react'

interface ShareButtonProps {
  score: number
  highScore: number
}

function buildShareText(score: number, highScore: number): string {
  const beatRecord = score >= highScore && score > 0
  const base = `Fiz ${score} ponto${score === 1 ? '' : 's'} em 1% Impossível.`
  const tail = beatRecord
    ? ' Bati meu recorde. Duvido você chegar aqui. 🔥'
    : ` Meu recorde é ${highScore}. Acha que consegue passar? 💀`
  return `${base}${tail}`
}

export function ShareButton({ score, highScore }: ShareButtonProps) {
  const [feedback, setFeedback] = useState('')

  const handleShare = async () => {
    const text = buildShareText(score, highScore)
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: '1% Impossível', text, url })
        return
      } catch {
        // usuário cancelou o share nativo — cai no fallback abaixo
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setFeedback('Copiado! Cola aí no story.')
    } catch {
      setFeedback(text)
    }
    setTimeout(() => setFeedback(''), 2500)
  }

  return (
    <>
      <button type="button" className="secondary-btn" onClick={handleShare}>
        Compartilhar
      </button>
      <div className="share-feedback">{feedback}</div>
    </>
  )
}

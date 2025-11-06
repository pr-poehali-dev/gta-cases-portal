import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface CaseItem {
  id: number
  name: string
  description: string
  rarity: string
  image_url: string
}

interface CaseOpeningProps {
  isOpen: boolean
  wonItem: CaseItem | null
  wonPromocode: string
  onClose: () => void
  onCopy: (code: string) => void
  allItems: CaseItem[]
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-red-500'
}

const rarityEmojis = {
  common: '🎁',
  rare: '💎',
  epic: '⭐',
  legendary: '👑'
}

export default function CaseOpening({ isOpen, wonItem, wonPromocode, onClose, onCopy, allItems }: CaseOpeningProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])

  useEffect(() => {
    if (isOpen && wonItem) {
      setIsSpinning(true)
      setShowResult(false)
      
      setTimeout(() => {
        setIsSpinning(false)
        setShowResult(true)
        
        const newParticles = Array.from({length: 30}, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100
        }))
        setParticles(newParticles)
      }, 4000)
    }
  }, [isOpen, wonItem])

  if (!wonItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-background to-card border-2">
          <div className="text-center py-12">
            <div className="text-8xl animate-spin mb-6">📦</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Открываем кейс...
            </h2>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const rouletteItems = [...allItems, ...allItems, wonItem, ...allItems, ...allItems]

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSpinning && onClose()}>
      <DialogContent className="max-w-6xl bg-gradient-to-br from-background via-card to-background border-2 border-primary/20">
        {isSpinning ? (
          <div className="py-8 relative">
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({length: 20}).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse relative z-10">
              🎰 Крутим рулетку... 🎰
            </h2>
            
            <div className="relative overflow-hidden h-56 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-2xl border-4 border-primary/40 shadow-2xl shadow-primary/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse"></div>
              
              <div className="absolute inset-y-0 left-1/2 w-2 bg-gradient-to-b from-transparent via-primary to-transparent z-10 shadow-2xl shadow-primary/80 blur-sm"></div>
              <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-primary via-secondary to-accent z-20 shadow-lg shadow-primary/50"></div>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                <div className="text-4xl animate-bounce">⬇️</div>
              </div>
              
              <div 
                className="flex gap-4 py-10 px-4 absolute"
                style={{
                  animation: 'roulette-spin 4s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
                  left: '-100%'
                }}
              >
                {rouletteItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="min-w-[140px] flex flex-col items-center justify-center bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl p-5 border-4 shadow-xl transform hover:scale-110 transition-transform"
                    style={{
                      borderColor: item.rarity === 'legendary' ? '#dc2626' : item.rarity === 'epic' ? '#8b5cf6' : item.rarity === 'rare' ? '#eab308' : '#6b7280',
                      boxShadow: `0 0 20px ${item.rarity === 'legendary' ? '#dc262640' : item.rarity === 'epic' ? '#8b5cf640' : item.rarity === 'rare' ? '#eab30840' : '#6b728040'}`
                    }}
                  >
                    <div className="text-6xl mb-3 animate-pulse">
                      {rarityEmojis[item.rarity as keyof typeof rarityEmojis]}
                    </div>
                    <p className="text-sm font-bold text-center line-clamp-2">{item.name}</p>
                    <Badge className={`${rarityColors[item.rarity as keyof typeof rarityColors]} mt-2 text-xs`}>
                      {item.rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-8 text-muted-foreground animate-pulse">
              <p className="text-lg">✨ Удача улыбается тебе... ✨</p>
            </div>
          </div>
        ) : showResult ? (
          <div className="text-center space-y-6 py-8 relative">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute text-3xl animate-float pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDelay: `${particle.id * 0.05}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              >
                {['🎉', '✨', '⭐', '💫', '🎊'][particle.id % 5]}
              </div>
            ))}
            
            <div className="text-9xl animate-bounce mb-4">🎉</div>
            
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
              Поздравляем! 
            </h2>
            
            <div className="bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 p-10 rounded-3xl border-4 border-primary/40 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/5 to-accent/5"></div>
              
              <div className="relative z-10 space-y-5">
                <div className="text-9xl mb-6 animate-bounce" style={{animationDuration: '1s'}}>
                  {rarityEmojis[wonItem.rarity as keyof typeof rarityEmojis]}
                </div>
                
                <h3 className="text-4xl font-bold drop-shadow-lg">{wonItem.name}</h3>
                
                <Badge className={`${rarityColors[wonItem.rarity as keyof typeof rarityColors]} text-2xl px-8 py-3 shadow-lg animate-pulse`}>
                  {wonItem.rarity.toUpperCase()} ✨
                </Badge>
                
                <p className="text-muted-foreground text-xl max-w-lg mx-auto mt-6 leading-relaxed">
                  {wonItem.description}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-3">Твой промокод для активации в игре:</p>
              <div className="flex items-center justify-center gap-3">
                <code className="font-mono font-bold text-3xl text-primary px-6 py-3 bg-background/50 rounded-lg">
                  {wonPromocode}
                </code>
                <Button 
                  size="lg"
                  onClick={() => onCopy(wonPromocode)}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Icon name="Copy" size={20} />
                </Button>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={onClose}
              className="mt-6"
            >
              Отлично!
            </Button>
          </div>
        ) : null}
      </DialogContent>
      
      <style>{`
        @keyframes roulette-spin {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-140px * ${rouletteItems.length - 10} - 16px * ${rouletteItems.length - 10}));
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) rotate(180deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Dialog>
  )
}
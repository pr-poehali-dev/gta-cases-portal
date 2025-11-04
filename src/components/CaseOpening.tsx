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

  useEffect(() => {
    if (isOpen && wonItem) {
      setIsSpinning(true)
      setShowResult(false)
      
      setTimeout(() => {
        setIsSpinning(false)
        setShowResult(true)
      }, 3000)
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
          <div className="py-8">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
              Крутим рулетку...
            </h2>
            
            <div className="relative overflow-hidden h-48 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-xl border-2 border-primary/30">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-primary via-secondary to-accent z-10 shadow-lg shadow-primary/50"></div>
              
              <div 
                className="flex gap-4 py-8 px-4 absolute"
                style={{
                  animation: 'roulette-spin 3s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
                  left: '-100%'
                }}
              >
                {rouletteItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="min-w-[120px] flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg p-4 border-2"
                    style={{
                      borderColor: `hsl(var(--${item.rarity === 'legendary' ? 'destructive' : item.rarity === 'epic' ? 'accent' : item.rarity === 'rare' ? 'primary' : 'muted'}))`
                    }}
                  >
                    <div className="text-5xl mb-2">
                      {rarityEmojis[item.rarity as keyof typeof rarityEmojis]}
                    </div>
                    <p className="text-xs font-bold text-center line-clamp-2">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : showResult ? (
          <div className="text-center space-y-6 py-8">
            <div className="text-8xl animate-bounce mb-4">🎉</div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Поздравляем!
            </h2>
            
            <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-8 rounded-2xl border-2 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="text-7xl mb-4">
                  {rarityEmojis[wonItem.rarity as keyof typeof rarityEmojis]}
                </div>
                
                <h3 className="text-3xl font-bold">{wonItem.name}</h3>
                
                <Badge className={`${rarityColors[wonItem.rarity as keyof typeof rarityColors]} text-xl px-6 py-2`}>
                  {wonItem.rarity.toUpperCase()}
                </Badge>
                
                <p className="text-muted-foreground text-lg max-w-md mx-auto mt-4">
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
            transform: translateX(calc(-120px * ${rouletteItems.length - 10} - 16px * ${rouletteItems.length - 10}));
          }
        }
      `}</style>
    </Dialog>
  )
}

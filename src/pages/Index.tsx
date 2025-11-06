import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'
import { toast } from '@/hooks/use-toast'
import AdminPanel from '@/components/AdminPanel'
import CaseOpening from '@/components/CaseOpening'

interface User {
  id: number
  username: string
  balance: number
  is_admin: boolean
}

interface Case {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  rarity: string
}

interface Promocode {
  id: number
  promo_code: string
  item_name: string
  is_used: boolean
  created_at: string
  rarity: string
  description: string
  case_name: string
  case_price: number
}

interface CaseItem {
  id: number
  name: string
  description: string
  rarity: string
  image_url: string
}

interface MarketItem {
  id: number
  price: number
  item_name: string
  item_rarity: string
  item_description: string
  created_at: string
  seller_name: string
}

const API = {
  auth: 'https://functions.poehali.dev/2683cf66-ae47-4961-a937-86b9459ed44d',
  cases: 'https://functions.poehali.dev/a6cc4837-3e34-4908-895c-15f350d4bf82',
  openCase: 'https://functions.poehali.dev/5cfb3c0a-db96-4cd3-af03-bbd6fca3f334',
  promocodes: 'https://functions.poehali.dev/25402768-5a7d-4294-b821-840ad2c01266',
  admin: 'https://functions.poehali.dev/95f066f2-b22c-4926-97d8-63e7dbfcf506'
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-red-500'
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [cases, setCases] = useState<Case[]>([])
  const [promocodes, setPromocodes] = useState<Promocode[]>([])
  const [activeTab, setActiveTab] = useState('cases')
  const [adminTab, setAdminTab] = useState('dashboard')
  const [openingCase, setOpeningCase] = useState(false)
  const [wonItem, setWonItem] = useState<CaseItem | null>(null)
  const [wonPromocode, setWonPromocode] = useState<string>('')
  const [allCaseItems, setAllCaseItems] = useState<CaseItem[]>([])
  const [openingCaseId, setOpeningCaseId] = useState<number | null>(null)
  const [marketItems, setMarketItems] = useState<MarketItem[]>([])
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [selectedPromoForSale, setSelectedPromoForSale] = useState<Promocode | null>(null)
  const [salePrice, setSalePrice] = useState('')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    loadCases()
    loadMarket()
  }, [])

  useEffect(() => {
    if (user) {
      loadPromocodes()
    }
  }, [user])

  const loadCases = async () => {
    try {
      const res = await fetch(API.cases)
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      if (Array.isArray(data)) {
        setCases(data)
      }
    } catch (error) {
      console.error('Error loading cases:', error)
    }
  }

  const loadPromocodes = async () => {
    if (!user) return
    try {
      const res = await fetch(`${API.promocodes}?user_id=${user.id}`)
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      if (Array.isArray(data)) {
        setPromocodes(data)
      }
    } catch (error) {
      console.error('Error loading promocodes:', error)
    }
  }

  const handleAuth = async (action: 'login' | 'register', username: string, password: string) => {
    try {
      const res = await fetch(API.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, password })
      })
      const data = await res.json()
      
      if (data.success) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        setAuthOpen(false)
        toast({ title: action === 'login' ? 'Вход выполнен' : 'Регистрация успешна' })
      } else {
        toast({ title: data.error || 'Ошибка авторизации', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' })
    }
  }

  const loadCaseItems = async (caseId: number) => {
    try {
      const res = await fetch(`${API.cases}?case_id=${caseId}`)
      const data = await res.json()
      if (data.items) {
        setAllCaseItems(data.items)
      }
    } catch (error) {
      console.error('Error loading case items')
    }
  }

  const playSound = (type: 'spin' | 'win') => {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'spin') {
      oscillator.frequency.value = 200
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    } else {
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    }
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  const handleOpenCase = async (caseId: number) => {
    if (!user) {
      setAuthOpen(true)
      return
    }

    setOpeningCaseId(caseId)
    setOpeningCase(true)
    setWonItem(null)
    playSound('spin')
    
    await loadCaseItems(caseId)

    try {
      const res = await fetch(API.openCase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, case_id: caseId })
      })
      const data = await res.json()

      if (data.success) {
        setWonItem(data.item)
        setWonPromocode(data.promo_code)
        setUser({ ...user, balance: data.new_balance })
        setTimeout(() => playSound('win'), 4000)
        loadPromocodes()
      } else {
        toast({ title: data.error || 'Ошибка открытия кейса', variant: 'destructive' })
        setOpeningCase(false)
      }
    } catch (error) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' })
      setOpeningCase(false)
    }
  }

  const handleSellPromo = async (promoId: number) => {
    if (!user) return
    
    try {
      const res = await fetch(API.promocodes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo_id: promoId, user_id: user.id })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: `Продано за ${data.sold_for.toFixed(2)} ₽!` })
        setUser({ ...user, balance: data.new_balance })
        loadPromocodes()
      } else {
        toast({ title: data.error || 'Ошибка продажи', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' })
    }
  }

  const closeOpeningDialog = () => {
    setOpeningCase(false)
    setWonItem(null)
    setWonPromocode('')
    setAllCaseItems([])
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast({ title: 'Вы вышли из аккаунта' })
  }

  const copyPromocode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: 'Промокод скопирован!' })
  }

  const loadMarket = async () => {
    try {
      const res = await fetch(`${API.promocodes}?action=market`)
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMarketItems(data)
      }
    } catch (error) {
      console.error('Error loading market:', error)
    }
  }

  const handleListOnMarket = async (price: number) => {
    if (!user || !selectedPromoForSale) return
    
    try {
      const res = await fetch(API.promocodes, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_market',
          promo_id: selectedPromoForSale.id,
          user_id: user.id,
          price
        })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Выставлено на маркет!' })
        setSellDialogOpen(false)
        setSelectedPromoForSale(null)
        setSalePrice('')
        loadPromocodes()
        loadMarket()
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' })
    }
  }

  const handleBuyFromMarket = async (marketId: number) => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    
    try {
      const res = await fetch(API.promocodes, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy_market',
          market_id: marketId,
          user_id: user.id
        })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Куплено!' })
        setUser({ ...user, balance: data.new_balance })
        loadMarket()
        loadPromocodes()
      } else {
        toast({ title: data.error || 'Ошибка покупки', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Package" size={26} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GTA 5 RP Cases
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-gradient-to-r from-secondary/30 to-secondary/10 px-4 py-2 rounded-lg border border-secondary/30 shadow-md">
                  <Icon name="Coins" size={20} className="text-secondary" />
                  <span className="font-bold text-secondary text-lg">{user.balance.toFixed(2)} ₽</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="User" size={18} />
                  <span>{user.username}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Выход
                </Button>
              </>
            ) : (
              <Button onClick={() => setAuthOpen(true)}>
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full max-w-3xl mx-auto mb-8 ${user?.is_admin ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="cases">
              <Icon name="Package" size={18} className="mr-2" />
              Кейсы
            </TabsTrigger>
            <TabsTrigger value="market">
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Маркет
            </TabsTrigger>
            <TabsTrigger value="promocodes" disabled={!user}>
              <Icon name="Ticket" size={18} className="mr-2" />
              Мои промокоды
            </TabsTrigger>
            {user?.is_admin && (
              <TabsTrigger value="admin">
                <Icon name="Shield" size={18} className="mr-2" />
                Админ
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-30">
                <div className="w-96 h-96 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"></div>
              </div>
              <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent relative z-10" style={{animation: 'float 4s ease-in-out infinite'}}>
                Выбери свой кейс
              </h2>
              <p className="text-xl text-muted-foreground relative z-10">Открывай кейсы и получай промокоды для игры!</p>
            </div>

            {cases.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-9xl mb-6 animate-bounce">📦</div>
                <h3 className="text-2xl font-bold mb-3">Кейсы загружаются...</h3>
                <p className="text-muted-foreground">Подожди немного</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cases.map((caseItem) => (
                <Card 
                  key={caseItem.id} 
                  className="case-card-glow overflow-hidden hover:scale-105 transition-all duration-300 relative group bg-gradient-to-br from-card to-card/50"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={rarityColors[caseItem.rarity as keyof typeof rarityColors]}>
                      {caseItem.rarity}
                    </Badge>
                  </div>
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                    <div className="text-7xl group-hover:scale-110 transition-transform relative z-10" style={{animation: 'float 3s ease-in-out infinite'}}>
                      📦
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-xl">{caseItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-secondary font-bold">
                        <Icon name="Coins" size={18} />
                        <span>{caseItem.price} ₽</span>
                      </div>
                      <Button 
                        onClick={() => handleOpenCase(caseItem.id)}
                        disabled={user && user.balance < caseItem.price}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Открыть
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="text-center mb-10 relative">
              <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20">
                <div className="w-80 h-80 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
              </div>
              <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent relative z-10">
                Маркетплейс
              </h2>
              <p className="text-lg text-muted-foreground relative z-10">Покупай предметы у других игроков</p>
            </div>

            {marketItems.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Store" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Пока никто ничего не продает</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:scale-105 transition-all bg-gradient-to-br from-card to-card/50 border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{item.item_name}</h3>
                          <p className="text-xs text-muted-foreground">Продавец: {item.seller_name}</p>
                        </div>
                        <Badge className={rarityColors[item.item_rarity as keyof typeof rarityColors]}>
                          {item.item_rarity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.item_description}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-secondary font-bold text-xl">
                          <Icon name="Coins" size={20} />
                          <span>{item.price} ₽</span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleBuyFromMarket(item.id)}
                          disabled={!user}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Купить
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="promocodes" className="space-y-6">
            <div className="text-center mb-10 relative">
              <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20">
                <div className="w-80 h-80 bg-gradient-to-r from-accent to-primary rounded-full"></div>
              </div>
              <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent relative z-10">
                Твои промокоды
              </h2>
              <p className="text-lg text-muted-foreground relative z-10">Активируй их в игре или продай обратно</p>
            </div>

            {promocodes.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="PackageX" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У тебя пока нет промокодов</p>
                <Button onClick={() => setActiveTab('cases')} className="mt-4">
                  Открыть кейс
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promocodes.map((promo) => (
                  <Card key={promo.id} className={`overflow-hidden ${promo.is_used ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{promo.item_name}</h3>
                          <p className="text-xs text-muted-foreground">{promo.case_name}</p>
                        </div>
                        <Badge className={rarityColors[promo.rarity as keyof typeof rarityColors]}>
                          {promo.rarity}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
                        <code className="font-mono font-bold text-primary">{promo.promo_code}</code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyPromocode(promo.promo_code)}
                          disabled={promo.is_used}
                        >
                          <Icon name="Copy" size={16} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(promo.created_at).toLocaleDateString('ru-RU')}
                        </p>
                        {!promo.is_used && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSellPromo(promo.id)}
                              className="text-xs"
                            >
                              <Icon name="DollarSign" size={14} className="mr-1" />
                              Продать {(promo.case_price * 0.5).toFixed(0)} ₽
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedPromoForSale(promo)
                                setSellDialogOpen(true)
                              }}
                              className="text-xs bg-primary"
                            >
                              <Icon name="ShoppingCart" size={14} className="mr-1" />
                              На маркет
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {user?.is_admin && (
            <TabsContent value="admin">
              <AdminPanel userId={user.id} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Авторизация</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAuth('login', formData.get('username') as string, formData.get('password') as string)
              }} className="space-y-4">
                <div>
                  <Label>Логин</Label>
                  <Input name="username" required />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Войти</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAuth('register', formData.get('username') as string, formData.get('password') as string)
              }} className="space-y-4">
                <div>
                  <Label>Логин</Label>
                  <Input name="username" required />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CaseOpening
        isOpen={openingCase}
        wonItem={wonItem}
        wonPromocode={wonPromocode}
        onClose={closeOpeningDialog}
        onCopy={copyPromocode}
        allItems={allCaseItems}
      />

      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выставить на маркет</DialogTitle>
          </DialogHeader>
          {selectedPromoForSale && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-bold text-lg">{selectedPromoForSale.item_name}</p>
                <Badge className={`${rarityColors[selectedPromoForSale.rarity as keyof typeof rarityColors]} mt-2`}>
                  {selectedPromoForSale.rarity}
                </Badge>
              </div>
              
              <div>
                <Label>Цена (₽)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Введите цену"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Рекомендуемая цена: {(selectedPromoForSale.case_price * 0.7).toFixed(0)} ₽
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleListOnMarket(parseFloat(salePrice))}
                  disabled={!salePrice || parseFloat(salePrice) <= 0}
                  className="flex-1"
                >
                  Выставить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSellDialogOpen(false)
                    setSelectedPromoForSale(null)
                    setSalePrice('')
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
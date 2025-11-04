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
}

interface CaseItem {
  id: number
  name: string
  description: string
  rarity: string
  image_url: string
}

const API = {
  auth: 'https://functions.poehali.dev/2683cf66-ae47-4961-a937-86b9459ed44d',
  cases: 'https://functions.poehali.dev/a6cc4837-3e34-4908-895c-15f350d4bf82',
  openCase: 'https://functions.poehali.dev/5cfb3c0a-db96-4cd3-af03-bbd6fca3f334',
  promocodes: 'https://functions.poehali.dev/25402768-5a7d-4294-b821-840ad2c01266'
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
  const [openingCase, setOpeningCase] = useState(false)
  const [wonItem, setWonItem] = useState<CaseItem | null>(null)
  const [wonPromocode, setWonPromocode] = useState<string>('')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    loadCases()
  }, [])

  useEffect(() => {
    if (user) {
      loadPromocodes()
    }
  }, [user])

  const loadCases = async () => {
    try {
      const res = await fetch(API.cases)
      const data = await res.json()
      setCases(data)
    } catch (error) {
      toast({ title: 'Ошибка загрузки кейсов', variant: 'destructive' })
    }
  }

  const loadPromocodes = async () => {
    if (!user) return
    try {
      const res = await fetch(`${API.promocodes}?user_id=${user.id}`)
      const data = await res.json()
      setPromocodes(data)
    } catch (error) {
      toast({ title: 'Ошибка загрузки промокодов', variant: 'destructive' })
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

  const handleOpenCase = async (caseId: number) => {
    if (!user) {
      setAuthOpen(true)
      return
    }

    setOpeningCase(true)
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
        setTimeout(() => {
          setOpeningCase(false)
          loadPromocodes()
        }, 3000)
      } else {
        toast({ title: data.error || 'Ошибка открытия кейса', variant: 'destructive' })
        setOpeningCase(false)
      }
    } catch (error) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' })
      setOpeningCase(false)
    }
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">IILUSION RP</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg">
                  <Icon name="Coins" size={20} className="text-secondary" />
                  <span className="font-bold text-secondary">{user.balance.toFixed(2)} ₽</span>
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="cases">
              <Icon name="Package" size={18} className="mr-2" />
              Кейсы
            </TabsTrigger>
            <TabsTrigger value="promocodes" disabled={!user}>
              <Icon name="Ticket" size={18} className="mr-2" />
              Мои промокоды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">Выбери свой кейс</h2>
              <p className="text-muted-foreground">Открывай кейсы и получай промокоды для игры!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <Card 
                  key={caseItem.id} 
                  className="overflow-hidden hover:scale-105 transition-transform duration-300 relative group"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={rarityColors[caseItem.rarity as keyof typeof rarityColors]}>
                      {caseItem.rarity}
                    </Badge>
                  </div>
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted to-background p-6 flex items-center justify-center">
                    <div className="text-6xl group-hover:scale-110 transition-transform">
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
          </TabsContent>

          <TabsContent value="promocodes" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">Твои промокоды</h2>
              <p className="text-muted-foreground">Активируй их в игре для получения предметов</p>
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
                        >
                          <Icon name="Copy" size={16} />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(promo.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
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

      <Dialog open={openingCase} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <div className="text-center space-y-6 py-8">
            {wonItem ? (
              <>
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold">Поздравляем!</h2>
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-2">{wonItem.name}</h3>
                  <Badge className={`${rarityColors[wonItem.rarity as keyof typeof rarityColors]} text-lg px-4 py-1`}>
                    {wonItem.rarity}
                  </Badge>
                  <p className="text-muted-foreground mt-4">{wonItem.description}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Твой промокод:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="font-mono font-bold text-2xl text-primary">{wonPromocode}</code>
                    <Button size="sm" onClick={() => copyPromocode(wonPromocode)}>
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl animate-spin">📦</div>
                <h2 className="text-2xl font-bold">Открываем кейс...</h2>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
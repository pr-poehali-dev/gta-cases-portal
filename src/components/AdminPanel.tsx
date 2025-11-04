import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Icon from '@/components/ui/icon'
import { toast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

interface AdminPanelProps {
  userId: number
}

const API_ADMIN = 'https://functions.poehali.dev/95f066f2-b22c-4926-97d8-63e7dbfcf506'
const API_CASES = 'https://functions.poehali.dev/a6cc4837-3e34-4908-895c-15f350d4bf82'

export default function AdminPanel({ userId }: AdminPanelProps) {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedCase, setSelectedCase] = useState<any>(null)

  useEffect(() => {
    loadStats()
    loadUsers()
    loadCases()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_ADMIN}?action=stats`, {
        headers: { 'X-User-Id': userId.toString() }
      })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      toast({ title: 'Ошибка загрузки статистики', variant: 'destructive' })
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_ADMIN}?action=users`, {
        headers: { 'X-User-Id': userId.toString() }
      })
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast({ title: 'Ошибка загрузки пользователей', variant: 'destructive' })
    }
  }

  const loadCases = async () => {
    try {
      const res = await fetch(API_CASES)
      const data = await res.json()
      setCases(data)
    } catch (error) {
      toast({ title: 'Ошибка загрузки кейсов', variant: 'destructive' })
    }
  }

  const updateBalance = async (targetUserId: number, newBalance: number) => {
    try {
      const res = await fetch(API_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'update_balance',
          user_id: targetUserId,
          balance: newBalance
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Баланс обновлен' })
        loadUsers()
        setSelectedUser(null)
      }
    } catch (error) {
      toast({ title: 'Ошибка обновления баланса', variant: 'destructive' })
    }
  }

  const createCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(API_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'create_case',
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          rarity: formData.get('rarity')
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Кейс создан' })
        loadCases()
        e.currentTarget.reset()
      }
    } catch (error) {
      toast({ title: 'Ошибка создания кейса', variant: 'destructive' })
    }
  }

  const updateCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(API_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'update_case',
          case_id: selectedCase.id,
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          rarity: formData.get('rarity')
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Кейс обновлен' })
        loadCases()
        setSelectedCase(null)
      }
    } catch (error) {
      toast({ title: 'Ошибка обновления кейса', variant: 'destructive' })
    }
  }

  const createItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(API_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'create_item',
          case_id: parseInt(formData.get('case_id') as string),
          name: formData.get('name'),
          description: formData.get('description'),
          rarity: formData.get('rarity'),
          drop_chance: parseFloat(formData.get('drop_chance') as string)
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Предмет добавлен' })
        e.currentTarget.reset()
      }
    } catch (error) {
      toast({ title: 'Ошибка добавления предмета', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <Icon name="Shield" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Админ-панель
          </h2>
          <p className="text-muted-foreground">Управление сайтом</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Пользователей</p>
                  <p className="text-3xl font-bold text-primary">{stats.total_users}</p>
                </div>
                <Icon name="Users" size={32} className="text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Кейсов</p>
                  <p className="text-3xl font-bold text-secondary">{stats.total_cases}</p>
                </div>
                <Icon name="Package" size={32} className="text-secondary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Промокодов</p>
                  <p className="text-3xl font-bold text-accent">{stats.total_promocodes}</p>
                </div>
                <Icon name="Ticket" size={32} className="text-accent/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Баланс всех</p>
                  <p className="text-3xl font-bold text-green-500">{stats.total_balance.toFixed(0)} ₽</p>
                </div>
                <Icon name="Coins" size={32} className="text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="cases">Кейсы</TabsTrigger>
          <TabsTrigger value="items">Предметы</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{u.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Баланс: {u.balance.toFixed(2)} ₽
                          {u.is_admin && <span className="ml-2 text-primary">• Админ</span>}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setSelectedUser(u)}>
                      Изменить баланс
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Создать кейс</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createCase} className="space-y-4">
                  <div>
                    <Label>Название</Label>
                    <Input name="name" required />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea name="description" required />
                  </div>
                  <div>
                    <Label>Цена</Label>
                    <Input name="price" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label>Редкость</Label>
                    <Select name="rarity" defaultValue="common">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Создать кейс</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Существующие кейсы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {cases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.price} ₽ • {c.rarity}</p>
                      </div>
                      <Button size="sm" onClick={() => setSelectedCase(c)}>
                        Изменить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Добавить предмет в кейс</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createItem} className="space-y-4 max-w-xl">
                <div>
                  <Label>Кейс</Label>
                  <Select name="case_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите кейс" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Название предмета</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea name="description" required />
                </div>
                <div>
                  <Label>Редкость</Label>
                  <Select name="rarity" defaultValue="common">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Шанс выпадения (%)</Label>
                  <Input name="drop_chance" type="number" step="0.01" min="0" max="100" required />
                </div>
                <Button type="submit" className="w-full">Добавить предмет</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Изменить баланс: {selectedUser.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                updateBalance(selectedUser.id, parseFloat(formData.get('balance') as string))
              }} className="space-y-4">
                <div>
                  <Label>Новый баланс</Label>
                  <Input 
                    name="balance" 
                    type="number" 
                    step="0.01"
                    defaultValue={selectedUser.balance}
                    required 
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Сохранить</Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Редактировать кейс</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateCase} className="space-y-4">
                <div>
                  <Label>Название</Label>
                  <Input name="name" defaultValue={selectedCase.name} required />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea name="description" defaultValue={selectedCase.description} required />
                </div>
                <div>
                  <Label>Цена</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={selectedCase.price} required />
                </div>
                <div>
                  <Label>Редкость</Label>
                  <Select name="rarity" defaultValue={selectedCase.rarity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Сохранить</Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedCase(null)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

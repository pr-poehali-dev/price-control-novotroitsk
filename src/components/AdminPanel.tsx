import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const mockUsers = [
  { id: 1, login: 'operator1', role: 'Оператор', status: 'active', lastLogin: '2024-01-15 14:30' },
  { id: 2, login: 'operator2', role: 'Оператор', status: 'active', lastLogin: '2024-01-14 09:15' },
  { id: 3, login: 'admin', role: 'Администратор', status: 'active', lastLogin: '2024-01-15 16:00' },
];

const mockAuditLog = [
  { id: 1, user: 'operator1', action: 'Добавил цену', details: 'Молоко 3.2% - 72₽', timestamp: '2024-01-15 14:30' },
  { id: 2, user: 'admin', action: 'Изменил товар', details: 'Хлеб белый - обновлены пределы', timestamp: '2024-01-15 12:00' },
  { id: 3, user: 'operator2', action: 'Удалил запись', details: 'Куриная грудка - 15.01.2024', timestamp: '2024-01-14 11:45' },
];

interface AdminPanelProps {
  isSuperAdmin?: boolean;
}

const AdminPanel = ({ isSuperAdmin = false }: AdminPanelProps) => {
  const { toast } = useToast();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);

  const handleAddUser = () => {
    toast({ title: 'Успешно', description: 'Пользователь добавлен' });
    setIsUserDialogOpen(false);
  };

  const handleAddProduct = () => {
    toast({ title: 'Успешно', description: 'Товар добавлен в справочник' });
    setIsProductDialogOpen(false);
  };

  const handleAddStore = () => {
    toast({ title: 'Успешно', description: 'Магазин добавлен в справочник' });
    setIsStoreDialogOpen(false);
  };

  const handleExport = (format: string) => {
    toast({ title: 'Экспорт', description: `Отчёт экспортируется в формате ${format}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Панель администратора</h2>
        <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="gap-2">
          <Icon name={isSuperAdmin ? 'Crown' : 'Shield'} size={16} />
          {isSuperAdmin ? 'Главный администратор' : 'Администратор'}
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="gap-2">
            <Icon name="Users" size={16} />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="directories" className="gap-2">
            <Icon name="Database" size={16} />
            Справочники
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Icon name="FileEdit" size={16} />
            Данные
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Icon name="FileBarChart" size={16} />
            Отчёты
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Icon name="Settings" size={16} />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="animate-fade-in space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Управление пользователями</CardTitle>
                  <CardDescription>Добавление, редактирование и управление доступом</CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="UserPlus" size={16} />
                      Добавить пользователя
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый пользователь</DialogTitle>
                      <DialogDescription>Создайте нового пользователя системы</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="login">Логин</Label>
                        <Input id="login" placeholder="operator3" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Роль</Label>
                        <Select defaultValue="operator">
                          <SelectTrigger id="role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operator">Оператор</SelectItem>
                            {isSuperAdmin && (
                              <SelectItem value="admin">Администратор</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {!isSuperAdmin && (
                          <p className="text-xs text-muted-foreground">
                            Только главный администратор может создавать админов
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Отмена</Button>
                      <Button onClick={handleAddUser}>Создать</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Логин</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Последний вход</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.login}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Администратор' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Журнал действий</CardTitle>
              <CardDescription>История действий пользователей в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Детали</TableHead>
                    <TableHead>Время</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAuditLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-muted-foreground">{log.details}</TableCell>
                      <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directories" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Товары</CardTitle>
                    <CardDescription>Управление каталогом товаров</CardDescription>
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Icon name="Plus" size={16} />
                        Добавить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый товар</DialogTitle>
                        <DialogDescription>Добавьте товар в справочник</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Название товара</Label>
                          <Input placeholder="Яйца куриные, 10 шт." />
                        </div>
                        <div className="space-y-2">
                          <Label>Категория</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dairy">Молочные продукты</SelectItem>
                              <SelectItem value="bread">Хлеб и выпечка</SelectItem>
                              <SelectItem value="eggs">Яйца</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Мин. цена (₽)</Label>
                            <Input type="number" placeholder="65" />
                          </div>
                          <div className="space-y-2">
                            <Label>Макс. цена (₽)</Label>
                            <Input type="number" placeholder="85" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch id="photo-required" />
                            <Label htmlFor="photo-required">Требуется фотофиксация</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Отмена</Button>
                        <Button onClick={handleAddProduct}>Добавить</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Молоко 3.2%</p>
                      <p className="text-sm text-muted-foreground">65–85₽</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Хлеб белый</p>
                      <p className="text-sm text-muted-foreground">35–50₽</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Куриная грудка</p>
                      <p className="text-sm text-muted-foreground">280–350₽</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Icon name="Upload" size={16} />
                  Импорт из Excel/CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Магазины</CardTitle>
                    <CardDescription>Управление сетью магазинов</CardDescription>
                  </div>
                  <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Icon name="Plus" size={16} />
                        Добавить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый магазин</DialogTitle>
                        <DialogDescription>Добавьте магазин в справочник</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Название магазина</Label>
                          <Input placeholder="Магнит" />
                        </div>
                        <div className="space-y-2">
                          <Label>Населённый пункт</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите населённый пункт" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">Новотроицкое (центр)</SelectItem>
                              <SelectItem value="north">Северный район</SelectItem>
                              <SelectItem value="south">Южный район</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Адрес</Label>
                          <Input placeholder="ул. Ленина, 15" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStoreDialogOpen(false)}>Отмена</Button>
                        <Button onClick={handleAddStore}>Добавить</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Магнит</p>
                      <p className="text-sm text-muted-foreground">Центральный</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Пятёрочка</p>
                      <p className="text-sm text-muted-foreground">Северный</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">Лента</p>
                      <p className="text-sm text-muted-foreground">Западный</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Icon name="Upload" size={16} />
                  Импорт из Excel/CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Категории товаров</CardTitle>
                <CardDescription>Управление категориями</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Молочные продукты', 'Хлеб и выпечка', 'Мясо и птица', 'Овощи и фрукты'].map((category) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <p className="font-medium">{category}</p>
                      <Button variant="ghost" size="icon">
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить категорию
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Населённые пункты</CardTitle>
                <CardDescription>Управление географией</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Центральный', 'Северный', 'Западный', 'Южный'].map((district) => (
                    <div key={district} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <p className="font-medium">{district}</p>
                      <Button variant="ghost" size="icon">
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить район
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Управление данными</CardTitle>
              <CardDescription>Редактирование и массовые операции с записями о ценах</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Icon name="Filter" size={16} />
                  Фильтры
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Trash2" size={16} />
                  Массовое удаление
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Edit" size={16} />
                  Массовое редактирование
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Магазин</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Оператор</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, date: '2024-01-15', store: 'Магнит', product: 'Молоко 3.2%', price: 72, operator: 'operator1' },
                    { id: 2, date: '2024-01-15', store: 'Пятёрочка', product: 'Хлеб белый', price: 92, operator: 'operator2' },
                    { id: 3, date: '2024-01-14', store: 'Лента', product: 'Куриная грудка', price: 310, operator: 'operator1' },
                  ].map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.store}</TableCell>
                      <TableCell>{record.product}</TableCell>
                      <TableCell className="font-semibold">{record.price}₽</TableCell>
                      <TableCell className="text-muted-foreground">{record.operator}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Генерация отчётов</CardTitle>
                <CardDescription>Создайте отчёт по заданным параметрам</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип отчёта</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип отчёта" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-compare">Сравнение цен за период</SelectItem>
                      <SelectItem value="store-analytics">Аналитика по магазинам</SelectItem>
                      <SelectItem value="violations">Отчёт о превышениях</SelectItem>
                      <SelectItem value="photo-check">Проверка фотофиксации</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Период от</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Период до</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Магазин (опционально)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Все магазины" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все магазины</SelectItem>
                      <SelectItem value="magnit">Магнит</SelectItem>
                      <SelectItem value="pyaterochka">Пятёрочка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gap-2">
                  <Icon name="FileText" size={16} />
                  Сформировать отчёт
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Экспорт данных</CardTitle>
                <CardDescription>Выгрузка отчётов в различных форматах</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => handleExport('Excel')}>
                  <Icon name="FileSpreadsheet" size={20} className="text-green-600" />
                  Экспорт в Excel (.xlsx)
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => handleExport('CSV')}>
                  <Icon name="FileText" size={20} className="text-blue-600" />
                  Экспорт в CSV
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => handleExport('Word')}>
                  <Icon name="FileText" size={20} className="text-blue-700" />
                  Экспорт в Word (.docx)
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => handleExport('PDF')}>
                  <Icon name="File" size={20} className="text-red-600" />
                  Экспорт в PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Готовые отчёты</CardTitle>
                <CardDescription>Последние сгенерированные отчёты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Сравнение цен за январь 2024', date: '15.01.2024', format: 'Excel' },
                    { name: 'Отчёт о превышениях', date: '14.01.2024', format: 'PDF' },
                    { name: 'Аналитика по магазинам', date: '13.01.2024', format: 'Word' },
                  ].map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon name="FileText" size={20} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.date} • {report.format}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Icon name="Download" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки</CardTitle>
                <CardDescription>Параметры работы системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Валюта</Label>
                  <Select defaultValue="rub">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rub">Российский рубль (₽)</SelectItem>
                      <SelectItem value="usd">Доллар США ($)</SelectItem>
                      <SelectItem value="eur">Евро (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select defaultValue="msk">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msk">МСК (UTC+3)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Настройка системных уведомлений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Уведомления о превышениях</Label>
                    <p className="text-sm text-muted-foreground">Оповещение при отклонении цен</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Напоминания операторам</Label>
                    <p className="text-sm text-muted-foreground">Если не внесены данные</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Резервное копирование</CardTitle>
                <CardDescription>Автоматическое сохранение данных</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Автоматический бэкап</Label>
                    <p className="text-sm text-muted-foreground">Ежедневное копирование в 00:00</p>
                  </div>
                  <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Icon name="Database" size={16} />
                  Создать резервную копию сейчас
                </Button>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Последний бэкап: 15.01.2024 00:00</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Права доступа</CardTitle>
                <CardDescription>Управление разрешениями по ролям</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="font-semibold">Оператор</Label>
                  <div className="space-y-2 pl-2">
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked disabled />
                      <span className="text-sm">Ввод данных о ценах</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked disabled />
                      <span className="text-sm">Просмотр истории (своих записей)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch />
                      <span className="text-sm">Редактирование своих записей</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Администратор</Label>
                  <p className="text-sm text-muted-foreground pl-2">Полный доступ ко всем функциям</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
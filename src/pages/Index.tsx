import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';

const mockDistricts = [
  { id: 1, name: 'Новотроицкое (центр)', stores: ['Магнит', 'Пятёрочка', 'Перекрёсток'] },
  { id: 2, name: 'Северный район', stores: ['Лента', 'Дикси'] },
  { id: 3, name: 'Западный район', stores: ['Магнит', 'Монетка'] },
  { id: 4, name: 'Южный район', stores: ['Пятёрочка', 'Верный'] },
];

const mockCategories = ['Молочные продукты', 'Хлеб и выпечка', 'Мясо и птица', 'Овощи и фрукты'];
const mockProducts = [
  { id: 1, name: 'Молоко 3.2%', category: 'Молочные продукты', minPrice: 65, maxPrice: 85, photoRequired: false },
  { id: 2, name: 'Хлеб белый', category: 'Хлеб и выпечка', minPrice: 35, maxPrice: 50, photoRequired: true },
  { id: 3, name: 'Куриная грудка', category: 'Мясо и птица', minPrice: 280, maxPrice: 350, photoRequired: false },
];

const mockHistory = [
  { id: 1, date: '2024-01-15', store: 'Магнит', product: 'Молоко 3.2%', price: 72, status: 'normal', photo: true },
  { id: 2, date: '2024-01-15', store: 'Пятёрочка', product: 'Хлеб белый', price: 92, status: 'warning', photo: false },
  { id: 3, date: '2024-01-14', store: 'Лента', product: 'Куриная грудка', price: 310, status: 'normal', photo: true },
];

const mockHeatmapData = [
  { store: 'Магнит', district: 'Центральный', avgPrice: 75, priceIndex: 0.95 },
  { store: 'Пятёрочка', district: 'Северный', avgPrice: 82, priceIndex: 1.05 },
  { store: 'Лента', district: 'Западный', avgPrice: 78, priceIndex: 0.98 },
  { store: 'Перекрёсток', district: 'Южный', avgPrice: 88, priceIndex: 1.12 },
];

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'operator' | 'admin'>('operator');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [availableStores, setAvailableStores] = useState<string[]>([]);

  const handleLogin = (role: 'operator' | 'admin') => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const district = mockDistricts.find(d => d.name === districtName);
    setAvailableStores(district?.stores || []);
    setSelectedStore('');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleSubmitPrice = () => {
    if (!selectedDistrict || !selectedStore || !selectedProduct || !price) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const product = mockProducts.find(p => p.name === selectedProduct);
    const priceNum = parseFloat(price);

    if (product?.photoRequired && !photoFile) {
      toast({
        title: 'Ошибка',
        description: 'Для этого товара обязательна фотофиксация',
        variant: 'destructive',
      });
      return;
    }

    if (product && (priceNum < product.minPrice || priceNum > product.maxPrice)) {
      if (!comment) {
        toast({
          title: '⚠️ Требуется комментарий',
          description: 'Цена выходит за пределы. Укажите причину такой цены.',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Успешно',
      description: 'Данные о цене сохранены',
    });
    setSelectedDistrict('');
    setSelectedStore('');
    setSelectedProduct('');
    setPrice('');
    setComment('');
    setPhotoFile(null);
    setAvailableStores([]);
  };

  const getHeatColor = (index: number) => {
    if (index < 0.95) return 'bg-green-100 text-green-800';
    if (index < 1.05) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">Цена-Контроль</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Icon name="Wifi" size={16} />
              Онлайн
            </Badge>
            <Select value={userRole} onValueChange={(val) => setUserRole(val as 'operator' | 'admin')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    Оператор
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Icon name="Shield" size={16} />
                    Администратор
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {userRole === 'admin' ? (
          <AdminPanel />
        ) : (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Записей за месяц</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">1,234</span>
                <Icon name="FileText" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Магазинов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">45</span>
                <Icon name="Store" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя цена</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">78₽</span>
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Превышений</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-destructive">12</span>
                <Icon name="AlertTriangle" size={24} className="text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="input" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="input" className="gap-2">
              <Icon name="PenSquare" size={16} />
              Ввод данных
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
              <Icon name="Map" size={16} />
              Карта цен
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Добавить цену</CardTitle>
                <CardDescription>Внесите данные о цене товара в магазине</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">Населённый пункт *</Label>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Выберите населённый пункт" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDistricts.map((district) => (
                          <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store">Магазин *</Label>
                    <Select 
                      value={selectedStore} 
                      onValueChange={setSelectedStore}
                      disabled={!selectedDistrict}
                    >
                      <SelectTrigger id="store">
                        <SelectValue placeholder={selectedDistrict ? "Выберите магазин" : "Сначала выберите населённый пункт"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStores.map((store) => (
                          <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Товар *</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            <div className="flex items-center gap-2">
                              {product.name}
                              {product.photoRequired && (
                                <Icon name="Camera" size={14} className="text-primary" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({product.minPrice}–{product.maxPrice}₽)
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Input
                      id="comment"
                      placeholder="Добавьте комментарий (обязателен при превышении лимита цен)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="photo">
                      Фотофиксация
                      {mockProducts.find(p => p.name === selectedProduct)?.photoRequired && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    {mockProducts.find(p => p.name === selectedProduct)?.photoRequired && (
                      <Alert className="mb-2">
                        <Icon name="Camera" size={16} />
                        <AlertDescription>
                          Для данного товара обязательна загрузка фотографии ценника
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="flex-1"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      />
                      {photoFile && (
                        <Badge variant="secondary" className="gap-1">
                          <Icon name="Check" size={14} />
                          Загружено
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setSelectedDistrict('');
                    setSelectedStore('');
                    setSelectedProduct('');
                    setPrice('');
                    setComment('');
                    setPhotoFile(null);
                    setAvailableStores([]);
                  }}>
                    Очистить
                  </Button>
                  <Button onClick={handleSubmitPrice} className="gap-2">
                    <Icon name="Save" size={16} />
                    Сохранить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>История записей</CardTitle>
                <CardDescription>Последние внесенные данные о ценах</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Магазин</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Фото</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.store}</TableCell>
                        <TableCell>{record.product}</TableCell>
                        <TableCell className="font-semibold">{record.price}₽</TableCell>
                        <TableCell>
                          {record.status === 'normal' ? (
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Check" size={14} />
                              Норма
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <Icon name="AlertTriangle" size={14} />
                              Превышение
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.photo ? (
                            <Icon name="Image" size={18} className="text-green-600" />
                          ) : (
                            <Icon name="ImageOff" size={18} className="text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Тепловая карта цен</CardTitle>
                <CardDescription>Распределение средних цен по магазинам и районам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockHeatmapData.map((item) => (
                    <Card key={item.store} className={`border-2 ${getHeatColor(item.priceIndex)}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.store}</CardTitle>
                          <Badge variant="outline">{item.district}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Средняя цена</p>
                            <p className="text-3xl font-bold">{item.avgPrice}₽</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Индекс</p>
                            <p className="text-2xl font-semibold">{item.priceIndex.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика цен</CardTitle>
                <CardDescription>Статистика и тренды изменения цен</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Динамика средней цены</h3>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>График динамики цен</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Самый дорогой магазин</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold">Перекрёсток</p>
                        <p className="text-sm text-muted-foreground">Средняя цена: 88₽</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Самый дешёвый магазин</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold">Магнит</p>
                        <p className="text-sm text-muted-foreground">Средняя цена: 75₽</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Разница цен</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-primary">13₽</p>
                        <p className="text-sm text-muted-foreground">17.3% отклонение</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
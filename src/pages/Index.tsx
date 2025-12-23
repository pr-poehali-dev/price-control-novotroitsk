import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const mockStores = ['Магнит', 'Пятёрочка', 'Лента', 'Перекрёсток'];
const mockCategories = ['Молочные продукты', 'Хлеб и выпечка', 'Мясо и птица', 'Овощи и фрукты'];
const mockProducts = [
  { id: 1, name: 'Молоко 3.2%', category: 'Молочные продукты', minPrice: 65, maxPrice: 85 },
  { id: 2, name: 'Хлеб белый', category: 'Хлеб и выпечка', minPrice: 35, maxPrice: 50 },
  { id: 3, name: 'Куриная грудка', category: 'Мясо и птица', minPrice: 280, maxPrice: 350 },
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
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmitPrice = () => {
    if (!selectedStore || !selectedProduct || !price) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const product = mockProducts.find(p => p.name === selectedProduct);
    const priceNum = parseFloat(price);

    if (product && (priceNum < product.minPrice || priceNum > product.maxPrice)) {
      toast({
        title: '⚠️ Предупреждение',
        description: `Цена выходит за допустимые пределы (${product.minPrice}–${product.maxPrice} ₽)`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Успешно',
        description: 'Данные о цене сохранены',
      });
      setSelectedStore('');
      setSelectedProduct('');
      setPrice('');
      setPhotoFile(null);
    }
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
            <Button variant="ghost" size="icon">
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
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
                    <Label htmlFor="store">Магазин *</Label>
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger id="store">
                        <SelectValue placeholder="Выберите магазин" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStores.map((store) => (
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
                            {product.name}
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
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Фотофиксация</Label>
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
                    setSelectedStore('');
                    setSelectedProduct('');
                    setPrice('');
                    setPhotoFile(null);
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
      </main>
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const mockDistricts = ['Новотроицкое (центр)', 'Северный район', 'Западный район', 'Южный район'];
const mockStores = ['Магнит', 'Пятёрочка', 'Перекрёсток', 'Лента', 'Дикси', 'Монетка', 'Верный'];

const mockPriceData = [
  { id: 1, date: '2024-01-15', store: 'Магнит', district: 'Новотроицкое (центр)', product: 'Молоко 3.2%', price: 72, status: 'normal' },
  { id: 2, date: '2024-01-15', store: 'Пятёрочка', district: 'Северный район', product: 'Хлеб белый', price: 45, status: 'normal' },
  { id: 3, date: '2024-01-14', store: 'Лента', district: 'Западный район', product: 'Куриная грудка', price: 310, status: 'normal' },
  { id: 4, date: '2024-01-14', store: 'Магнит', district: 'Новотроицкое (центр)', product: 'Яйца куриные', price: 95, status: 'normal' },
  { id: 5, date: '2024-01-13', store: 'Перекрёсток', district: 'Южный район', product: 'Молоко 3.2%', price: 78, status: 'normal' },
];

const mockStoreStats = [
  { store: 'Магнит', district: 'Центральный', avgPrice: 75, priceIndex: 0.95 },
  { store: 'Пятёрочка', district: 'Северный', avgPrice: 82, priceIndex: 1.05 },
  { store: 'Лента', district: 'Западный', avgPrice: 78, priceIndex: 0.98 },
  { store: 'Перекрёсток', district: 'Южный', avgPrice: 88, priceIndex: 1.12 },
];

const Home = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [searchProduct, setSearchProduct] = useState('');

  const filteredData = mockPriceData.filter((item) => {
    if (selectedDistrict && item.district !== selectedDistrict) return false;
    if (selectedStore && item.store !== selectedStore) return false;
    if (searchProduct && !item.product.toLowerCase().includes(searchProduct.toLowerCase())) return false;
    return true;
  });

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
            <h1 className="text-2xl font-bold">Цена-Контроль Новотроицкое</h1>
          </div>
          <Link to="/login">
            <Button className="gap-2">
              <Icon name="LogIn" size={16} />
              Вход для сотрудников
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Мониторинг цен в магазинах</h2>
          <p className="text-muted-foreground">Актуальная информация о ценах на продукты питания в Новотроицком муниципальном округе</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего записей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">1,234</span>
                <Icon name="FileText" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя цена корзины</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">78₽</span>
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Обновлено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Сегодня</span>
                <Icon name="Calendar" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prices" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prices" className="gap-2">
              <Icon name="ListFilter" size={16} />
              Актуальные цены
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Сравнение магазинов
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Фильтр цен</CardTitle>
                <CardDescription>Найдите актуальные цены на продукты в магазинах вашего района</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Населённый пункт</label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все районы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Все районы</SelectItem>
                        {mockDistricts.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Магазин</label>
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все магазины" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Все магазины</SelectItem>
                        {mockStores.map((store) => (
                          <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Поиск товара</label>
                    <Input
                      placeholder="Введите название..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Магазин</TableHead>
                      <TableHead>Район</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Цена</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-muted-foreground">{record.date}</TableCell>
                          <TableCell className="font-medium">{record.store}</TableCell>
                          <TableCell className="text-muted-foreground">{record.district}</TableCell>
                          <TableCell>{record.product}</TableCell>
                          <TableCell className="font-bold">{record.price}₽</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Нет данных по выбранным фильтрам
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Сравнение средних цен по магазинам</CardTitle>
                <CardDescription>Индекс цен относительно среднего уровня по округу</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockStoreStats.map((item) => (
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

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-muted-foreground mt-0.5" />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Индекс цен:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• <span className="text-green-700">Менее 0.95</span> — цены ниже среднего</li>
                        <li>• <span className="text-yellow-700">0.95-1.05</span> — цены на среднем уровне</li>
                        <li>• <span className="text-red-700">Более 1.05</span> — цены выше среднего</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>О проекте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Система мониторинга цен «Цена-Контроль» создана для информирования жителей Новотроицкого муниципального округа об актуальных ценах на продукты питания в местных магазинах.
            </p>
            <p>
              Данные собираются ежедневно специалистами и проходят проверку на достоверность. Это позволяет жителям сравнивать цены и делать осознанный выбор при покупке продуктов.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Icon name="Phone" size={16} />
              <span className="text-sm">По вопросам работы системы: +7 (XXX) XXX-XX-XX</span>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Новотроицкое МО. Система мониторинга цен.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

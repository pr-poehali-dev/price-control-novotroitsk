import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { dataStore } from '@/lib/store';

const Home = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchProduct, setSearchProduct] = useState('');
  
  const [pageContent, setPageContent] = useState(dataStore.getPageContent());
  const [systemConfig, setSystemConfig] = useState(dataStore.getSystemConfig());
  const [districts, setDistricts] = useState(dataStore.getDistricts());
  const [stores, setStores] = useState(dataStore.getStores());
  const [products, setProducts] = useState(dataStore.getProducts());
  const [priceRecords, setPriceRecords] = useState(dataStore.getPriceRecords());

  useEffect(() => {
    const updateData = () => {
      setPageContent(dataStore.getPageContent());
      setSystemConfig(dataStore.getSystemConfig());
      setDistricts(dataStore.getDistricts());
      setStores(dataStore.getStores());
      setProducts(dataStore.getProducts());
      setPriceRecords(dataStore.getPriceRecords());
    };

    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const enrichedPriceData = useMemo(() => {
    return priceRecords.map(record => {
      const store = stores.find(s => s.id === record.storeId);
      const product = products.find(p => p.id === record.productId);
      return {
        ...record,
        storeName: store?.name || 'Неизвестно',
        district: store?.district || 'Неизвестно',
        productName: product?.name || 'Неизвестно',
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [priceRecords, stores, products]);

  const filteredData = useMemo(() => {
    return enrichedPriceData.filter((item) => {
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) return false;
      if (selectedStore !== 'all' && item.storeName !== selectedStore) return false;
      if (searchProduct && !item.productName.toLowerCase().includes(searchProduct.toLowerCase())) return false;
      return true;
    });
  }, [enrichedPriceData, selectedDistrict, selectedStore, searchProduct]);

  const storeStats = useMemo(() => {
    const storeGroups = enrichedPriceData.reduce((acc, record) => {
      const key = `${record.storeName}-${record.district}`;
      if (!acc[key]) {
        acc[key] = { storeName: record.storeName, district: record.district, prices: [] };
      }
      acc[key].prices.push(record.price);
      return acc;
    }, {} as Record<string, { storeName: string; district: string; prices: number[] }>);

    const avgPrices = Object.values(storeGroups).map(group => {
      const avg = group.prices.reduce((sum, p) => sum + p, 0) / group.prices.length;
      return { store: group.storeName, district: group.district, avgPrice: Math.round(avg) };
    });

    const overallAvg = avgPrices.reduce((sum, s) => sum + s.avgPrice, 0) / avgPrices.length || 1;

    return avgPrices.map(stat => ({
      ...stat,
      priceIndex: stat.avgPrice / overallAvg,
    })).slice(0, 4);
  }, [enrichedPriceData]);

  const uniqueStoreNames = useMemo(() => {
    return Array.from(new Set(stores.map(s => s.name))).sort();
  }, [stores]);

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
            <Icon name={systemConfig.logoIcon as any} size={28} style={{ color: systemConfig.primaryColor }} />
            <h1 className="text-2xl font-bold">{systemConfig.appName}</h1>
          </div>
          <Link to="/login">
            <Button className="gap-2" style={{ backgroundColor: systemConfig.primaryColor }}>
              <Icon name="LogIn" size={16} />
              {pageContent.homeButtonText}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">{pageContent.homeTitle}</h2>
          <p className="text-muted-foreground">{pageContent.homeSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего записей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{priceRecords.length}</span>
                <Icon name="FileText" size={24} style={{ color: systemConfig.primaryColor }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Магазинов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stores.length}</span>
                <Icon name="Store" size={24} style={{ color: systemConfig.primaryColor }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{products.length}</span>
                <Icon name="Package" size={24} style={{ color: systemConfig.primaryColor }} />
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
                <Icon name="Calendar" size={24} style={{ color: systemConfig.primaryColor }} />
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
                        <SelectItem value="all">Все районы</SelectItem>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
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
                        <SelectItem value="all">Все магазины</SelectItem>
                        {uniqueStoreNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
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

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead>Магазин</TableHead>
                        <TableHead>Населённый пункт</TableHead>
                        <TableHead className="text-right">Цена</TableHead>
                        <TableHead className="text-right">Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Нет данных для отображения
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.slice(0, 50).map((item, index) => (
                          <TableRow key={`${item.id}-${index}`}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.storeName}</TableCell>
                            <TableCell>{item.district}</TableCell>
                            <TableCell className="text-right font-semibold">{item.price} ₽</TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredData.length > 50 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Показано 50 из {filteredData.length} записей
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Рейтинг магазинов</CardTitle>
                <CardDescription>Сравнение средних цен между магазинами</CardDescription>
              </CardHeader>
              <CardContent>
                {storeStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Недостаточно данных для сравнения</p>
                ) : (
                  <div className="space-y-4">
                    {storeStats.map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold" style={{ color: systemConfig.primaryColor }}>
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{stat.store}</h3>
                          <p className="text-sm text-muted-foreground">{stat.district}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{stat.avgPrice} ₽</p>
                          <Badge className={getHeatColor(stat.priceIndex)}>
                            {stat.priceIndex < 1 ? '↓' : stat.priceIndex > 1 ? '↑' : '='} 
                            {Math.abs((stat.priceIndex - 1) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;
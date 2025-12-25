import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/store';

const AdvancedReports = () => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<'period' | 'dynamics' | 'comparison' | 'anomalies'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');

  const products = dataStore.getProducts();
  const stores = dataStore.getStores();
  const records = dataStore.getPriceRecords();
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Получить название периода
  const getPeriodLabel = () => {
    const periods: Record<string, string> = {
      'today': 'За сегодня',
      'week': 'За неделю',
      'month': 'За месяц',
      'quarter': 'За квартал',
      'year': 'За год',
      'custom': `с ${startDate} по ${endDate}`
    };
    return periods[selectedPeriod] || 'За выбранный период';
  };

  // Рассчёт статистики за период
  const calculatePeriodStats = () => {
    let filteredRecords = [...records];
    
    // Фильтр по магазину
    if (selectedStore !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.storeId === selectedStore);
    }
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      const categoryProducts = products.filter(p => p.category === selectedCategory).map(p => p.id);
      filteredRecords = filteredRecords.filter(r => categoryProducts.includes(r.productId));
    }
    
    if (filteredRecords.length === 0) {
      return {
        totalRecords: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceChange: 0,
        storesCount: 0,
        productsCount: 0
      };
    }

    const stats = {
      totalRecords: filteredRecords.length,
      avgPrice: filteredRecords.reduce((sum, r) => sum + r.price, 0) / filteredRecords.length,
      minPrice: Math.min(...filteredRecords.map(r => r.price)),
      maxPrice: Math.max(...filteredRecords.map(r => r.price)),
      priceChange: 5.2,
      storesCount: new Set(filteredRecords.map(r => r.storeId)).size,
      productsCount: new Set(filteredRecords.map(r => r.productId)).size
    };
    return stats;
  };

  // Динамика цен по товару
  const calculateDynamics = () => {
    let filteredRecords = [...records];
    
    // Фильтр по магазину
    if (selectedStore !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.storeId === selectedStore);
    }
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      const categoryProducts = products.filter(p => p.category === selectedCategory).map(p => p.id);
      filteredRecords = filteredRecords.filter(r => categoryProducts.includes(r.productId));
    }
    
    // Фильтр по товару
    if (selectedProduct !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.productId === selectedProduct);
    }
    
    // Группируем по датам
    const byDate: Record<string, number[]> = {};
    filteredRecords.forEach(record => {
      const dateKey = new Date(record.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(record.price);
    });
    
    // Рассчитываем статистику по датам
    const dynamics = Object.entries(byDate)
      .map(([date, prices]) => ({
        date,
        avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('.').map(Number);
        const [dayB, monthB] = b.date.split('.').map(Number);
        return monthA - monthB || dayA - dayB;
      })
      .slice(-10);
    
    return dynamics;
  };

  // Сравнение цен по магазинам
  const calculateComparison = () => {
    let filteredRecords = [...records];
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      const categoryProducts = products.filter(p => p.category === selectedCategory).map(p => p.id);
      filteredRecords = filteredRecords.filter(r => categoryProducts.includes(r.productId));
    }

    const comparison = stores.map(store => {
      const storeRecords = filteredRecords.filter(r => r.storeId === store.id);
      const avgPrice = storeRecords.length > 0 
        ? storeRecords.reduce((sum, r) => sum + r.price, 0) / storeRecords.length 
        : 0;
      
      // Рассчитываем индекс относительно средней цены по всем магазинам
      const overallAvg = filteredRecords.length > 0
        ? filteredRecords.reduce((sum, r) => sum + r.price, 0) / filteredRecords.length
        : 0;
      const priceIndexNum = overallAvg > 0 ? ((avgPrice - overallAvg) / overallAvg * 100) : 0;
      const priceIndex = priceIndexNum > 0 
        ? `+${priceIndexNum.toFixed(1)}%` 
        : `${priceIndexNum.toFixed(1)}%`;
      
      return {
        store: store.name,
        district: store.district,
        avgPrice,
        recordsCount: storeRecords.length,
        priceIndex
      };
    }).filter(c => c.recordsCount > 0).slice(0, 10);
    
    return comparison;
  };

  // Аномалии цен
  const detectAnomalies = () => {
    let filteredRecords = [...records];
    
    // Фильтр по магазину
    if (selectedStore !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.storeId === selectedStore);
    }
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      const categoryProducts = products.filter(p => p.category === selectedCategory).map(p => p.id);
      filteredRecords = filteredRecords.filter(r => categoryProducts.includes(r.productId));
    }

    const anomalies = filteredRecords
      .map(record => {
        const product = products.find(p => p.id === record.productId);
        const store = stores.find(s => s.id === record.storeId);
        
        if (!product || !store) return null;
        
        // Проверяем выход за пределы диапазона
        if (record.price < product.minPrice || record.price > product.maxPrice) {
          const deviation = record.price < product.minPrice
            ? -((product.minPrice - record.price) / product.minPrice * 100)
            : ((record.price - product.maxPrice) / product.maxPrice * 100);
          
          return {
            product: product.name,
            store: store.name,
            price: record.price,
            expectedRange: `${product.minPrice}-${product.maxPrice}₽`,
            deviation: `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%`,
            date: new Date(record.date).toLocaleDateString('ru-RU')
          };
        }
        return null;
      })
      .filter(a => a !== null)
      .slice(0, 10);
    
    return anomalies;
  };

  const stats = calculatePeriodStats();
  const dynamics = calculateDynamics();
  const comparison = calculateComparison();
  const anomalies = detectAnomalies();

  const handleExport = (format: string) => {
    let csvContent = '';
    let reportName = '';
    
    if (selectedReport === 'period') {
      reportName = `Статистика_${getPeriodLabel()}`;
      csvContent = `Статистика за период\n\n`;
      csvContent += `Всего записей,${stats.totalRecords}\n`;
      csvContent += `Средняя цена,${stats.avgPrice.toFixed(2)} ₽\n`;
      csvContent += `Минимальная цена,${stats.minPrice.toFixed(2)} ₽\n`;
      csvContent += `Максимальная цена,${stats.maxPrice.toFixed(2)} ₽\n`;
      csvContent += `Магазинов,${stats.storesCount}\n`;
      csvContent += `Товаров,${stats.productsCount}\n`;
    } else if (selectedReport === 'comparison') {
      reportName = `Сравнение_магазинов_${getPeriodLabel()}`;
      csvContent = `Магазин,Район,Средняя цена,Записей,Индекс цен\n`;
      comparison.forEach(c => {
        csvContent += `${c.store},${c.district},${c.avgPrice.toFixed(2)} ₽,${c.recordsCount},${c.priceIndex}\n`;
      });
    } else if (selectedReport === 'anomalies') {
      reportName = `Аномалии_цен_${getPeriodLabel()}`;
      csvContent = `Товар,Магазин,Цена,Ожидаемый диапазон,Отклонение,Дата\n`;
      anomalies.forEach(a => {
        csvContent += `${a.product},${a.store},${a.price} ₽,${a.expectedRange},${a.deviation},${a.date}\n`;
      });
    } else if (selectedReport === 'dynamics') {
      reportName = `Динамика_цен_${getPeriodLabel()}`;
      csvContent = `Дата,Средняя цена,Мин. цена,Макс. цена\n`;
      dynamics.forEach(d => {
        csvContent += `${d.date},${d.avgPrice} ₽,${d.minPrice} ₽,${d.maxPrice} ₽\n`;
      });
    }
    
    // Создаём файл и скачиваем
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ 
      title: 'Отчёт скачан', 
      description: `Файл "${reportName}.csv" сохранён` 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Расширенная аналитика</h3>
          <p className="text-sm text-muted-foreground">Подробные отчёты и анализ данных · {getPeriodLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport('CSV')}>
            <Icon name="Download" size={16} />
            Скачать отчёт
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="period-select">Период анализа</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger id="period-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                  <SelectItem value="custom">Произвольный период</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="store-select">Магазин</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger id="store-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все магазины</SelectItem>
                  {stores.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="category-select">Категория</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="start-date">Начало</Label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label htmlFor="end-date">Конец</Label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </>
            )}

            <Button className="gap-2">
              <Icon name="RefreshCw" size={16} />
              Применить
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={selectedReport === 'period' ? 'default' : 'outline'}
          onClick={() => setSelectedReport('period')}
          className="gap-2"
        >
          <Icon name="Calendar" size={16} />
          За период
        </Button>
        <Button
          variant={selectedReport === 'dynamics' ? 'default' : 'outline'}
          onClick={() => setSelectedReport('dynamics')}
          className="gap-2"
        >
          <Icon name="TrendingUp" size={16} />
          Динамика
        </Button>
        <Button
          variant={selectedReport === 'comparison' ? 'default' : 'outline'}
          onClick={() => setSelectedReport('comparison')}
          className="gap-2"
        >
          <Icon name="BarChart3" size={16} />
          Сравнение
        </Button>
        <Button
          variant={selectedReport === 'anomalies' ? 'default' : 'outline'}
          onClick={() => setSelectedReport('anomalies')}
          className="gap-2"
        >
          <Icon name="AlertTriangle" size={16} />
          Аномалии
        </Button>
      </div>

      {selectedReport === 'period' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Отчёт за период</CardTitle>
              <CardDescription>Общая статистика по ценам {getPeriodLabel().toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Всего записей</p>
                  <p className="text-2xl font-bold">{stats.totalRecords}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Средняя цена</p>
                  <p className="text-2xl font-bold">{stats.avgPrice.toFixed(2)}₽</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Изменение</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.priceChange}%</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Магазинов</p>
                  <p className="text-2xl font-bold">{stats.storesCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Диапазон цен за период</h4>
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div>
                    <p className="text-sm text-muted-foreground">Минимум</p>
                    <p className="text-xl font-bold">{stats.minPrice}₽</p>
                  </div>
                  <div className="flex-1 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Максимум</p>
                    <p className="text-xl font-bold">{stats.maxPrice}₽</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedReport === 'dynamics' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Динамика цен</CardTitle>
                <CardDescription>Изменение цен {getPeriodLabel().toLowerCase()}</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Label>Товар:</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все товары</SelectItem>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dynamics.length > 0 ? (
              <>
                <div className="mb-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dynamics}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${value}₽`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}₽`, '']}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="maxPrice" 
                        stroke="hsl(var(--destructive))" 
                        fill="transparent"
                        strokeWidth={2}
                        name="Максимум"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgPrice" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#colorAvg)"
                        strokeWidth={3}
                        name="Средняя цена"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minPrice" 
                        stroke="hsl(var(--chart-2))" 
                        fill="transparent"
                        strokeWidth={2}
                        name="Минимум"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Средняя цена</TableHead>
                      <TableHead>Минимум</TableHead>
                      <TableHead>Максимум</TableHead>
                      <TableHead>Изменение</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {dynamics.map((d, i) => (
                    <TableRow key={d.date}>
                      <TableCell className="font-medium">{d.date}</TableCell>
                      <TableCell>{d.avgPrice.toFixed(2)}₽</TableCell>
                      <TableCell className="text-green-600">{d.minPrice.toFixed(2)}₽</TableCell>
                      <TableCell className="text-red-600">{d.maxPrice.toFixed(2)}₽</TableCell>
                      <TableCell>
                        {i > 0 && (
                          <Badge variant={d.avgPrice > dynamics[i - 1].avgPrice ? 'destructive' : 'default'}>
                            {d.avgPrice > dynamics[i - 1].avgPrice ? '↑' : '↓'} 
                            {Math.abs(d.avgPrice - dynamics[i - 1].avgPrice).toFixed(2)}₽
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">Нет данных для отображения. Измените фильтры.</p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === 'comparison' && (
        <Card>
          <CardHeader>
            <CardTitle>Сравнение цен по магазинам</CardTitle>
            <CardDescription>Средние цены в разных торговых сетях {getPeriodLabel().toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            {comparison.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Магазин</TableHead>
                    <TableHead>Район</TableHead>
                    <TableHead>Средняя цена</TableHead>
                    <TableHead>Записей</TableHead>
                    <TableHead>Индекс изменения</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.map((c) => (
                    <TableRow key={c.store}>
                      <TableCell className="font-medium">{c.store}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.district}</Badge>
                      </TableCell>
                      <TableCell>{c.avgPrice.toFixed(2)}₽</TableCell>
                      <TableCell>{c.recordsCount}</TableCell>
                      <TableCell>
                        <Badge variant={c.priceIndex.startsWith('+') ? 'destructive' : 'default'}>
                          {c.priceIndex}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Нет данных для сравнения. Измените фильтры.</p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === 'anomalies' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-orange-500" />
              Обнаруженные аномалии цен
            </CardTitle>
            <CardDescription>Цены, выходящие за пределы ожидаемого диапазона {getPeriodLabel().toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            {anomalies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Магазин</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Ожидаемый диапазон</TableHead>
                    <TableHead>Отклонение</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.product}</TableCell>
                      <TableCell>{a.store}</TableCell>
                      <TableCell className="font-bold text-orange-600">{a.price}₽</TableCell>
                      <TableCell className="text-muted-foreground">{a.expectedRange}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{a.deviation}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Icon name="CheckCircle2" size={48} className="mx-auto text-green-500 mb-2" />
                <p className="text-lg font-semibold">Аномалии не обнаружены</p>
                <p className="text-sm text-muted-foreground">Все цены находятся в ожидаемом диапазоне</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedReports;
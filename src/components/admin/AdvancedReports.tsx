import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/store';

const AdvancedReports = () => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<'period' | 'dynamics' | 'comparison' | 'anomalies'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');

  const products = dataStore.getProducts();
  const stores = dataStore.getStores();
  const records = dataStore.getPriceRecords();

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
    const stats = {
      totalRecords: records.length,
      avgPrice: records.reduce((sum, r) => sum + r.price, 0) / records.length || 0,
      minPrice: Math.min(...records.map(r => r.price)),
      maxPrice: Math.max(...records.map(r => r.price)),
      priceChange: 5.2, // В процентах (пример)
      storesCount: new Set(records.map(r => r.storeId)).size,
      productsCount: new Set(records.map(r => r.productId)).size
    };
    return stats;
  };

  // Динамика цен по товару
  const calculateDynamics = () => {
    const dynamics = [
      { date: '15.01', avgPrice: 72, minPrice: 68, maxPrice: 78 },
      { date: '16.01', avgPrice: 74, minPrice: 70, maxPrice: 79 },
      { date: '17.01', avgPrice: 73, minPrice: 69, maxPrice: 77 },
      { date: '18.01', avgPrice: 75, minPrice: 71, maxPrice: 80 },
      { date: '19.01', avgPrice: 76, minPrice: 72, maxPrice: 82 },
    ];
    return dynamics;
  };

  // Сравнение цен по магазинам
  const calculateComparison = () => {
    const comparison = stores.slice(0, 5).map(store => {
      const storeRecords = records.filter(r => r.storeId === store.id);
      return {
        store: store.name,
        district: store.district,
        avgPrice: storeRecords.reduce((sum, r) => sum + r.price, 0) / storeRecords.length || 0,
        recordsCount: storeRecords.length,
        priceIndex: Math.random() > 0.5 ? '+3.2%' : '-1.5%'
      };
    });
    return comparison;
  };

  // Аномалии цен
  const detectAnomalies = () => {
    const anomalies = [
      { product: 'Молоко 3.2%', store: 'Магнит', price: 95, expectedRange: '65-85₽', deviation: '+11.8%', date: '18.01.2024' },
      { product: 'Хлеб белый', store: 'Пятёрочка', price: 28, expectedRange: '35-50₽', deviation: '-20%', date: '17.01.2024' },
      { product: 'Куриная грудка', store: 'Лента', price: 380, expectedRange: '280-350₽', deviation: '+8.6%', date: '16.01.2024' },
    ];
    return anomalies;
  };

  const stats = calculatePeriodStats();
  const dynamics = calculateDynamics();
  const comparison = calculateComparison();
  const anomalies = detectAnomalies();

  const handleExport = (format: string) => {
    toast({ title: 'Экспорт', description: `Отчёт "${selectedReport}" экспортируется в ${format}` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Расширенная аналитика</h3>
          <p className="text-sm text-muted-foreground">Подробные отчёты и анализ данных · {getPeriodLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport('Excel')}>
            <Icon name="FileSpreadsheet" size={16} />
            Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport('PDF')}>
            <Icon name="FileText" size={16} />
            PDF
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
                    <TableCell>{d.avgPrice}₽</TableCell>
                    <TableCell>{d.minPrice}₽</TableCell>
                    <TableCell>{d.maxPrice}₽</TableCell>
                    <TableCell>
                      {i > 0 && (
                        <Badge variant={d.avgPrice > dynamics[i - 1].avgPrice ? 'destructive' : 'default'}>
                          {d.avgPrice > dynamics[i - 1].avgPrice ? '↑' : '↓'} 
                          {Math.abs(d.avgPrice - dynamics[i - 1].avgPrice)}₽
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedReports;
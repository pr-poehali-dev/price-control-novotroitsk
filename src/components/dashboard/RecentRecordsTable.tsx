import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { dataStore } from '@/lib/store';

export const RecentRecordsTable = () => {
  const records = dataStore.getPriceRecords();
  const stores = dataStore.getStores();
  const products = dataStore.getProducts();
  
  const recentRecords = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? `${store.name} (${store.district})` : 'Неизвестный магазин';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Неизвестный товар';
  };

  const getPriceStatus = (price: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'normal';
    
    if (price < product.minPrice || price > product.maxPrice) {
      return 'warning';
    }
    return 'normal';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>История записей</CardTitle>
        <CardDescription>Последние 10 внесённых записей о ценах</CardDescription>
      </CardHeader>
      <CardContent>
        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-20" />
            <p>Записей пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {recentRecords.map((record) => {
                  const status = getPriceStatus(record.price, record.productId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>{getStoreName(record.storeId)}</TableCell>
                      <TableCell>{getProductName(record.productId)}</TableCell>
                      <TableCell className="font-medium">{record.price}₽</TableCell>
                      <TableCell>
                        {status === 'normal' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Icon name="CheckCircle2" size={12} />
                            Норма
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <Icon name="AlertTriangle" size={12} />
                            Отклонение
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.hasPhoto ? (
                          <Icon name="Image" size={16} className="text-green-600" />
                        ) : (
                          <Icon name="ImageOff" size={16} className="text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

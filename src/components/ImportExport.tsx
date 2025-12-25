import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { dataStore } from '@/lib/store';

const ImportExport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = (type: 'products' | 'stores' | 'prices') => {
    let data: any[] = [];
    let filename = '';

    if (type === 'products') {
      data = [
        { 'Название': 'Молоко 3.2%', 'Категория': 'Молочные продукты', 'Мин. цена': 65, 'Макс. цена': 85, 'Фото обязательно': 'Нет' },
        { 'Название': 'Хлеб белый', 'Категория': 'Хлеб и выпечка', 'Мин. цена': 35, 'Макс. цена': 50, 'Фото обязательно': 'Да' },
        { 'Название': 'Куриная грудка', 'Категория': 'Мясо и птица', 'Мин. цена': 280, 'Макс. цена': 350, 'Фото обязательно': 'Нет' }
      ];
      filename = 'Шаблон_Товары.xlsx';
    } else if (type === 'stores') {
      data = [
        { 'Название': 'Магнит', 'Населённый пункт': 'Новотроицкое', 'Адрес': 'ул. Ленина, 10' },
        { 'Название': 'Пятёрочка', 'Населённый пункт': 'Новотроицкое', 'Адрес': 'ул. Советская, 25' },
        { 'Название': 'Лента', 'Населённый пункт': 'Северный район', 'Адрес': 'пр. Мира, 5' }
      ];
      filename = 'Шаблон_Магазины.xlsx';
    } else if (type === 'prices') {
      data = [
        { 'Товар': 'Молоко 3.2%', 'Магазин': 'Магнит', 'Цена': 72, 'Комментарий': '' },
        { 'Товар': 'Хлеб белый', 'Магазин': 'Пятёрочка', 'Цена': 42, 'Комментарий': '' },
        { 'Товар': 'Куриная грудка', 'Магазин': 'Лента', 'Цена': 310, 'Комментарий': 'Акция' }
      ];
      filename = 'Шаблон_Цены.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    
    ws['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];

    XLSX.writeFile(wb, filename);

    toast({
      title: 'Шаблон скачан',
      description: `Файл ${filename} готов к заполнению`,
    });
  };

  const handleExport = (format: 'excel' | 'csv') => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const records = dataStore.getPriceRecords();
      const stores = dataStore.getStores();
      const products = dataStore.getProducts();

      const exportData = records.map(record => {
        const store = stores.find(s => s.id === record.storeId);
        const product = products.find(p => p.id === record.productId);
        
        return {
          'Дата': record.date,
          'Магазин': store?.name || 'Неизвестно',
          'Населённый пункт': store?.district || '',
          'Товар': product?.name || 'Неизвестно',
          'Цена': record.price,
          'Комментарий': record.comment || '',
          'Оператор ID': record.operatorId
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Цены');

      ws['!cols'] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 10 },
        { wch: 30 },
        { wch: 12 }
      ];

      const date = new Date().toISOString().split('T')[0];
      const filename = `Экспорт_${date}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      if (format === 'excel') {
        XLSX.writeFile(wb, filename);
      } else {
        XLSX.writeFile(wb, filename, { bookType: 'csv' });
      }

      toast({
        title: 'Экспорт завершён',
        description: `Скачано ${exportData.length} записей в файл ${filename}`,
      });
      
      setIsProcessing(false);
    }, 500);
  };

  const handleImport = (type: 'products' | 'stores' | 'prices') => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-type', type);
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = fileInputRef.current?.getAttribute('data-type') as 'products' | 'stores' | 'prices';
    
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

        let successCount = 0;

        if (type === 'products') {
          jsonData.forEach((row) => {
            if (row['Название'] && row['Категория']) {
              dataStore.addProduct({
                name: row['Название'],
                category: row['Категория'],
                minPrice: parseFloat(row['Мин. цена']) || 0,
                maxPrice: parseFloat(row['Макс. цена']) || 0,
                photoRequired: row['Фото обязательно']?.toLowerCase() === 'да'
              });
              successCount++;
            }
          });
        } else if (type === 'stores') {
          jsonData.forEach((row) => {
            if (row['Название'] && row['Населённый пункт']) {
              dataStore.addStore({
                name: row['Название'],
                district: row['Населённый пункт'],
                address: row['Адрес'] || undefined
              });
              successCount++;
            }
          });
        } else if (type === 'prices') {
          const products = dataStore.getProducts();
          const stores = dataStore.getStores();
          const userId = localStorage.getItem('userId') || '1';

          jsonData.forEach((row) => {
            const product = products.find(p => p.name === row['Товар']);
            const store = stores.find(s => s.name === row['Магазин']);

            if (product && store && row['Цена']) {
              dataStore.addPriceRecord({
                date: new Date().toISOString().split('T')[0],
                storeId: store.id,
                productId: product.id,
                price: parseFloat(row['Цена']),
                comment: row['Комментарий'] || undefined,
                operatorId: userId
              });
              successCount++;
            }
          });
        }

        const typeNames: Record<string, string> = {
          products: 'товаров',
          stores: 'магазинов',
          prices: 'записей о ценах'
        };

        toast({
          title: 'Импорт завершён',
          description: `Успешно импортировано ${successCount} ${typeNames[type]}`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось прочитать файл. Проверьте формат данных.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBackup = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const allData = {
        products: dataStore.getProducts(),
        stores: dataStore.getStores(),
        districts: dataStore.getDistricts(),
        records: dataStore.getPriceRecords()
      };

      const ws1 = XLSX.utils.json_to_sheet(allData.products);
      const ws2 = XLSX.utils.json_to_sheet(allData.stores);
      const ws3 = XLSX.utils.json_to_sheet(allData.districts);
      const ws4 = XLSX.utils.json_to_sheet(allData.records);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, 'Товары');
      XLSX.utils.book_append_sheet(wb, ws2, 'Магазины');
      XLSX.utils.book_append_sheet(wb, ws3, 'Населённые пункты');
      XLSX.utils.book_append_sheet(wb, ws4, 'Записи цен');

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Резервная_копия_${date}.xlsx`);

      toast({
        title: 'Резервная копия создана',
        description: 'Все данные успешно сохранены',
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} />
              Импорт данных
            </CardTitle>
            <CardDescription>Загрузите данные из Excel или CSV файлов</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                Сначала скачайте шаблон, заполните его и загрузите обратно
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Товары</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadTemplate('products')}
                  >
                    <Icon name="Download" size={14} />
                    Скачать шаблон
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 justify-start"
                  onClick={() => handleImport('products')}
                  disabled={isProcessing}
                >
                  <Icon name="Package" size={20} className="text-blue-600" />
                  Импорт товаров
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Магазины</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadTemplate('stores')}
                  >
                    <Icon name="Download" size={14} />
                    Скачать шаблон
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 justify-start"
                  onClick={() => handleImport('stores')}
                  disabled={isProcessing}
                >
                  <Icon name="Store" size={20} className="text-green-600" />
                  Импорт магазинов
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Цены</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadTemplate('prices')}
                  >
                    <Icon name="Download" size={14} />
                    Скачать шаблон
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 justify-start"
                  onClick={() => handleImport('prices')}
                  disabled={isProcessing}
                >
                  <Icon name="TrendingUp" size={20} className="text-orange-600" />
                  Импорт цен
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Требования к файлам импорта:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Первая строка — заголовки столбцов</li>
                <li>• Корректные названия и форматы данных</li>
                <li>• Используйте скачанные шаблоны</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Download" size={20} />
              Экспорт данных
            </CardTitle>
            <CardDescription>Выгрузите данные для анализа или архива</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                Экспорт включает все данные из базы
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2 justify-start"
                onClick={() => handleExport('excel')}
                disabled={isProcessing}
              >
                <Icon name="FileSpreadsheet" size={20} className="text-green-600" />
                Экспорт в Excel (.xlsx)
                <Badge variant="secondary" className="ml-auto">Рекомендуется</Badge>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 justify-start"
                onClick={() => handleExport('csv')}
                disabled={isProcessing}
              >
                <Icon name="FileText" size={20} className="text-blue-600" />
                Экспорт в CSV
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Экспорт содержит:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Все цены
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Магазины
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Товары
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Даты записей
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Database" size={20} />
            Резервное копирование
          </CardTitle>
          <CardDescription>Создайте полную резервную копию всех данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              variant="default"
              className="gap-2"
              onClick={handleBackup}
              disabled={isProcessing}
            >
              <Icon name="Save" size={16} />
              Создать резервную копию
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Включает все таблицы: товары, магазины, районы и записи цен
            </div>
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-64">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin">
                  <Icon name="Loader2" size={32} />
                </div>
                <p className="text-sm font-medium">Обработка данных...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImportExport;

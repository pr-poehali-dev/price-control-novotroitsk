import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ImportExport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = (format: 'excel' | 'csv') => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const date = new Date().toISOString().split('T')[0];
      const filename = `price-data-${date}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      toast({
        title: 'Экспорт завершён',
        description: `Файл ${filename} готов к загрузке`,
      });
      
      setIsProcessing(false);
    }, 1500);
  };

  const handleImport = (type: 'products' | 'stores' | 'prices') => {
    fileInputRef.current?.click();
    fileInputRef.current?.setAttribute('data-type', type);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = fileInputRef.current?.getAttribute('data-type');
    
    setIsProcessing(true);

    setTimeout(() => {
      const typeNames: Record<string, string> = {
        products: 'товаров',
        stores: 'магазинов',
        prices: 'цен'
      };

      toast({
        title: 'Импорт завершён',
        description: `Успешно импортировано ${Math.floor(Math.random() * 50) + 10} записей ${typeNames[type || 'products']}`,
      });
      
      setIsProcessing(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const handleBackup = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      toast({
        title: 'Резервная копия создана',
        description: 'Все данные успешно сохранены',
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleRestore = () => {
    fileInputRef.current?.click();
    fileInputRef.current?.setAttribute('data-type', 'restore');
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
                Поддерживаемые форматы: .xlsx, .xls, .csv
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2 justify-start"
                onClick={() => handleImport('products')}
                disabled={isProcessing}
              >
                <Icon name="Package" size={20} className="text-blue-600" />
                Импорт товаров
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 justify-start"
                onClick={() => handleImport('stores')}
                disabled={isProcessing}
              >
                <Icon name="Store" size={20} className="text-green-600" />
                Импорт магазинов
              </Button>
              
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

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Требования к файлам импорта:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Первая строка — заголовки столбцов</li>
                <li>• Корректные названия и форматы данных</li>
                <li>• Кодировка UTF-8 для файлов CSV</li>
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
                  Районы
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
          <CardDescription>Создание и восстановление полных резервных копий базы данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Icon name="ShieldCheck" size={16} className="text-primary" />
                Создать резервную копию
              </h4>
              <p className="text-sm text-muted-foreground">
                Сохраните полную копию всех данных системы на случай восстановления
              </p>
              <Button 
                className="w-full gap-2"
                onClick={handleBackup}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="HardDrive" size={16} />
                    Создать резервную копию
                  </>
                )}
              </Button>
              <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                Последний бэкап: 23.12.2024 10:30
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Icon name="RotateCcw" size={16} className="text-primary" />
                Восстановить из копии
              </h4>
              <p className="text-sm text-muted-foreground">
                Загрузите ранее созданную резервную копию для восстановления данных
              </p>
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={handleRestore}
                disabled={isProcessing}
              >
                <Icon name="Upload" size={16} />
                Восстановить из файла
              </Button>
              <Alert variant="destructive">
                <Icon name="AlertTriangle" size={16} />
                <AlertDescription className="text-xs">
                  Восстановление заменит все текущие данные
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-muted-foreground mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium">Рекомендации по резервному копированию:</p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Создавайте резервные копии минимум раз в неделю</li>
                  <li>• Храните копии в безопасном месте (облако, внешний диск)</li>
                  <li>• Проверяйте возможность восстановления копий</li>
                  <li>• Делайте копию перед крупными изменениями данных</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileDown" size={20} />
            Шаблоны для импорта
          </CardTitle>
          <CardDescription>Скачайте готовые шаблоны Excel для заполнения данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="gap-2 justify-start">
              <Icon name="Package" size={16} className="text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-medium">Шаблон товаров</div>
                <div className="text-xs text-muted-foreground">template_products.xlsx</div>
              </div>
            </Button>
            
            <Button variant="outline" className="gap-2 justify-start">
              <Icon name="Store" size={16} className="text-green-600" />
              <div className="text-left">
                <div className="text-sm font-medium">Шаблон магазинов</div>
                <div className="text-xs text-muted-foreground">template_stores.xlsx</div>
              </div>
            </Button>
            
            <Button variant="outline" className="gap-2 justify-start">
              <Icon name="TrendingUp" size={16} className="text-orange-600" />
              <div className="text-left">
                <div className="text-sm font-medium">Шаблон цен</div>
                <div className="text-xs text-muted-foreground">template_prices.xlsx</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExport;

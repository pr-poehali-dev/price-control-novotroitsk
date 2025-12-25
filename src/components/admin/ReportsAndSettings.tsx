import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { dataStore } from '@/lib/store';

interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

interface ReportsAndSettingsProps {
  onExport?: (format: string) => void;
}

const ReportsAndSettings = ({ onExport }: ReportsAndSettingsProps) => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('week');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    { 
      id: '1', 
      user: 'operator1', 
      action: 'Добавил цену', 
      details: 'Молоко 3.2% - 72₽ в Магнит', 
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '2', 
      user: 'admin', 
      action: 'Изменил товар', 
      details: 'Хлеб белый - обновлены ценовые пределы', 
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    { 
      id: '3', 
      user: 'operator2', 
      action: 'Добавил магазин', 
      details: 'Добавлен магазин Пятёрочка в Новотроицкое', 
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
  ]);

  const handleExportReport = (format: 'excel' | 'pdf' | 'csv') => {
    const records = dataStore.getPriceRecords();
    const stores = dataStore.getStores();
    const products = dataStore.getProducts();

    if (records.length === 0) {
      toast({
        title: 'Нет данных',
        description: 'В системе пока нет записей для экспорта',
        variant: 'destructive'
      });
      return;
    }

    const reportData = records.map(record => {
      const store = stores.find(s => s.id === record.storeId);
      const product = products.find(p => p.id === record.productId);
      
      return {
        'Дата': record.date,
        'Магазин': store?.name || 'Неизвестно',
        'Населённый пункт': store?.district || '',
        'Адрес': store?.address || '',
        'Товар': product?.name || 'Неизвестно',
        'Категория': product?.category || '',
        'Цена (₽)': record.price,
        'Мин. цена': product?.minPrice || 0,
        'Макс. цена': product?.maxPrice || 0,
        'Отклонение': product ? (record.price < product.minPrice || record.price > product.maxPrice ? 'Да' : 'Нет') : '',
        'Комментарий': record.comment || '',
        'Оператор': record.operatorId
      };
    });

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Отчёт по ценам');

      ws['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
        { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 12 }
      ];

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Отчёт_${date}.xlsx`);

      addAuditLog('Система', 'Экспорт отчёта', `Создан отчёт Excel с ${reportData.length} записями`);
      
      toast({
        title: 'Отчёт создан',
        description: `Экспортировано ${reportData.length} записей в Excel`
      });
    } else if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Отчёт_${date}.csv`, { bookType: 'csv' });

      addAuditLog('Система', 'Экспорт отчёта', `Создан отчёт CSV с ${reportData.length} записями`);

      toast({
        title: 'Отчёт создан',
        description: `Экспортировано ${reportData.length} записей в CSV`
      });
    } else if (format === 'pdf') {
      toast({
        title: 'Функция в разработке',
        description: 'Экспорт в PDF будет доступен в следующей версии'
      });
    }

    if (onExport) {
      onExport(format.toUpperCase());
    }
  };

  const handleBackup = () => {
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
    XLSX.utils.book_append_sheet(wb, ws3, 'Районы');
    XLSX.utils.book_append_sheet(wb, ws4, 'Записи цен');

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
    XLSX.writeFile(wb, `Backup_${date}_${time}.xlsx`);

    addAuditLog('Система', 'Резервное копирование', 'Создана полная резервная копия базы данных');

    toast({
      title: 'Резервная копия создана',
      description: 'Все данные успешно сохранены'
    });
  };

  const addAuditLog = (user: string, action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: Date.now().toString(),
      user,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLog([newEntry, ...auditLog]);
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(value);
        addAuditLog('Админ', 'Изменил настройку', `Email уведомления: ${value ? 'включены' : 'выключены'}`);
        break;
      case 'push':
        setPushEnabled(value);
        addAuditLog('Админ', 'Изменил настройку', `Push уведомления: ${value ? 'включены' : 'выключены'}`);
        break;
      case 'backup':
        setBackupEnabled(value);
        addAuditLog('Админ', 'Изменил настройку', `Автоматический бэкап: ${value ? 'включен' : 'выключен'}`);
        break;
    }

    toast({
      title: 'Настройки сохранены',
      description: 'Изменения применены'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearAuditLog = () => {
    if (!confirm('Вы уверены, что хотите очистить журнал действий?')) return;
    
    setAuditLog([]);
    toast({
      title: 'Журнал очищен',
      description: 'История действий удалена'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Журнал действий</CardTitle>
              <CardDescription>История изменений в системе</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearAuditLog}>
              <Icon name="Trash2" size={14} className="mr-2" />
              Очистить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Журнал действий пуст</p>
            </div>
          ) : (
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
                {auditLog.slice(0, 20).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="text-sm">{formatDate(log.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Экспорт отчётов</CardTitle>
          <CardDescription>Выгрузка данных в различных форматах</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="report-period">Период отчёта</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger id="report-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="quarter">За квартал</SelectItem>
                  <SelectItem value="year">За год</SelectItem>
                  <SelectItem value="all">Все данные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="gap-2 h-auto flex-col py-4"
                onClick={() => handleExportReport('excel')}
              >
                <Icon name="FileSpreadsheet" size={32} className="text-green-600" />
                <div className="text-center">
                  <p className="font-medium">Экспорт в Excel</p>
                  <p className="text-xs text-muted-foreground">Рекомендуется</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2 h-auto flex-col py-4"
                onClick={() => handleExportReport('csv')}
              >
                <Icon name="FileText" size={32} className="text-blue-600" />
                <div className="text-center">
                  <p className="font-medium">Экспорт в CSV</p>
                  <p className="text-xs text-muted-foreground">Для импорта</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2 h-auto flex-col py-4"
                onClick={() => handleExportReport('pdf')}
              >
                <Icon name="FileBarChart" size={32} className="text-red-600" />
                <div className="text-center">
                  <p className="font-medium">Экспорт в PDF</p>
                  <p className="text-xs text-muted-foreground">Для печати</p>
                </div>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium mb-2">Отчёт включает:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Все цены
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Магазины
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Товары
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Отклонения
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>Настройки уведомлений системы</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать отчёты на почту
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(value) => handleSettingChange('notifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления в браузере
                </p>
              </div>
              <Switch 
                checked={pushEnabled}
                onCheckedChange={(value) => handleSettingChange('push', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Резервное копирование</CardTitle>
            <CardDescription>Настройки автоматического бэкапа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Автоматический бэкап</Label>
                <p className="text-sm text-muted-foreground">
                  Ежедневное сохранение данных
                </p>
              </div>
              <Switch
                checked={backupEnabled}
                onCheckedChange={(value) => handleSettingChange('backup', value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleBackup}
            >
              <Icon name="Download" size={16} />
              Создать резервную копию сейчас
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAndSettings;

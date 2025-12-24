import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const mockAuditLog = [
  { id: 1, user: 'operator1', action: 'Добавил цену', details: 'Молоко 3.2% - 72₽', timestamp: '2024-01-15 14:30' },
  { id: 2, user: 'admin', action: 'Изменил товар', details: 'Хлеб белый - обновлены пределы', timestamp: '2024-01-15 12:00' },
  { id: 3, user: 'operator2', action: 'Удалил запись', details: 'Куриная грудка - 15.01.2024', timestamp: '2024-01-14 11:45' },
];

interface ReportsAndSettingsProps {
  onExport: (format: string) => void;
}

const ReportsAndSettings = ({ onExport }: ReportsAndSettingsProps) => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Журнал действий</CardTitle>
          <CardDescription>История изменений в системе</CardDescription>
        </CardHeader>
        <CardContent>
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
              {mockAuditLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="text-sm">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Экспорт отчётов</CardTitle>
          <CardDescription>Выгрузка данных в различных форматах</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="gap-2" onClick={() => onExport('Excel')}>
              <Icon name="FileSpreadsheet" size={16} />
              Экспорт в Excel
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => onExport('PDF')}>
              <Icon name="FileText" size={16} />
              Экспорт в PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => onExport('CSV')}>
              <Icon name="FileBarChart" size={16} />
              Экспорт в CSV
            </Button>
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
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления в браузере
                </p>
              </div>
              <Switch defaultChecked />
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
                onCheckedChange={setBackupEnabled}
              />
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Icon name="Download" size={16} />
              Создать резервную копию сейчас
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReportsAndSettings;

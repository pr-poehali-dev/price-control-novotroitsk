import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import TelegramNotifications from './TelegramNotifications';
import ImportExport from './ImportExport';
import SystemEditor from './SystemEditor';
import BulkDataEditor from './BulkDataEditor';
import UsersManagement from './admin/UsersManagement';
import DirectoriesManagement from './admin/DirectoriesManagement';
import ReportsAndSettings from './admin/ReportsAndSettings';

interface AdminPanelProps {
  isSuperAdmin?: boolean;
}

const AdminPanel = ({ isSuperAdmin = false }: AdminPanelProps) => {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({ title: 'Экспорт', description: `Отчёт экспортируется в формате ${format}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Панель администратора</h2>
        <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="gap-2">
          <Icon name={isSuperAdmin ? 'Crown' : 'Shield'} size={16} />
          {isSuperAdmin ? 'Главный администратор' : 'Администратор'}
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-8' : 'grid-cols-7'}`}>
          <TabsTrigger value="users" className="gap-2">
            <Icon name="Users" size={16} />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="directories" className="gap-2">
            <Icon name="Database" size={16} />
            Справочники
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Icon name="FileEdit" size={16} />
            Данные
          </TabsTrigger>
          <TabsTrigger value="import-export" className="gap-2">
            <Icon name="ArrowDownUp" size={16} />
            Импорт/Экспорт
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Icon name="FileBarChart" size={16} />
            Отчёты
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Icon name="Send" size={16} />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Icon name="Settings" size={16} />
            Настройки
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="system-editor" className="gap-2">
              <Icon name="Wrench" size={16} />
              Редактор
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="users" className="animate-fade-in space-y-4">
          <UsersManagement isSuperAdmin={isSuperAdmin} />
        </TabsContent>

        <TabsContent value="directories" className="animate-fade-in space-y-4">
          <DirectoriesManagement isSuperAdmin={isSuperAdmin} />
        </TabsContent>

        <TabsContent value="data" className="animate-fade-in space-y-4">
          <BulkDataEditor />
        </TabsContent>

        <TabsContent value="import-export" className="animate-fade-in space-y-4">
          <ImportExport />
        </TabsContent>

        <TabsContent value="reports" className="animate-fade-in space-y-4">
          <ReportsAndSettings onExport={handleExport} />
        </TabsContent>

        <TabsContent value="notifications" className="animate-fade-in space-y-4">
          <TelegramNotifications />
        </TabsContent>

        <TabsContent value="settings" className="animate-fade-in space-y-4">
          <ReportsAndSettings onExport={handleExport} />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="system-editor" className="animate-fade-in space-y-4">
            <SystemEditor />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPanel;

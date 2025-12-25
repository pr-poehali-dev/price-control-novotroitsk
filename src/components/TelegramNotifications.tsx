import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user: string;
  type: 'missing_data' | 'price_alert' | 'system';
  message: string;
  sent: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const TelegramNotifications = () => {
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoNotifications, setAutoNotifications] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1', 
      user: 'operator1', 
      type: 'missing_data', 
      message: 'Не вводил данные 2 дня', 
      sent: new Date(Date.now() - 3600000).toISOString(),
      status: 'read'
    },
    { 
      id: '2', 
      user: 'operator2', 
      type: 'price_alert', 
      message: 'Превышение цены: Хлеб белый (92₽ вместо 35-50₽)', 
      sent: new Date(Date.now() - 7200000).toISOString(),
      status: 'delivered'
    },
    { 
      id: '3', 
      user: 'operator3', 
      type: 'missing_data', 
      message: 'Не вводил данные 3 дня', 
      sent: new Date(Date.now() - 86400000).toISOString(),
      status: 'read'
    },
  ]);

  const handleConnectBot = () => {
    if (!botToken) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        variant: 'destructive'
      });
      return;
    }

    setIsConnected(true);
    toast({
      title: 'Бот подключён',
      description: 'Telegram бот успешно подключён к системе'
    });
    setIsSettingsOpen(false);
  };

  const handleDisconnectBot = () => {
    setIsConnected(false);
    setBotToken('');
    toast({
      title: 'Бот отключён',
      description: 'Telegram бот отключён от системы'
    });
  };

  const handleSendNotification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      user: formData.get('user') as string,
      type: 'system',
      message: formData.get('message') as string,
      sent: new Date().toISOString(),
      status: 'sent'
    };

    setNotifications([newNotification, ...notifications]);
    
    toast({
      title: 'Уведомление отправлено',
      description: `Сообщение отправлено пользователю ${newNotification.user}`
    });

    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === newNotification.id 
            ? { ...n, status: 'delivered' as const }
            : n
        )
      );
    }, 2000);

    setIsSendDialogOpen(false);
  };

  const handleTestNotification = () => {
    const testNotification: Notification = {
      id: Date.now().toString(),
      user: 'operator1',
      type: 'system',
      message: 'Тестовое уведомление системы мониторинга цен',
      sent: new Date().toISOString(),
      status: 'sent'
    };

    setNotifications([testNotification, ...notifications]);
    
    toast({
      title: 'Тестовое уведомление отправлено',
      description: 'Проверьте Telegram для подтверждения'
    });

    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === testNotification.id 
            ? { ...n, status: 'delivered' as const }
            : n
        )
      );
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} мин назад`;
    } else if (hours < 24) {
      return `${hours} ч назад`;
    } else {
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const stats = {
    sent: notifications.length,
    read: notifications.filter(n => n.status === 'read').length,
    pending: notifications.filter(n => n.status === 'delivered' || n.status === 'sent').length,
    failed: notifications.filter(n => n.status === 'failed').length
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Send" size={24} className="text-primary" />
                Уведомления в Telegram
                {isConnected && (
                  <Badge variant="default" className="gap-1 ml-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Подключено
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected 
                  ? 'Бот активен и готов к отправке уведомлений'
                  : 'Подключите Telegram бота для отправки уведомлений операторам'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isConnected && (
                <>
                  <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Icon name="MessageSquare" size={16} />
                        Отправить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleSendNotification}>
                        <DialogHeader>
                          <DialogTitle>Отправить уведомление</DialogTitle>
                          <DialogDescription>
                            Отправьте сообщение выбранному оператору
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="user">Получатель</Label>
                            <Select name="user" defaultValue="operator1">
                              <SelectTrigger id="user">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operator1">operator1</SelectItem>
                                <SelectItem value="operator2">operator2</SelectItem>
                                <SelectItem value="operator3">operator3</SelectItem>
                                <SelectItem value="all">Все операторы</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Сообщение</Label>
                            <textarea
                              id="message"
                              name="message"
                              rows={4}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Введите текст уведомления..."
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button type="submit">
                            <Icon name="Send" size={16} className="mr-2" />
                            Отправить
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="gap-2" onClick={handleTestNotification}>
                    <Icon name="Zap" size={16} />
                    Тест
                  </Button>
                </>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Settings" size={16} />
                    Настроить
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Настройка Telegram бота</DialogTitle>
                    <DialogDescription>
                      Подключите бота для автоматической отправки уведомлений
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="bot-token">Токен бота</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bot-token"
                          type="password"
                          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                          value={botToken}
                          onChange={(e) => setBotToken(e.target.value)}
                          disabled={isConnected}
                        />
                        {isConnected ? (
                          <Button variant="destructive" onClick={handleDisconnectBot}>
                            Отключить
                          </Button>
                        ) : (
                          <Button onClick={handleConnectBot}>
                            Подключить
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Получите токен у @BotFather в Telegram
                      </p>
                    </div>

                    {isConnected && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="auto-notifications">Автоматические уведомления</Label>
                            <p className="text-xs text-muted-foreground">
                              Отправлять уведомления при отклонениях и пропусках
                            </p>
                          </div>
                          <Switch
                            id="auto-notifications"
                            checked={autoNotifications}
                            onCheckedChange={setAutoNotifications}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <p className="font-medium mb-3">Инструкция по настройке:</p>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                            1
                          </div>
                          <div>
                            <p className="text-sm font-medium">Создайте бота</p>
                            <p className="text-xs text-muted-foreground">
                              Откройте @BotFather в Telegram и выполните /newbot
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                            2
                          </div>
                          <div>
                            <p className="text-sm font-medium">Получите токен</p>
                            <p className="text-xs text-muted-foreground">
                              Скопируйте токен и вставьте в поле выше
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                            3
                          </div>
                          <div>
                            <p className="text-sm font-medium">Операторы подключаются</p>
                            <p className="text-xs text-muted-foreground">
                              Каждый оператор должен написать боту /start
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Send" size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">Уведомлений пока нет</p>
              <p className="text-sm">Отправьте первое уведомление или подождите автоматических</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.type === 'missing_data' 
                        ? 'bg-orange-100 text-orange-600'
                        : notification.type === 'price_alert'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon 
                        name={
                          notification.type === 'missing_data' 
                            ? 'AlertCircle'
                            : notification.type === 'price_alert'
                            ? 'TrendingUp'
                            : 'MessageSquare'
                        } 
                        size={20} 
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{notification.user}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type === 'missing_data' 
                            ? 'Пропуск данных'
                            : notification.type === 'price_alert'
                            ? 'Превышение цены'
                            : 'Системное'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(notification.sent)}
                    </span>
                    <Badge 
                      variant={
                        notification.status === 'read' 
                          ? 'default' 
                          : notification.status === 'delivered' 
                          ? 'secondary'
                          : notification.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="gap-1"
                    >
                      <Icon 
                        name={
                          notification.status === 'read' 
                            ? 'CheckCheck' 
                            : notification.status === 'delivered' 
                            ? 'Check' 
                            : notification.status === 'failed'
                            ? 'X'
                            : 'Send'
                        } 
                        size={14} 
                      />
                      {notification.status === 'read' 
                        ? 'Прочитано' 
                        : notification.status === 'delivered' 
                        ? 'Доставлено'
                        : notification.status === 'failed'
                        ? 'Ошибка'
                        : 'Отправлено'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего отправлено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.sent}</span>
              <Icon name="Send" size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Прочитано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.read}</span>
              <Icon name="CheckCheck" size={24} className="text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : 0}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.pending}</span>
              <Icon name="Clock" size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ошибки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.failed}</span>
              <Icon name="XCircle" size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramNotifications;

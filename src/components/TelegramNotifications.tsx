import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const mockNotifications = [
  { id: 1, user: 'operator1', type: 'missing_data', days: 2, sent: '2024-01-15 10:00', status: 'sent' },
  { id: 2, user: 'operator2', type: 'price_alert', product: 'Хлеб белый', sent: '2024-01-14 15:30', status: 'delivered' },
  { id: 3, user: 'operator3', type: 'missing_data', days: 3, sent: '2024-01-13 10:00', status: 'read' },
];

const TelegramNotifications = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Send" size={24} className="text-primary" />
                Уведомления в Telegram
              </CardTitle>
              <CardDescription>История отправленных уведомлений операторам</CardDescription>
            </div>
            <Button className="gap-2">
              <Icon name="Settings" size={16} />
              Настроить бот
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={notification.type === 'missing_data' ? 'AlertCircle' : 'TrendingUp'} 
                        size={20} 
                        className="text-muted-foreground" 
                      />
                      <span className="font-medium">{notification.user}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.type === 'missing_data' 
                        ? `Не вводил данные ${notification.days} дня` 
                        : `Превышение цены: ${notification.product}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{notification.sent}</span>
                  <Badge 
                    variant={
                      notification.status === 'read' 
                        ? 'default' 
                        : notification.status === 'delivered' 
                        ? 'secondary' 
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
                          : 'Send'
                      } 
                      size={14} 
                    />
                    {notification.status === 'read' 
                      ? 'Прочитано' 
                      : notification.status === 'delivered' 
                      ? 'Доставлено' 
                      : 'Отправлено'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Отправлено сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">12</span>
              <Icon name="Send" size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Прочитано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">8</span>
              <Icon name="CheckCheck" size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ожидают прочтения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">4</span>
              <Icon name="Clock" size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройка Telegram бота</CardTitle>
          <CardDescription>Инструкция по подключению уведомлений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Создайте бота в Telegram</p>
                <p className="text-sm text-muted-foreground">Откройте @BotFather и создайте нового бота командой /newbot</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Получите токен бота</p>
                <p className="text-sm text-muted-foreground">BotFather выдаст токен вида: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Укажите токен в настройках</p>
                <p className="text-sm text-muted-foreground">Добавьте токен в системные настройки для интеграции</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Операторы добавляют бота</p>
                <p className="text-sm text-muted-foreground">Каждый оператор должен написать боту /start и указать свой логин</p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button className="w-full gap-2">
              <Icon name="ExternalLink" size={16} />
              Открыть документацию по настройке
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramNotifications;

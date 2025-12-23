import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  appName: string;
  appDescription: string;
  logoIcon: string;
  primaryColor: string;
  accentColor: string;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  visible: boolean;
}

interface PageContent {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  buttonText?: string;
}

const SystemEditor = () => {
  const { toast } = useToast();
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    appName: 'Цена-Контроль Новотроицкое',
    appDescription: 'Система мониторинга цен',
    logoIcon: 'TrendingUp',
    primaryColor: '#1EAEDB',
    accentColor: '#F97316'
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Пользователи', icon: 'Users', route: '/users', visible: true },
    { id: '2', name: 'Справочники', icon: 'Database', route: '/directories', visible: true },
    { id: '3', name: 'Данные', icon: 'FileEdit', route: '/data', visible: true },
    { id: '4', name: 'Импорт/Экспорт', icon: 'ArrowDownUp', route: '/import-export', visible: true },
    { id: '5', name: 'Отчёты', icon: 'FileBarChart', route: '/reports', visible: true },
    { id: '6', name: 'Telegram', icon: 'Send', route: '/notifications', visible: true },
    { id: '7', name: 'Настройки', icon: 'Settings', route: '/settings', visible: true },
  ]);

  const [homePageContent, setHomePageContent] = useState<PageContent>({
    id: 'home',
    title: 'Мониторинг цен в магазинах',
    subtitle: 'Актуальная информация о ценах на продукты питания в Новотроицком муниципальном округе',
    content: 'Система мониторинга цен создана для информирования жителей о актуальных ценах на продукты питания в местных магазинах.',
    buttonText: 'Вход для сотрудников'
  });

  const [loginPageContent, setLoginPageContent] = useState<PageContent>({
    id: 'login',
    title: 'Вход для сотрудников',
    subtitle: 'Система мониторинга цен Новотроицкого МО',
    content: '',
  });

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  const handleSaveSystemConfig = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Конфигурация системы успешно обновлена',
    });
  };

  const handleSaveMenuItem = () => {
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      toast({
        title: 'Пункт меню обновлён',
        description: `"${editingItem.name}" успешно сохранён`,
      });
      setIsMenuDialogOpen(false);
      setEditingItem(null);
    }
  };

  const handleToggleMenuVisibility = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const handleSavePageContent = (type: 'home' | 'login') => {
    toast({
      title: 'Контент сохранён',
      description: `Содержимое страницы "${type === 'home' ? 'Главная' : 'Вход'}" обновлено`,
    });
  };

  const availableIcons = [
    'TrendingUp', 'Users', 'Database', 'FileEdit', 'ArrowDownUp', 
    'FileBarChart', 'Send', 'Settings', 'Home', 'ShoppingCart',
    'BarChart3', 'Package', 'Store', 'Map', 'Shield', 'Crown'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="gap-2">
          <Icon name="Crown" size={16} />
          Режим редактирования системы
        </Badge>
        <Badge variant="outline">Только для главного администратора</Badge>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding" className="gap-2">
            <Icon name="Palette" size={16} />
            Брендинг
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2">
            <Icon name="Menu" size={16} />
            Меню
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <Icon name="FileText" size={16} />
            Страницы
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Icon name="Code" size={16} />
            Расширенное
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Брендинг системы</CardTitle>
              <CardDescription>Настройте название, описание и визуальный стиль приложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название системы</Label>
                    <Input
                      value={systemConfig.appName}
                      onChange={(e) => setSystemConfig({ ...systemConfig, appName: e.target.value })}
                      placeholder="Цена-Контроль Новотроицкое"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Описание системы</Label>
                    <Input
                      value={systemConfig.appDescription}
                      onChange={(e) => setSystemConfig({ ...systemConfig, appDescription: e.target.value })}
                      placeholder="Система мониторинга цен"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Иконка логотипа</Label>
                    <div className="flex gap-2">
                      <Input
                        value={systemConfig.logoIcon}
                        onChange={(e) => setSystemConfig({ ...systemConfig, logoIcon: e.target.value })}
                        placeholder="TrendingUp"
                      />
                      <Button variant="outline" size="icon">
                        <Icon name={systemConfig.logoIcon as any} size={20} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableIcons.map((icon) => (
                        <Button
                          key={icon}
                          variant="outline"
                          size="sm"
                          onClick={() => setSystemConfig({ ...systemConfig, logoIcon: icon })}
                        >
                          <Icon name={icon as any} size={16} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Основной цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={systemConfig.primaryColor}
                        onChange={(e) => setSystemConfig({ ...systemConfig, primaryColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <Input
                        value={systemConfig.primaryColor}
                        onChange={(e) => setSystemConfig({ ...systemConfig, primaryColor: e.target.value })}
                        placeholder="#1EAEDB"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Акцентный цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={systemConfig.accentColor}
                        onChange={(e) => setSystemConfig({ ...systemConfig, accentColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <Input
                        value={systemConfig.accentColor}
                        onChange={(e) => setSystemConfig({ ...systemConfig, accentColor: e.target.value })}
                        placeholder="#F97316"
                      />
                    </div>
                  </div>

                  <Alert>
                    <Icon name="Info" size={16} />
                    <AlertDescription className="text-sm">
                      Изменения цветов будут применены после перезагрузки страницы
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Предпросмотр</h4>
                <div className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name={systemConfig.logoIcon as any} size={28} style={{ color: systemConfig.primaryColor }} />
                    <h1 className="text-2xl font-bold">{systemConfig.appName}</h1>
                  </div>
                  <p className="text-muted-foreground">{systemConfig.appDescription}</p>
                  <Button className="mt-4" style={{ backgroundColor: systemConfig.primaryColor }}>
                    Пример кнопки
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveSystemConfig} className="w-full gap-2">
                <Icon name="Save" size={16} />
                Сохранить настройки брендинга
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление меню</CardTitle>
              <CardDescription>Настройте пункты меню панели администратора</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name={item.icon as any} size={20} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.route}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.visible ? 'default' : 'secondary'}>
                      {item.visible ? 'Видимый' : 'Скрытый'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleMenuVisibility(item.id)}
                    >
                      <Icon name={item.visible ? 'Eye' : 'EyeOff'} size={16} />
                    </Button>
                    <Dialog open={isMenuDialogOpen && editingItem?.id === item.id} onOpenChange={setIsMenuDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem(item)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактировать пункт меню</DialogTitle>
                          <DialogDescription>Измените название, иконку и маршрут</DialogDescription>
                        </DialogHeader>
                        {editingItem && (
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Название</Label>
                              <Input
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Иконка</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={editingItem.icon}
                                  onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                                />
                                <Button variant="outline" size="icon">
                                  <Icon name={editingItem.icon as any} size={20} />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {availableIcons.map((icon) => (
                                  <Button
                                    key={icon}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingItem({ ...editingItem, icon })}
                                  >
                                    <Icon name={icon as any} size={16} />
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Маршрут</Label>
                              <Input
                                value={editingItem.route}
                                onChange={(e) => setEditingItem({ ...editingItem, route: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button onClick={handleSaveMenuItem}>
                            Сохранить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}

              <Alert>
                <Icon name="Info" size={16} />
                <AlertDescription>
                  Изменения в меню будут применены после сохранения. Скрытые пункты не отображаются в интерфейсе.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Редактирование главной страницы</CardTitle>
              <CardDescription>Измените контент публичной страницы для жителей</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={homePageContent.title}
                  onChange={(e) => setHomePageContent({ ...homePageContent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Подзаголовок</Label>
                <Input
                  value={homePageContent.subtitle}
                  onChange={(e) => setHomePageContent({ ...homePageContent, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Описание проекта</Label>
                <Textarea
                  value={homePageContent.content}
                  onChange={(e) => setHomePageContent({ ...homePageContent, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Текст кнопки входа</Label>
                <Input
                  value={homePageContent.buttonText}
                  onChange={(e) => setHomePageContent({ ...homePageContent, buttonText: e.target.value })}
                />
              </div>
              <Button onClick={() => handleSavePageContent('home')} className="w-full gap-2">
                <Icon name="Save" size={16} />
                Сохранить изменения главной страницы
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Редактирование страницы входа</CardTitle>
              <CardDescription>Измените контент страницы авторизации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={loginPageContent.title}
                  onChange={(e) => setLoginPageContent({ ...loginPageContent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Подзаголовок</Label>
                <Input
                  value={loginPageContent.subtitle}
                  onChange={(e) => setLoginPageContent({ ...loginPageContent, subtitle: e.target.value })}
                />
              </div>
              <Button onClick={() => handleSavePageContent('login')} className="w-full gap-2">
                <Icon name="Save" size={16} />
                Сохранить изменения страницы входа
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
                Расширенные настройки
              </CardTitle>
              <CardDescription>
                Опасная зона: изменения могут повлиять на работу всей системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Icon name="AlertTriangle" size={16} />
                <AlertDescription>
                  Эти настройки предназначены только для опытных администраторов. Некорректные изменения могут нарушить работу системы.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">CSS переменные</h4>
                      <p className="text-sm text-muted-foreground">Прямое редактирование стилей</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="Code" size={16} className="mr-2" />
                      Открыть редактор
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Роли и права доступа</h4>
                      <p className="text-sm text-muted-foreground">Управление ролями пользователей</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="Shield" size={16} className="mr-2" />
                      Настроить
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API эндпоинты</h4>
                      <p className="text-sm text-muted-foreground">Настройка внешних интеграций</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="Link" size={16} className="mr-2" />
                      Управление
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Структура базы данных</h4>
                      <p className="text-sm text-muted-foreground">Просмотр и изменение схемы БД</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="Database" size={16} className="mr-2" />
                      Открыть
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Сброс к заводским настройкам</h4>
                      <p className="text-sm text-muted-foreground">Восстановить исходную конфигурацию</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Icon name="RotateCcw" size={16} className="mr-2" />
                      Сбросить
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemEditor;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/store';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState(dataStore.getPageContent());
  const [systemConfig, setSystemConfig] = useState(dataStore.getSystemConfig());

  useEffect(() => {
    setPageContent(dataStore.getPageContent());
    setSystemConfig(dataStore.getSystemConfig());
  }, []);

  const handleLogin = async () => {
    if (!login || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните логин и пароль',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = dataStore.authenticateUser(login, password);
      
      if (user) {
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.login);
        localStorage.setItem('userId', user.id);
        
        const roleNames = {
          superadmin: 'Главный Администратор',
          admin: 'Администратор',
          operator: 'Оператор',
        };
        
        toast({
          title: 'Успешно',
          description: `Добро пожаловать, ${roleNames[user.role]}!`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль, или пользователь заблокирован',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Письмо отправлено',
      description: 'Проверьте почту для восстановления пароля',
    });
    setShowForgotPassword(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name={systemConfig.logoIcon as any} size={28} style={{ color: systemConfig.primaryColor }} />
            <h1 className="text-2xl font-bold">{systemConfig.appName}</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full p-4" style={{ backgroundColor: systemConfig.primaryColor }}>
                <Icon name={systemConfig.logoIcon as any} size={32} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">{pageContent.loginTitle}</CardTitle>
            <CardDescription>
              {showForgotPassword ? 'Восстановление пароля' : pageContent.loginSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForgotPassword ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Логин</Label>
                  <Input
                    id="login"
                    placeholder="Введите логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" size={16} />
                      Войти
                    </>
                  )}
                </Button>
                <button
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Забыли пароль?
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full gap-2" onClick={handleForgotPassword}>
                  <Icon name="Send" size={16} />
                  Отправить ссылку
                </Button>
                <button
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail('');
                  }}
                >
                  ← Вернуться к входу
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
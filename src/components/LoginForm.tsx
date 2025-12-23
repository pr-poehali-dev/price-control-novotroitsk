import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (role: 'operator' | 'admin') => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (login === 'admin' && password === 'admin') {
        toast({
          title: 'Успешно',
          description: 'Добро пожаловать, Администратор!',
        });
        onLogin('admin');
      } else if (login === 'operator' && password === 'operator') {
        toast({
          title: 'Успешно',
          description: 'Добро пожаловать, Оператор!',
        });
        onLogin('operator');
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <Icon name="TrendingUp" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Цена-Контроль</CardTitle>
          <CardDescription>
            {showForgotPassword ? 'Восстановление пароля' : 'Система мониторинга цен Новотроицкого МО'}
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
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Демо: admin/admin или operator/operator
                </p>
              </div>
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
  );
};

export default LoginForm;

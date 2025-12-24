import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const mockUsers = [
  { id: 1, login: 'operator1', role: 'Оператор', status: 'active', lastLogin: '2024-01-15 14:30' },
  { id: 2, login: 'operator2', role: 'Оператор', status: 'active', lastLogin: '2024-01-14 09:15' },
  { id: 3, login: 'admin', role: 'Администратор', status: 'active', lastLogin: '2024-01-15 16:00' },
];

interface UsersManagementProps {
  isSuperAdmin?: boolean;
}

const UsersManagement = ({ isSuperAdmin = false }: UsersManagementProps) => {
  const { toast } = useToast();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const handleAddUser = () => {
    toast({ title: 'Успешно', description: 'Пользователь добавлен' });
    setIsUserDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление пользователями</CardTitle>
            <CardDescription>Добавление, редактирование и управление доступом</CardDescription>
          </div>
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="UserPlus" size={16} />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый пользователь</DialogTitle>
                <DialogDescription>Создайте нового пользователя системы</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Логин</Label>
                  <Input id="login" placeholder="operator3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram ID / Номер телефона</Label>
                  <Input id="telegram" placeholder="+7 (900) 123-45-67 или @username" />
                  <p className="text-xs text-muted-foreground">
                    Для получения уведомлений о пропущенных вводах данных
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select defaultValue="operator">
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Оператор</SelectItem>
                      {isSuperAdmin && (
                        <SelectItem value="admin">Администратор</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!isSuperAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Только главный администратор может создавать админов
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleAddUser}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Логин</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Последний вход</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.login}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Администратор' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">Не указан</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersManagement;

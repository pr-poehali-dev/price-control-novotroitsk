import { useState, useEffect } from 'react';
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

interface User {
  id: string;
  login: string;
  role: 'operator' | 'admin';
  telegram?: string;
  status: 'active' | 'blocked';
  lastLogin?: string;
}

interface UsersManagementProps {
  isSuperAdmin?: boolean;
}

const UsersManagement = ({ isSuperAdmin = false }: UsersManagementProps) => {
  const { toast } = useToast();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      login: 'operator1', 
      role: 'operator', 
      telegram: '@operator1',
      status: 'active', 
      lastLogin: new Date().toISOString()
    },
    { 
      id: '2', 
      login: 'operator2', 
      role: 'operator',
      status: 'active', 
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    },
    { 
      id: '3', 
      login: 'admin', 
      role: 'admin', 
      telegram: '@admin',
      status: 'active', 
      lastLogin: new Date().toISOString()
    },
  ]);

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newUser: User = {
      id: Date.now().toString(),
      login: formData.get('login') as string,
      role: formData.get('role') as 'operator' | 'admin',
      telegram: formData.get('telegram') as string || undefined,
      status: 'active',
      lastLogin: undefined
    };

    setUsers([...users, newUser]);
    
    toast({ 
      title: 'Успешно', 
      description: `Пользователь ${newUser.login} добавлен` 
    });
    
    setIsUserDialogOpen(false);
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedUser: User = {
      ...editingUser,
      login: formData.get('login') as string,
      telegram: formData.get('telegram') as string || undefined,
      role: formData.get('role') as 'operator' | 'admin',
    };

    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    toast({ 
      title: 'Успешно', 
      description: `Пользователь ${updatedUser.login} обновлён` 
    });
    
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (!isSuperAdmin) {
      toast({ 
        title: 'Доступ запрещён', 
        description: 'Только главный админ может удалять пользователей',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    setUsers(users.filter(u => u.id !== userId));
    toast({ 
      title: 'Успешно', 
      description: 'Пользователь удалён' 
    });
  };

  const handleToggleStatus = (userId: string) => {
    if (!isSuperAdmin) {
      toast({ 
        title: 'Доступ запрещён', 
        description: 'Только главный админ может блокировать пользователей',
        variant: 'destructive'
      });
      return;
    }

    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'blocked' as const : 'active' as const }
        : u
    ));

    const user = users.find(u => u.id === userId);
    toast({ 
      title: 'Статус изменён', 
      description: `${user?.login} ${user?.status === 'active' ? 'заблокирован' : 'активирован'}` 
    });
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Никогда';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <form onSubmit={handleAddUser}>
                <DialogHeader>
                  <DialogTitle>Новый пользователь</DialogTitle>
                  <DialogDescription>Создайте нового пользователя системы</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="login">Логин *</Label>
                    <Input 
                      id="login" 
                      name="login"
                      placeholder="operator3" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль *</Label>
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram ID / Номер телефона</Label>
                    <Input 
                      id="telegram" 
                      name="telegram"
                      placeholder="+7 (900) 123-45-67 или @username" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Для получения уведомлений о пропущенных вводах данных
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль *</Label>
                    <Select name="role" defaultValue="operator">
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
                  <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Создать</Button>
                </DialogFooter>
              </form>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.login}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    <Icon name={user.role === 'admin' ? 'Shield' : 'User'} size={12} className="mr-1" />
                    {user.role === 'admin' ? 'Администратор' : 'Оператор'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.telegram || 'Не указан'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.status === 'active' ? 'default' : 'secondary'} 
                    className="gap-1 cursor-pointer"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(user.lastLogin)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditUser(user)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    {isSuperAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-2 opacity-20" />
            <p>Пользователей пока нет</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
              <DialogDescription>Измените данные пользователя</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-login">Логин *</Label>
                <Input 
                  id="edit-login" 
                  name="login"
                  defaultValue={editingUser?.login}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telegram">Telegram ID / Номер телефона</Label>
                <Input 
                  id="edit-telegram" 
                  name="telegram"
                  defaultValue={editingUser?.telegram}
                  placeholder="+7 (900) 123-45-67 или @username" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Роль *</Label>
                <Select name="role" defaultValue={editingUser?.role}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Оператор</SelectItem>
                    {isSuperAdmin && (
                      <SelectItem value="admin">Администратор</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UsersManagement;

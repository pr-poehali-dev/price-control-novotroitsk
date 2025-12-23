import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  value: string;
  options?: string[];
}

interface DataRow {
  id: string;
  date: string;
  store: string;
  product: string;
  price: number;
  operator: string;
  selected: boolean;
}

const BulkDataEditor = () => {
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');

  const [data, setData] = useState<DataRow[]>([
    { id: '1', date: '2024-01-15', store: 'Магнит', product: 'Молоко 3.2%', price: 72, operator: 'operator1', selected: false },
    { id: '2', date: '2024-01-15', store: 'Пятёрочка', product: 'Хлеб белый', price: 45, operator: 'operator2', selected: false },
    { id: '3', date: '2024-01-14', store: 'Лента', product: 'Куриная грудка', price: 310, operator: 'operator1', selected: false },
    { id: '4', date: '2024-01-14', store: 'Магнит', product: 'Яйца куриные', price: 95, operator: 'operator2', selected: false },
    { id: '5', date: '2024-01-13', store: 'Перекрёсток', product: 'Молоко 3.2%', price: 78, operator: 'operator1', selected: false },
  ]);

  const fields: DataField[] = [
    { id: 'date', name: 'Дата', type: 'date', value: '' },
    { id: 'store', name: 'Магазин', type: 'select', value: '', options: ['Магнит', 'Пятёрочка', 'Лента', 'Перекрёсток'] },
    { id: 'product', name: 'Товар', type: 'text', value: '' },
    { id: 'price', name: 'Цена', type: 'number', value: '' },
    { id: 'operator', name: 'Оператор', type: 'select', value: '', options: ['operator1', 'operator2', 'operator3'] },
  ];

  const handleSelectAll = (checked: boolean) => {
    setData(data.map(row => ({ ...row, selected: checked })));
    setSelectedRows(checked ? data.map(row => row.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setData(data.map(row => row.id === id ? { ...row, selected: checked } : row));
    setSelectedRows(checked 
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id)
    );
  };

  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одну запись',
        variant: 'destructive',
      });
      return;
    }
    setIsEditDialogOpen(true);
  };

  const handleApplyBulkEdit = () => {
    if (!editField || !editValue) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setData(data.map(row => {
      if (selectedRows.includes(row.id)) {
        return { ...row, [editField]: editField === 'price' ? parseFloat(editValue) : editValue };
      }
      return row;
    }));

    toast({
      title: 'Изменения применены',
      description: `Обновлено записей: ${selectedRows.length}`,
    });

    setIsEditDialogOpen(false);
    setEditField('');
    setEditValue('');
    setSelectedRows([]);
    setData(data.map(row => ({ ...row, selected: false })));
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одну запись',
        variant: 'destructive',
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setData(data.filter(row => !selectedRows.includes(row.id)));
    
    toast({
      title: 'Записи удалены',
      description: `Удалено записей: ${selectedRows.length}`,
    });

    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
  };

  const selectedField = fields.find(f => f.id === editField);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Массовое редактирование данных</CardTitle>
              <CardDescription>Выберите записи и примените изменения ко всем сразу</CardDescription>
            </div>
            {selectedRows.length > 0 && (
              <Badge variant="default" className="gap-2">
                <Icon name="CheckSquare" size={16} />
                Выбрано: {selectedRows.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleBulkEdit}
              disabled={selectedRows.length === 0}
            >
              <Icon name="Edit" size={16} />
              Изменить выбранные
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleBulkDelete}
              disabled={selectedRows.length === 0}
            >
              <Icon name="Trash2" size={16} />
              Удалить выбранные
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 ml-auto"
              onClick={() => {
                setSelectedRows([]);
                setData(data.map(row => ({ ...row, selected: false })));
              }}
              disabled={selectedRows.length === 0}
            >
              <Icon name="X" size={16} />
              Снять выделение
            </Button>
          </div>

          <Alert className="mb-4">
            <Icon name="Info" size={16} />
            <AlertDescription>
              Выберите записи с помощью чекбоксов, затем используйте кнопки для массового редактирования или удаления
            </AlertDescription>
          </Alert>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Магазин</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Оператор</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id} className={row.selected ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={row.selected}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell className="font-semibold">{row.price}₽</TableCell>
                    <TableCell className="text-muted-foreground">{row.operator}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Массовое редактирование</DialogTitle>
            <DialogDescription>
              Выберите поле для изменения и укажите новое значение
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                Изменения будут применены к {selectedRows.length} записям
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Поле для изменения</Label>
              <Select value={editField} onValueChange={setEditField}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите поле" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editField && (
              <div className="space-y-2">
                <Label>Новое значение</Label>
                {selectedField?.type === 'select' ? (
                  <Select value={editValue} onValueChange={setEditValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите значение" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedField.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={selectedField?.type || 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`Введите новое значение для поля "${selectedField?.name}"`}
                  />
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleApplyBulkEdit}>
              Применить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить выбранные записи?
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <Icon name="AlertTriangle" size={16} />
            <AlertDescription>
              Будет удалено записей: {selectedRows.length}. Это действие нельзя отменить.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkDataEditor;

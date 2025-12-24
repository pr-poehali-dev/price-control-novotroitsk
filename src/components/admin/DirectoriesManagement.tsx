import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/store';

interface DirectoriesManagementProps {
  isSuperAdmin?: boolean;
}

const DirectoriesManagement = ({ isSuperAdmin = false }: DirectoriesManagementProps) => {
  const { toast } = useToast();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<'products' | 'stores'>('products');

  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка товаров из БД
  const loadProducts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/4b95609f-33c9-4593-afab-bcbaeaa8624c');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить товары', variant: 'destructive' });
    }
  };

  // Загрузка магазинов из БД
  const loadStores = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/ec0b8f6d-4d40-49e9-862a-157e23c0f6f2');
      const data = await response.json();
      setStores(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить магазины', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadProducts();
    loadStores();
  }, []);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const newProduct = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      minPrice: parseFloat(formData.get('minPrice') as string),
      maxPrice: parseFloat(formData.get('maxPrice') as string),
      photoRequired: formData.get('photoRequired') === 'true'
    };
    
    try {
      const response = await fetch('https://functions.poehali.dev/4b95609f-33c9-4593-afab-bcbaeaa8624c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Товар добавлен в справочник' });
        setIsProductDialogOpen(false);
        await loadProducts();
      } else {
        throw new Error('Ошибка при добавлении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить товар', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const newStore = {
      name: formData.get('name') as string,
      district: formData.get('district') as string,
      address: formData.get('address') as string
    };
    
    try {
      const response = await fetch('https://functions.poehali.dev/ec0b8f6d-4d40-49e9-862a-157e23c0f6f2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Магазин добавлен в справочник' });
        setIsStoreDialogOpen(false);
        await loadStores();
      } else {
        throw new Error('Ошибка при добавлении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить магазин', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={selectedDirectory === 'products' ? 'default' : 'outline'}
          onClick={() => setSelectedDirectory('products')}
          className="gap-2"
        >
          <Icon name="Package" size={16} />
          Товары
        </Button>
        <Button
          variant={selectedDirectory === 'stores' ? 'default' : 'outline'}
          onClick={() => setSelectedDirectory('stores')}
          className="gap-2"
        >
          <Icon name="Store" size={16} />
          Магазины
        </Button>
      </div>

      {selectedDirectory === 'products' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Справочник товаров</CardTitle>
                <CardDescription>Управление товарной номенклатурой</CardDescription>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddProduct}>
                    <DialogHeader>
                      <DialogTitle>Новый товар</DialogTitle>
                      <DialogDescription>Добавьте товар в справочник</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Название товара</Label>
                        <Input id="product-name" name="name" placeholder="Молоко 3.2%" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-price">Мин. цена (₽)</Label>
                          <Input id="min-price" name="minPrice" type="number" step="0.01" placeholder="50" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-price">Макс. цена (₽)</Label>
                          <Input id="max-price" name="maxPrice" type="number" step="0.01" placeholder="100" required />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="photo-required">Требуется фото</Label>
                        <Switch id="photo-required" name="photoRequired" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Категория</Label>
                        <Select name="category" defaultValue="Молочные продукты">
                          <SelectTrigger id="category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Молочные продукты">Молочные продукты</SelectItem>
                            <SelectItem value="Мясо и птица">Мясные продукты</SelectItem>
                            <SelectItem value="Хлеб и выпечка">Хлебобулочные изделия</SelectItem>
                            <SelectItem value="Овощи">Овощи и фрукты</SelectItem>
                            <SelectItem value="Бакалея">Бакалея</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>Отмена</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Добавление...' : 'Добавить'}
                      </Button>
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
                  <TableHead>Название</TableHead>
                  <TableHead>Мин. цена</TableHead>
                  <TableHead>Макс. цена</TableHead>
                  <TableHead>Фото</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.minPrice}₽</TableCell>
                    <TableCell>{product.maxPrice}₽</TableCell>
                    <TableCell>
                      {product.photoRequired ? (
                        <Badge variant="default" className="gap-1">
                          <Icon name="Camera" size={12} />
                          Да
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Нет</Badge>
                      )}
                    </TableCell>
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
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Справочник магазинов</CardTitle>
                <CardDescription>Управление торговыми точками</CardDescription>
              </div>
              <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить магазин
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddStore}>
                    <DialogHeader>
                      <DialogTitle>Новый магазин</DialogTitle>
                      <DialogDescription>Добавьте магазин в справочник</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="store-name">Название магазина</Label>
                        <Input id="store-name" name="name" placeholder="Пятёрочка" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-district">Район</Label>
                        <Select name="district" defaultValue="Новотроицкое (центр)">
                          <SelectTrigger id="store-district">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Новотроицкое (центр)">Новотроицкое (центр)</SelectItem>
                            <SelectItem value="Северный район">Северный район</SelectItem>
                            <SelectItem value="Западный район">Западный район</SelectItem>
                            <SelectItem value="Южный район">Южный район</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-address">Адрес</Label>
                        <Input id="store-address" name="address" placeholder="ул. Ленина, 123" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsStoreDialogOpen(false)}>Отмена</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Добавление...' : 'Добавить'}
                      </Button>
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
                  <TableHead>Название</TableHead>
                  <TableHead>Район</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{store.district}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {store.address}
                    </TableCell>
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
      )}
    </div>
  );
};

export default DirectoriesManagement;
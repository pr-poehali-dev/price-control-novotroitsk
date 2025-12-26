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

const PRODUCT_CATEGORIES = [
  'Социально значимые товары',
  'Молочные продукты',
  'Мясо и птица',
  'Хлеб и выпечка',
  'Овощи и фрукты',
  'Бакалея',
  'Яйца',
];

const DirectoriesManagement = ({ isSuperAdmin = false }: DirectoriesManagementProps) => {
  const { toast } = useToast();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<'products' | 'stores'>('products');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [editPhotoRequired, setEditPhotoRequired] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/4b95609f-33c9-4593-afab-bcbaeaa8624c');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить товары', variant: 'destructive' });
    }
  };

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
      photoRequired: photoRequired
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
        setPhotoRequired(false);
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

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast({ title: 'Доступ запрещён', description: 'Только главный админ может редактировать', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const updatedProduct = {
      id: editingProduct.id,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      minPrice: parseFloat(formData.get('minPrice') as string),
      maxPrice: parseFloat(formData.get('maxPrice') as string),
      photoRequired: editPhotoRequired
    };
    
    try {
      const response = await fetch(`https://functions.poehali.dev/4b95609f-33c9-4593-afab-bcbaeaa8624c`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Товар обновлён' });
        setIsEditProductDialogOpen(false);
        setEditingProduct(null);
        setEditPhotoRequired(false);
        await loadProducts();
      } else {
        throw new Error('Ошибка при обновлении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить товар', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isSuperAdmin) {
      toast({ title: 'Доступ запрещён', description: 'Только главный админ может удалять', variant: 'destructive' });
      return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/4b95609f-33c9-4593-afab-bcbaeaa8624c`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Товар удалён' });
        await loadProducts();
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить товар', variant: 'destructive' });
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

  const handleEditStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast({ title: 'Доступ запрещён', description: 'Только главный админ может редактировать', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const updatedStore = {
      id: editingStore.id,
      name: formData.get('name') as string,
      district: formData.get('district') as string,
      address: formData.get('address') as string
    };
    
    try {
      const response = await fetch(`https://functions.poehali.dev/ec0b8f6d-4d40-49e9-862a-157e23c0f6f2`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStore)
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Магазин обновлён' });
        setIsEditStoreDialogOpen(false);
        setEditingStore(null);
        await loadStores();
      } else {
        throw new Error('Ошибка при обновлении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить магазин', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!isSuperAdmin) {
      toast({ title: 'Доступ запрещён', description: 'Только главный админ может удалять', variant: 'destructive' });
      return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этот магазин?')) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/ec0b8f6d-4d40-49e9-862a-157e23c0f6f2`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: storeId })
      });
      
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Магазин удалён' });
        await loadStores();
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить магазин', variant: 'destructive' });
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditPhotoRequired(product.photoRequired || false);
    setIsEditProductDialogOpen(true);
  };

  const openEditStore = (store: any) => {
    setEditingStore(store);
    setIsEditStoreDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
          <Icon name="Crown" size={20} className="text-primary" />
          <p className="text-sm font-medium">
            Режим главного администратора: доступны редактирование и удаление записей
          </p>
        </div>
      )}

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
                      <div className="space-y-2">
                        <Label htmlFor="category">Категория</Label>
                        <Select name="category" defaultValue={PRODUCT_CATEGORIES[0]}>
                          <SelectTrigger id="category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Switch 
                          id="photo-required" 
                          checked={photoRequired}
                          onCheckedChange={setPhotoRequired}
                        />
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
                  <TableHead>Категория</TableHead>
                  <TableHead>Мин. цена</TableHead>
                  <TableHead>Макс. цена</TableHead>
                  <TableHead>Фото</TableHead>
                  {isSuperAdmin && <TableHead>Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
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
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
                <CardDescription>Управление магазинами и населёнными пунктами</CardDescription>
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
                        <Label htmlFor="district">Населённый пункт</Label>
                        <Input id="district" name="district" placeholder="Новотроицкое" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Адрес</Label>
                        <Input id="address" name="address" placeholder="ул. Ленина, 10" />
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
                  <TableHead>Населённый пункт</TableHead>
                  <TableHead>Адрес</TableHead>
                  {isSuperAdmin && <TableHead>Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.district}</TableCell>
                    <TableCell className="text-muted-foreground">{store.address || '—'}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditStore(store)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteStore(store.id)}>
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Диалог редактирования товара */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditProduct}>
            <DialogHeader>
              <DialogTitle>Редактировать товар</DialogTitle>
              <DialogDescription>Измените данные товара</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-name">Название товара</Label>
                <Input 
                  id="edit-product-name" 
                  name="name" 
                  defaultValue={editingProduct?.name} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Категория</Label>
                <Select name="category" defaultValue={editingProduct?.category}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-min-price">Мин. цена (₽)</Label>
                  <Input 
                    id="edit-min-price" 
                    name="minPrice" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingProduct?.minPrice} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max-price">Макс. цена (₽)</Label>
                  <Input 
                    id="edit-max-price" 
                    name="maxPrice" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingProduct?.maxPrice} 
                    required 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-photo-required">Требуется фото</Label>
                <Switch 
                  id="edit-photo-required" 
                  checked={editPhotoRequired}
                  onCheckedChange={setEditPhotoRequired}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования магазина */}
      <Dialog open={isEditStoreDialogOpen} onOpenChange={setIsEditStoreDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditStore}>
            <DialogHeader>
              <DialogTitle>Редактировать магазин</DialogTitle>
              <DialogDescription>Измените данные магазина</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-store-name">Название магазина</Label>
                <Input 
                  id="edit-store-name" 
                  name="name" 
                  defaultValue={editingStore?.name} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-district">Населённый пункт</Label>
                <Input 
                  id="edit-district" 
                  name="district" 
                  defaultValue={editingStore?.district} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Адрес</Label>
                <Input 
                  id="edit-address" 
                  name="address" 
                  defaultValue={editingStore?.address} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditStoreDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectoriesManagement;
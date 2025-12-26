import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AdminPanel from '@/components/AdminPanel';
import { dataStore } from '@/lib/store';
import * as XLSX from 'xlsx';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'operator' | 'admin' | 'superadmin'>('operator');
  const [username, setUsername] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [availableStores, setAvailableStores] = useState<string[]>([]);
  const [districts, setDistricts] = useState(dataStore.getDistricts());
  const [stores, setStores] = useState(dataStore.getStores());
  const [products, setProducts] = useState(dataStore.getProducts());
  const [priceRecords, setPriceRecords] = useState(dataStore.getPriceRecords());
  
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  
  const [isBulkInputMode, setIsBulkInputMode] = useState(false);
  const [bulkPriceList, setBulkPriceList] = useState<Array<{productName: string, price: string, comment?: string}>>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'operator' | 'admin' | 'superadmin' | null;
    const user = localStorage.getItem('username');
    
    if (!role || !user) {
      navigate('/login');
    } else {
      setUserRole(role);
      setUsername(user);
    }
    
    const updateData = () => {
      const newDistricts = dataStore.getDistricts();
      const newStores = dataStore.getStores();
      const newProducts = dataStore.getProducts();
      const newPriceRecords = dataStore.getPriceRecords();
      
      setDistricts(newDistricts);
      setStores(newStores);
      setProducts(newProducts);
      setPriceRecords(newPriceRecords);
      
      if (newDistricts.length > 0) {
        setAvailableStores(Array.from(new Set(newStores.map(s => s.name))));
      }
    };
    
    updateData();
    
    window.addEventListener('storage', updateData);
    window.addEventListener('dataStoreUpdate', updateData);
    
    return () => {
      window.removeEventListener('storage', updateData);
      window.removeEventListener('dataStoreUpdate', updateData);
    };
  }, [navigate]);

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const stores = dataStore.getStoresByDistrict(districtName);
    setAvailableStores(Array.from(new Set(stores.map(s => s.name))));
    setSelectedStore('');
  };
  
  const handleAddNewStore = () => {
    if (!newStoreName || !selectedDistrict) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название магазина и выберите населённый пункт',
        variant: 'destructive',
      });
      return;
    }
    
    dataStore.addStore({
      name: newStoreName,
      district: selectedDistrict,
      address: newStoreAddress || undefined,
    });
    
    const updatedStores = dataStore.getStoresByDistrict(selectedDistrict);
    setAvailableStores(Array.from(new Set(updatedStores.map(s => s.name))));
    setSelectedStore(newStoreName);
    
    toast({
      title: 'Магазин добавлен',
      description: `${newStoreName} успешно добавлен в ${selectedDistrict}`,
    });
    
    setNewStoreName('');
    setNewStoreAddress('');
    setIsAddStoreDialogOpen(false);
  };
  
  const handleAddProductToBulkList = () => {
    if (!selectedProduct || !price) {
      toast({
        title: 'Ошибка',
        description: 'Выберите товар и укажите цену',
        variant: 'destructive',
      });
      return;
    }
    
    setBulkPriceList([...bulkPriceList, {
      productName: selectedProduct,
      price: price,
      comment: comment || undefined,
    }]);
    
    setSelectedProduct('');
    setPrice('');
    setComment('');
    
    toast({
      title: 'Добавлено в список',
      description: `${selectedProduct} — ${price}₽`,
    });
  };
  
  const handleRemoveFromBulkList = (index: number) => {
    setBulkPriceList(bulkPriceList.filter((_, i) => i !== index));
  };
  
  const handleSaveBulkPrices = () => {
    if (!selectedDistrict || !selectedStore || bulkPriceList.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите магазин и добавьте хотя бы один товар',
        variant: 'destructive',
      });
      return;
    }
    
    const userId = localStorage.getItem('userId') || '3';
    const stores = dataStore.getStores();
    const products = dataStore.getProducts();
    const store = stores.find(s => s.name === selectedStore && s.district === selectedDistrict);
    
    if (!store) {
      toast({
        title: 'Ошибка',
        description: 'Магазин не найден',
        variant: 'destructive',
      });
      return;
    }
    
    let successCount = 0;
    bulkPriceList.forEach(item => {
      const product = products.find(p => p.name === item.productName);
      if (product) {
        dataStore.addPriceRecord({
          date: new Date().toISOString().split('T')[0],
          storeId: store.id,
          productId: product.id,
          price: parseFloat(item.price),
          comment: item.comment,
          operatorId: userId,
        });
        successCount++;
      }
    });
    
    toast({
      title: 'Данные сохранены',
      description: `Успешно добавлено ${successCount} записей о ценах`,
    });
    
    setBulkPriceList([]);
    setSelectedDistrict('');
    setSelectedStore('');
    setAvailableStores([]);
    setIsBulkInputMode(false);
  };
  
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<{[key: string]: string | number}>(firstSheet);
        
        const products = dataStore.getProducts();
        const importedPrices: Array<{productName: string, price: string, comment?: string}> = [];
        
        jsonData.forEach((row) => {
          const productName = String(row['Товар'] || row['Название товара'] || row['Product'] || '');
          const price = String(row['Цена'] || row['Price'] || '');
          const comment = String(row['Комментарий'] || row['Comment'] || '');
          
          if (productName && price) {
            const product = products.find(p => 
              p.name.toLowerCase().includes(productName.toLowerCase()) || 
              productName.toLowerCase().includes(p.name.toLowerCase())
            );
            
            if (product) {
              importedPrices.push({
                productName: product.name,
                price: price.toString().replace(/[^0-9.]/g, ''),
                comment: comment || undefined
              });
            }
          }
        });
        
        if (importedPrices.length > 0) {
          setBulkPriceList([...bulkPriceList, ...importedPrices]);
          toast({
            title: 'Импорт успешен',
            description: `Добавлено ${importedPrices.length} товаров из Excel`,
          });
          setIsImportDialogOpen(false);
        } else {
          toast({
            title: 'Ошибка импорта',
            description: 'Не найдено подходящих товаров в файле. Проверьте формат.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка чтения файла',
          description: 'Не удалось прочитать Excel файл',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDownloadTemplate = () => {
    const products = dataStore.getProducts();
    const templateData = products.map(p => ({
      'Товар': p.name,
      'Цена': '',
      'Комментарий': '',
      'Минимальная цена': p.minPrice,
      'Максимальная цена': p.maxPrice
    }));
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Шаблон');
    
    XLSX.writeFile(wb, 'шаблон_импорта_цен.xlsx');
    
    toast({
      title: 'Шаблон скачан',
      description: 'Заполните файл и импортируйте обратно',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleSubmitPrice = () => {
    if (!selectedDistrict || !selectedStore || !selectedProduct || !price) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const product = mockProducts.find(p => p.name === selectedProduct);
    const priceNum = parseFloat(price);

    if (product?.photoRequired && !photoFile) {
      toast({
        title: 'Ошибка',
        description: 'Для этого товара обязательна фотофиксация',
        variant: 'destructive',
      });
      return;
    }

    if (product && (priceNum < product.minPrice || priceNum > product.maxPrice)) {
      if (!comment) {
        toast({
          title: '⚠️ Требуется комментарий',
          description: 'Цена выходит за пределы. Укажите причину такой цены.',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Успешно',
      description: 'Данные о цене сохранены',
    });
    setSelectedDistrict('');
    setSelectedStore('');
    setSelectedProduct('');
    setPrice('');
    setComment('');
    setPhotoFile(null);
    setAvailableStores([]);
  };

  const getHeatColor = (index: number) => {
    if (index < 0.95) return 'bg-green-100 text-green-800';
    if (index < 1.05) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">Цена-Контроль</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Icon name="Wifi" size={16} />
              Онлайн
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant={userRole === 'superadmin' ? 'default' : 'secondary'} className="gap-2">
                <Icon name={userRole === 'superadmin' ? 'Crown' : userRole === 'admin' ? 'Shield' : 'User'} size={16} />
                {username}
                {userRole === 'superadmin' && ' (Главный админ)'}
                {userRole === 'admin' && ' (Админ)'}
                {userRole === 'operator' && ' (Оператор)'}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {userRole === 'admin' || userRole === 'superadmin' ? (
          <AdminPanel isSuperAdmin={userRole === 'superadmin'} />
        ) : (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Записей сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {priceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
                </span>
                <Icon name="FileText" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Магазинов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stores.length}</span>
                <Icon name="Store" size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя цена</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {priceRecords.length > 0 
                    ? Math.round(priceRecords.reduce((sum, r) => sum + r.price, 0) / priceRecords.length) 
                    : 0}₽
                </span>
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего записей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{priceRecords.length}</span>
                <Icon name="Database" size={24} className="text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="input" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="input" className="gap-2">
              <Icon name="PenSquare" size={16} />
              Ввод данных
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
              <Icon name="Map" size={16} />
              Карта цен
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={!isBulkInputMode ? 'default' : 'outline'}
                  onClick={() => setIsBulkInputMode(false)}
                  className="gap-2"
                >
                  <Icon name="PenSquare" size={16} />
                  Одиночный ввод
                </Button>
                <Button
                  variant={isBulkInputMode ? 'default' : 'outline'}
                  onClick={() => setIsBulkInputMode(true)}
                  className="gap-2"
                >
                  <Icon name="List" size={16} />
                  Списочный ввод
                </Button>
                {isBulkInputMode && (
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-2">
                        <Icon name="FileSpreadsheet" size={16} />
                        Импорт из Excel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Импорт цен из Excel</DialogTitle>
                        <DialogDescription>
                          Загрузите Excel файл с ценами для быстрого добавления
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Alert>
                          <Icon name="Info" size={16} />
                          <AlertDescription>
                            <p className="font-medium mb-2">Формат файла:</p>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                              <li>Колонка "Товар" — название товара</li>
                              <li>Колонка "Цена" — цена в рублях</li>
                              <li>Колонка "Комментарий" — необязательно</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <Label>Выберите Excel файл</Label>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleExcelImport}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                          <Icon name="Download" size={16} />
                          Скачать шаблон
                        </Button>
                        <Button variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
                          Закрыть
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {bulkPriceList.length > 0 && isBulkInputMode && (
                <Badge variant="secondary" className="gap-2">
                  <Icon name="Package" size={14} />
                  {bulkPriceList.length} товаров в списке
                </Badge>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{isBulkInputMode ? 'Списочный ввод цен' : 'Добавить цену'}</CardTitle>
                <CardDescription>
                  {isBulkInputMode 
                    ? 'Добавьте несколько товаров для одного магазина и сохраните всё сразу'
                    : 'Внесите данные о цене товара в магазине'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">Населённый пункт *</Label>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Выберите населённый пункт" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="store">Магазин *</Label>
                      <Dialog open={isAddStoreDialogOpen} onOpenChange={setIsAddStoreDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 h-6"
                            disabled={!selectedDistrict}
                          >
                            <Icon name="Plus" size={14} />
                            Добавить магазин
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Добавить новый магазин</DialogTitle>
                            <DialogDescription>
                              Создайте новый магазин в населённом пункте: {selectedDistrict}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="newStoreName">Название магазина *</Label>
                              <Input
                                id="newStoreName"
                                placeholder="Пятёрочка, Магнит, и т.д."
                                value={newStoreName}
                                onChange={(e) => setNewStoreName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newStoreAddress">Адрес (необязательно)</Label>
                              <Input
                                id="newStoreAddress"
                                placeholder="ул. Ленина, 15"
                                value={newStoreAddress}
                                onChange={(e) => setNewStoreAddress(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddStoreDialogOpen(false)}>
                              Отмена
                            </Button>
                            <Button onClick={handleAddNewStore}>
                              <Icon name="Plus" size={16} className="mr-2" />
                              Добавить
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select 
                      value={selectedStore} 
                      onValueChange={setSelectedStore}
                      disabled={!selectedDistrict}
                    >
                      <SelectTrigger id="store">
                        <SelectValue placeholder={selectedDistrict ? "Выберите магазин" : "Сначала выберите населённый пункт"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStores.map((store) => (
                          <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Товар *</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            <div className="flex items-center gap-2">
                              {product.name}
                              {product.photoRequired && (
                                <Icon name="Camera" size={14} className="text-primary" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({product.minPrice}–{product.maxPrice}₽)
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Input
                      id="comment"
                      placeholder="Добавьте комментарий (обязателен при превышении лимита цен)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="photo">
                      Фотофиксация
                      {mockProducts.find(p => p.name === selectedProduct)?.photoRequired && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    {mockProducts.find(p => p.name === selectedProduct)?.photoRequired && (
                      <Alert className="mb-2">
                        <Icon name="Camera" size={16} />
                        <AlertDescription>
                          Для данного товара обязательна загрузка фотографии ценника
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="flex-1"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      />
                      {photoFile && (
                        <Badge variant="secondary" className="gap-1">
                          <Icon name="Check" size={14} />
                          Загружено
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isBulkInputMode && bulkPriceList.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Icon name="List" size={16} />
                      Список товаров для добавления ({bulkPriceList.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {bulkPriceList.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.price}₽ {item.comment && `• ${item.comment}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromBulkList(index)}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setSelectedDistrict('');
                    setSelectedStore('');
                    setSelectedProduct('');
                    setPrice('');
                    setComment('');
                    setPhotoFile(null);
                    setAvailableStores([]);
                    setBulkPriceList([]);
                  }}>
                    Очистить
                  </Button>
                  {isBulkInputMode ? (
                    <>
                      <Button onClick={handleAddProductToBulkList} variant="secondary" className="gap-2">
                        <Icon name="Plus" size={16} />
                        Добавить в список
                      </Button>
                      <Button 
                        onClick={handleSaveBulkPrices} 
                        className="gap-2"
                        disabled={bulkPriceList.length === 0}
                      >
                        <Icon name="Save" size={16} />
                        Сохранить все ({bulkPriceList.length})
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleSubmitPrice} className="gap-2">
                      <Icon name="Save" size={16} />
                      Сохранить
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>История записей</CardTitle>
                <CardDescription>Последние внесенные данные о ценах</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Магазин</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Фото</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.store}</TableCell>
                        <TableCell>{record.product}</TableCell>
                        <TableCell className="font-semibold">{record.price}₽</TableCell>
                        <TableCell>
                          {record.status === 'normal' ? (
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Check" size={14} />
                              Норма
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <Icon name="AlertTriangle" size={14} />
                              Превышение
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.photo ? (
                            <Icon name="Image" size={18} className="text-green-600" />
                          ) : (
                            <Icon name="ImageOff" size={18} className="text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Тепловая карта цен</CardTitle>
                <CardDescription>Распределение средних цен по магазинам и районам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockHeatmapData.map((item) => (
                    <Card key={item.store} className={`border-2 ${getHeatColor(item.priceIndex)}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.store}</CardTitle>
                          <Badge variant="outline">{item.district}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Средняя цена</p>
                            <p className="text-3xl font-bold">{item.avgPrice}₽</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Индекс</p>
                            <p className="text-2xl font-semibold">{item.priceIndex.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика цен</CardTitle>
                <CardDescription>Статистика и тренды изменения цен</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Динамика средней цены</h3>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>График динамики цен</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Самый дорогой магазин</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold">Перекрёсток</p>
                        <p className="text-sm text-muted-foreground">Средняя цена: 88₽</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Самый дешёвый магазин</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold">Магнит</p>
                        <p className="text-sm text-muted-foreground">Средняя цена: 75₽</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Разница цен</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-primary">13₽</p>
                        <p className="text-sm text-muted-foreground">17.3% отклонение</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
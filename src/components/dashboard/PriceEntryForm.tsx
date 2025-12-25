import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/store';
import * as XLSX from 'xlsx';

interface PriceEntryFormProps {
  selectedDistrict: string;
  selectedStore: string;
  selectedProduct: string;
  price: string;
  comment: string;
  availableStores: string[];
  onDistrictChange: (district: string) => void;
  onStoreChange: (store: string) => void;
  onProductChange: (product: string) => void;
  onPriceChange: (price: string) => void;
  onCommentChange: (comment: string) => void;
}

export const PriceEntryForm = ({
  selectedDistrict,
  selectedStore,
  selectedProduct,
  price,
  comment,
  availableStores,
  onDistrictChange,
  onStoreChange,
  onProductChange,
  onPriceChange,
  onCommentChange,
}: PriceEntryFormProps) => {
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [isBulkInputMode, setIsBulkInputMode] = useState(false);
  const [bulkPriceList, setBulkPriceList] = useState<Array<{productName: string, price: string, comment?: string}>>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onStoreChange(newStoreName);
    
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
    
    onProductChange('');
    onPriceChange('');
    onCommentChange('');
    
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
    onDistrictChange('');
    onStoreChange('');
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
          
          const product = products.find(p => p.name === productName);
          if (product && price) {
            importedPrices.push({
              productName: productName,
              price: price,
              comment: comment || undefined,
            });
          }
        });
        
        if (importedPrices.length > 0) {
          setBulkPriceList([...bulkPriceList, ...importedPrices]);
          toast({
            title: 'Импорт завершён',
            description: `Импортировано ${importedPrices.length} товаров`,
          });
        } else {
          toast({
            title: 'Ошибка импорта',
            description: 'Не найдено подходящих данных в файле',
            variant: 'destructive',
          });
        }
        
        setIsImportDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось прочитать файл',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      toast({
        title: 'Фото загружено',
        description: e.target.files[0].name,
      });
    }
  };

  const handleSubmit = () => {
    if (!selectedDistrict || !selectedStore || !selectedProduct || !price) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Укажите корректную цену',
        variant: 'destructive',
      });
      return;
    }

    const userId = localStorage.getItem('userId') || '3';
    const stores = dataStore.getStores();
    const products = dataStore.getProducts();
    const store = stores.find(s => s.name === selectedStore && s.district === selectedDistrict);
    const product = products.find(p => p.name === selectedProduct);

    if (!store || !product) {
      toast({
        title: 'Ошибка',
        description: 'Магазин или товар не найден',
        variant: 'destructive',
      });
      return;
    }

    dataStore.addPriceRecord({
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      productId: product.id,
      price: priceNum,
      comment: comment || undefined,
      operatorId: userId,
      hasPhoto: !!photoFile,
    });

    toast({
      title: 'Данные сохранены',
      description: `Цена ${priceNum}₽ для "${selectedProduct}" в "${selectedStore}"`,
    });

    onProductChange('');
    onPriceChange('');
    onCommentChange('');
    setPhotoFile(null);
  };

  const districts = dataStore.getDistricts();
  const products = dataStore.getProducts();
  const selectedProductData = products.find(p => p.name === selectedProduct);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Внесение данных</CardTitle>
          <CardDescription>Заполните информацию о ценах в магазинах</CardDescription>
        </div>
        <Button 
          variant={isBulkInputMode ? "default" : "outline"}
          onClick={() => setIsBulkInputMode(!isBulkInputMode)}
          className="gap-2"
        >
          <Icon name={isBulkInputMode ? "FileText" : "ListPlus"} size={16} />
          {isBulkInputMode ? 'Одиночный ввод' : 'Массовый ввод'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="district">Населённый пункт *</Label>
            <Select value={selectedDistrict} onValueChange={onDistrictChange}>
              <SelectTrigger id="district">
                <SelectValue placeholder="Выберите район" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">Магазин *</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedStore} 
                onValueChange={onStoreChange}
                disabled={!selectedDistrict}
              >
                <SelectTrigger id="store">
                  <SelectValue placeholder={selectedDistrict ? "Выберите магазин" : "Сначала выберите район"} />
                </SelectTrigger>
                <SelectContent>
                  {availableStores.map((store) => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isAddStoreDialogOpen} onOpenChange={setIsAddStoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" disabled={!selectedDistrict}>
                    <Icon name="Plus" size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить магазин</DialogTitle>
                    <DialogDescription>
                      Добавьте новый магазин в {selectedDistrict}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-store-name">Название магазина *</Label>
                      <Input
                        id="new-store-name"
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="Например: Магнит"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-store-address">Адрес (необязательно)</Label>
                      <Input
                        id="new-store-address"
                        value={newStoreAddress}
                        onChange={(e) => setNewStoreAddress(e.target.value)}
                        placeholder="Улица, дом"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddStoreDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddNewStore}>
                      Добавить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {!isBulkInputMode ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="product">Товар *</Label>
              <Select value={selectedProduct} onValueChange={onProductChange}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Выберите товар" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.photoRequired && (
                          <Badge variant="secondary" className="text-xs">Фото обязательно</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProductData && (
                <p className="text-sm text-muted-foreground">
                  Диапазон: {selectedProductData.minPrice}₽ - {selectedProductData.maxPrice}₽
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Цена, ₽ *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => onPriceChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Фото товара {selectedProductData?.photoRequired && '*'}</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий (необязательно)</Label>
              <Input
                id="comment"
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Дополнительные замечания"
              />
            </div>

            {price && selectedProductData && (
              parseFloat(price) < selectedProductData.minPrice || parseFloat(price) > selectedProductData.maxPrice
            ) && (
              <Alert>
                <Icon name="AlertTriangle" size={16} />
                <AlertDescription>
                  Цена выходит за пределы ожидаемого диапазона ({selectedProductData.minPrice}₽ - {selectedProductData.maxPrice}₽)
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleSubmit} className="w-full gap-2">
              <Icon name="Save" size={16} />
              Сохранить данные
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Список товаров</h3>
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="FileUp" size={16} />
                      Импорт из Excel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Импорт из Excel</DialogTitle>
                      <DialogDescription>
                        Загрузите файл Excel с колонками: Товар, Цена, Комментарий
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelImport}
                        className="w-full"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                        Отмена
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-product">Товар *</Label>
                <Select value={selectedProduct} onValueChange={onProductChange}>
                  <SelectTrigger id="bulk-product">
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bulk-price">Цена, ₽ *</Label>
                  <Input
                    id="bulk-price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => onPriceChange(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-comment">Комментарий</Label>
                  <Input
                    id="bulk-comment"
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Опционально"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddProductToBulkList} className="w-full gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить
                  </Button>
                </div>
              </div>

              {bulkPriceList.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Добавлено: {bulkPriceList.length}</span>
                    <Button variant="ghost" size="sm" onClick={() => setBulkPriceList([])}>
                      Очистить всё
                    </Button>
                  </div>
                  {bulkPriceList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.price}₽ {item.comment && `• ${item.comment}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromBulkList(idx)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleSaveBulkPrices} 
                className="w-full gap-2"
                disabled={bulkPriceList.length === 0}
              >
                <Icon name="Save" size={16} />
                Сохранить все ({bulkPriceList.length})
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

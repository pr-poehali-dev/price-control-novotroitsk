import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPanel from '@/components/AdminPanel';
import { PriceEntryForm } from '@/components/dashboard/PriceEntryForm';
import { RecentRecordsTable } from '@/components/dashboard/RecentRecordsTable';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { dataStore } from '@/lib/store';

const Index = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'operator' | 'admin' | 'superadmin'>('operator');
  const [username, setUsername] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [availableStores, setAvailableStores] = useState<string[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'operator' | 'admin' | 'superadmin' | null;
    const user = localStorage.getItem('username');
    
    if (!role || !user) {
      navigate('/login');
    } else {
      setUserRole(role);
      setUsername(user);
    }
    
    const districts = dataStore.getDistricts();
    if (districts.length > 0) {
      const stores = dataStore.getStores();
      setAvailableStores(Array.from(new Set(stores.map(s => s.name))));
    }
  }, [navigate]);

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const stores = dataStore.getStoresByDistrict(districtName);
    setAvailableStores(Array.from(new Set(stores.map(s => s.name))));
    setSelectedStore('');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              МЦ
            </div>
            <div>
              <h1 className="text-xl font-bold">Мониторинг цен</h1>
              <p className="text-sm text-muted-foreground">
                {userRole === 'superadmin' ? 'Суперадминистратор' : userRole === 'admin' ? 'Администратор' : 'Оператор'} • {username}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            Выход
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="data-entry" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="data-entry">Внесение данных</TabsTrigger>
            <TabsTrigger value="admin" disabled={userRole === 'operator'}>
              Управление
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-entry" className="space-y-6">
            <QuickStats />
            
            <PriceEntryForm
              selectedDistrict={selectedDistrict}
              selectedStore={selectedStore}
              selectedProduct={selectedProduct}
              price={price}
              comment={comment}
              availableStores={availableStores}
              onDistrictChange={handleDistrictChange}
              onStoreChange={setSelectedStore}
              onProductChange={setSelectedProduct}
              onPriceChange={setPrice}
              onCommentChange={setComment}
            />

            <RecentRecordsTable />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel userRole={userRole} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

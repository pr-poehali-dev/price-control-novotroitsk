import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { dataStore } from '@/lib/store';

export const QuickStats = () => {
  const [records, setRecords] = useState(dataStore.getPriceRecords());
  const [stores, setStores] = useState(dataStore.getStores());

  useEffect(() => {
    const updateData = () => {
      setRecords(dataStore.getPriceRecords());
      setStores(dataStore.getStores());
    };

    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);
  
  const avgPrice = records.length > 0
    ? records.reduce((sum, r) => sum + r.price, 0) / records.length
    : 0;

  const stats = [
    {
      title: 'Записей сегодня',
      value: todayRecords.length,
      icon: 'FileText',
      color: 'text-blue-600',
    },
    {
      title: 'Всего записей',
      value: records.length,
      icon: 'Database',
      color: 'text-green-600',
    },
    {
      title: 'Магазинов',
      value: stores.length,
      icon: 'Store',
      color: 'text-purple-600',
    },
    {
      title: 'Средняя цена',
      value: `${avgPrice.toFixed(0)}₽`,
      icon: 'TrendingUp',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <Icon name={stat.icon as any} className={stat.color} size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
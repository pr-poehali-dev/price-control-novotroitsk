export interface User {
  id: string;
  login: string;
  password: string;
  role: 'operator' | 'admin' | 'superadmin';
  status: 'active' | 'blocked';
  telegram?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  photoRequired: boolean;
}

export interface Store {
  id: string;
  name: string;
  district: string;
  address?: string;
}

export interface District {
  id: string;
  name: string;
}

export interface PriceRecord {
  id: string;
  date: string;
  storeId: string;
  productId: string;
  price: number;
  comment?: string;
  photoUrl?: string;
  hasPhoto?: boolean;
  operatorId: string;
  createdAt: string;
}

export interface SystemConfig {
  appName: string;
  appDescription: string;
  logoIcon: string;
  primaryColor: string;
  accentColor: string;
}

export interface PageContent {
  homeTitle: string;
  homeSubtitle: string;
  homeContent: string;
  homeButtonText: string;
  loginTitle: string;
  loginSubtitle: string;
  aboutTitle: string;
  aboutContent: string;
  contactPhone: string;
  footerText: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
}

class DataStore {
  private storageKey = 'price-control-data';

  private defaultData = {
    productCategories: [
      { id: '1', name: 'Социально значимые товары', createdAt: '2024-01-01' },
      { id: '2', name: 'Молочные продукты', createdAt: '2024-01-01' },
      { id: '3', name: 'Мясо и птица', createdAt: '2024-01-01' },
      { id: '4', name: 'Хлеб и выпечка', createdAt: '2024-01-01' },
      { id: '5', name: 'Овощи и фрукты', createdAt: '2024-01-01' },
      { id: '6', name: 'Бакалея', createdAt: '2024-01-01' },
      { id: '7', name: 'Яйца', createdAt: '2024-01-01' },
    ],
    users: [
      {
        id: '1',
        login: 'Admin1',
        password: '1A3g5m7t9$',
        role: 'superadmin' as const,
        status: 'active' as const,
        createdAt: '2024-01-01',
        lastLogin: new Date().toISOString(),
      },
      {
        id: '2',
        login: 'admin',
        password: 'admin',
        role: 'admin' as const,
        status: 'active' as const,
        telegram: '@admin_telegram',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15 16:00',
      },
      {
        id: '3',
        login: 'operator1',
        password: 'operator',
        role: 'operator' as const,
        status: 'active' as const,
        telegram: '+7 (900) 123-45-67',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15 14:30',
      },
      {
        id: '4',
        login: 'operator2',
        password: 'operator',
        role: 'operator' as const,
        status: 'active' as const,
        telegram: '@operator2_tg',
        createdAt: '2024-01-02',
        lastLogin: '2024-01-14 09:15',
      },
    ],
    districts: [
      { id: '1', name: 'Новотроицкое (центр)' },
      { id: '2', name: 'Северный район' },
      { id: '3', name: 'Западный район' },
      { id: '4', name: 'Южный район' },
    ],
    stores: [
      { id: '1', name: 'Магнит', district: 'Новотроицкое (центр)', address: 'ул. Ленина, 15' },
      { id: '2', name: 'Пятёрочка', district: 'Новотроицкое (центр)', address: 'ул. Центральная, 32' },
      { id: '3', name: 'Перекрёсток', district: 'Новотроицкое (центр)', address: 'пр. Мира, 8' },
      { id: '4', name: 'Лента', district: 'Северный район', address: 'ул. Северная, 45' },
      { id: '5', name: 'Дикси', district: 'Северный район', address: 'ул. Комсомольская, 12' },
      { id: '6', name: 'Магнит', district: 'Западный район', address: 'ул. Западная, 23' },
      { id: '7', name: 'Монетка', district: 'Западный район', address: 'ул. Победы, 67' },
      { id: '8', name: 'Пятёрочка', district: 'Южный район', address: 'ул. Южная, 18' },
      { id: '9', name: 'Верный', district: 'Южный район', address: 'пр. Ленина, 91' },
    ],
    products: [
      { id: '1', name: 'Молоко 3.2%', category: 'Молочные продукты', minPrice: 65, maxPrice: 85, photoRequired: false },
      { id: '2', name: 'Хлеб белый', category: 'Хлеб и выпечка', minPrice: 35, maxPrice: 50, photoRequired: true },
      { id: '3', name: 'Куриная грудка', category: 'Мясо и птица', minPrice: 280, maxPrice: 350, photoRequired: false },
      { id: '4', name: 'Яйца куриные, 10 шт.', category: 'Яйца', minPrice: 85, maxPrice: 110, photoRequired: false },
      { id: '5', name: 'Сахар, 1 кг', category: 'Бакалея', minPrice: 55, maxPrice: 75, photoRequired: false },
      { id: '6', name: 'Хлеб ржаной', category: 'Социально значимые товары', minPrice: 30, maxPrice: 45, photoRequired: false },
      { id: '7', name: 'Масло подсолнечное, 1 л', category: 'Социально значимые товары', minPrice: 85, maxPrice: 120, photoRequired: false },
      { id: '8', name: 'Крупа гречневая, 1 кг', category: 'Социально значимые товары', minPrice: 70, maxPrice: 95, photoRequired: false },
    ],
    priceRecords: [
      { id: '1', date: '2024-01-15', storeId: '1', productId: '1', price: 72, operatorId: '3', createdAt: '2024-01-15T10:30:00' },
      { id: '2', date: '2024-01-15', storeId: '2', productId: '2', price: 45, operatorId: '4', createdAt: '2024-01-15T11:15:00' },
      { id: '3', date: '2024-01-14', storeId: '4', productId: '3', price: 310, operatorId: '3', createdAt: '2024-01-14T14:20:00' },
      { id: '4', date: '2024-01-14', storeId: '1', productId: '4', price: 95, operatorId: '4', createdAt: '2024-01-14T15:45:00' },
      { id: '5', date: '2024-01-13', storeId: '3', productId: '1', price: 78, operatorId: '3', createdAt: '2024-01-13T09:10:00' },
      { id: '6', date: '2024-01-15', storeId: '1', productId: '6', price: 38, operatorId: '3', createdAt: '2024-01-15T12:00:00' },
      { id: '7', date: '2024-01-15', storeId: '2', productId: '6', price: 42, operatorId: '4', createdAt: '2024-01-15T12:30:00' },
      { id: '8', date: '2024-01-15', storeId: '1', productId: '7', price: 95, operatorId: '3', createdAt: '2024-01-15T13:00:00' },
      { id: '9', date: '2024-01-15', storeId: '3', productId: '7', price: 110, operatorId: '4', createdAt: '2024-01-15T13:15:00' },
      { id: '10', date: '2024-01-15', storeId: '1', productId: '8', price: 85, operatorId: '3', createdAt: '2024-01-15T14:00:00' },
      { id: '11', date: '2024-01-15', storeId: '4', productId: '8', price: 78, operatorId: '4', createdAt: '2024-01-15T14:30:00' },
    ],
    systemConfig: {
      appName: 'Цена-Контроль Новотроицкое',
      appDescription: 'Система мониторинга цен',
      logoIcon: 'TrendingUp',
      primaryColor: '#1EAEDB',
      accentColor: '#F97316',
    },
    pageContent: {
      homeTitle: 'Мониторинг цен в магазинах',
      homeSubtitle: 'Актуальная информация о ценах на продукты питания в Новотроицком муниципальном округе',
      homeContent: 'Система мониторинга цен создана для информирования жителей Новотроицкого муниципального округа об актуальных ценах на продукты питания в местных магазинах. Данные собираются ежедневно специалистами и проходят проверку на достоверность.',
      homeButtonText: 'Вход для сотрудников',
      loginTitle: 'Вход для сотрудников',
      loginSubtitle: 'Система мониторинга цен Новотроицкого МО',
      aboutTitle: 'О проекте',
      aboutContent: 'Система мониторинга цен «Цена-Контроль» создана для информирования жителей Новотроицкого муниципального округа об актуальных ценах на продукты питания в местных магазинах. Данные собираются ежедневно специалистами и проходят проверку на достоверность. Это позволяет жителям сравнивать цены и делать осознанный выбор при покупке продуктов.',
      contactPhone: '+7 (XXX) XXX-XX-XX',
      footerText: '© 2024 Новотроицкое МО. Система мониторинга цен.',
    },
  };

  private data: typeof this.defaultData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (!parsedData.productCategories) {
          parsedData.productCategories = this.defaultData.productCategories;
        }
        return { ...this.defaultData, ...parsedData };
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return this.defaultData;
  }

  private saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('dataStoreUpdate', { detail: this.data }));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  getUsers(): User[] {
    return this.data.users;
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveData();
      return this.data.users[index];
    }
    return null;
  }

  deleteUser(id: string): boolean {
    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  authenticateUser(login: string, password: string): User | null {
    const user = this.data.users.find(u => u.login === login && u.password === password && u.status === 'active');
    if (user) {
      this.updateUser(user.id, { lastLogin: new Date().toISOString() });
      return user;
    }
    return null;
  }

  getDistricts(): District[] {
    return this.data.districts;
  }

  addDistrict(district: Omit<District, 'id'>): District {
    const newDistrict: District = {
      ...district,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.data.districts.push(newDistrict);
    this.saveData();
    return newDistrict;
  }

  updateDistrict(id: string, updates: Partial<District>): District | null {
    const index = this.data.districts.findIndex(d => d.id === id);
    if (index !== -1) {
      this.data.districts[index] = { ...this.data.districts[index], ...updates };
      this.saveData();
      return this.data.districts[index];
    }
    return null;
  }

  deleteDistrict(id: string): boolean {
    const initialLength = this.data.districts.length;
    this.data.districts = this.data.districts.filter(d => d.id !== id);
    if (this.data.districts.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  getStores(): Store[] {
    return this.data.stores;
  }

  getStoresByDistrict(district: string): Store[] {
    return this.data.stores.filter(s => s.district === district);
  }

  addStore(store: Omit<Store, 'id'>): Store {
    const newStore: Store = {
      ...store,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.data.stores.push(newStore);
    this.saveData();
    return newStore;
  }

  updateStore(id: string, updates: Partial<Store>): Store | null {
    const index = this.data.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.stores[index] = { ...this.data.stores[index], ...updates };
      this.saveData();
      return this.data.stores[index];
    }
    return null;
  }

  deleteStore(id: string): boolean {
    const initialLength = this.data.stores.length;
    this.data.stores = this.data.stores.filter(s => s.id !== id);
    if (this.data.stores.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  getProducts(): Product[] {
    return this.data.products;
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.data.products.push(newProduct);
    this.saveData();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      this.saveData();
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id: string): boolean {
    const initialLength = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  getPriceRecords(): PriceRecord[] {
    return this.data.priceRecords;
  }

  addPriceRecord(record: Omit<PriceRecord, 'id' | 'createdAt'>): PriceRecord {
    const newRecord: PriceRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.priceRecords.push(newRecord);
    this.saveData();
    return newRecord;
  }

  updatePriceRecord(id: string, updates: Partial<PriceRecord>): PriceRecord | null {
    const index = this.data.priceRecords.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.priceRecords[index] = { ...this.data.priceRecords[index], ...updates };
      this.saveData();
      return this.data.priceRecords[index];
    }
    return null;
  }

  deletePriceRecord(id: string): boolean {
    const initialLength = this.data.priceRecords.length;
    this.data.priceRecords = this.data.priceRecords.filter(r => r.id !== id);
    if (this.data.priceRecords.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  bulkDeletePriceRecords(ids: string[]): number {
    const initialLength = this.data.priceRecords.length;
    this.data.priceRecords = this.data.priceRecords.filter(r => !ids.includes(r.id));
    const deleted = initialLength - this.data.priceRecords.length;
    if (deleted > 0) {
      this.saveData();
    }
    return deleted;
  }

  bulkUpdatePriceRecords(ids: string[], updates: Partial<PriceRecord>): number {
    let updated = 0;
    this.data.priceRecords = this.data.priceRecords.map(r => {
      if (ids.includes(r.id)) {
        updated++;
        return { ...r, ...updates };
      }
      return r;
    });
    if (updated > 0) {
      this.saveData();
    }
    return updated;
  }

  getSystemConfig(): SystemConfig {
    return this.data.systemConfig;
  }

  updateSystemConfig(config: Partial<SystemConfig>): SystemConfig {
    this.data.systemConfig = { ...this.data.systemConfig, ...config };
    this.saveData();
    return this.data.systemConfig;
  }

  getPageContent(): PageContent {
    return this.data.pageContent;
  }

  updatePageContent(content: Partial<PageContent>): PageContent {
    this.data.pageContent = { ...this.data.pageContent, ...content };
    this.saveData();
    return this.data.pageContent;
  }

  getProductCategories(): ProductCategory[] {
    return this.data.productCategories || [];
  }

  addProductCategory(category: Omit<ProductCategory, 'id' | 'createdAt'>): ProductCategory {
    const newCategory: ProductCategory = {
      ...category,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.productCategories) {
      this.data.productCategories = [];
    }
    this.data.productCategories.push(newCategory);
    this.saveData();
    return newCategory;
  }

  updateProductCategory(id: string, updates: Partial<ProductCategory>): ProductCategory | null {
    if (!this.data.productCategories) return null;
    const index = this.data.productCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.productCategories[index] = { ...this.data.productCategories[index], ...updates };
      this.saveData();
      return this.data.productCategories[index];
    }
    return null;
  }

  deleteProductCategory(id: string): boolean {
    if (!this.data.productCategories) return false;
    const initialLength = this.data.productCategories.length;
    this.data.productCategories = this.data.productCategories.filter(c => c.id !== id);
    if (this.data.productCategories.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  resetToDefaults(): void {
    this.data = JSON.parse(JSON.stringify(this.defaultData));
    this.saveData();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      this.data = { ...this.defaultData, ...imported };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const dataStore = new DataStore();
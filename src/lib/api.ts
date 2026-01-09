import { supabase } from './supabase';
import {
  User,
  Category,
  ClothingType,
  Order,
  OrderMeasurement,
  Staff,
  OrderExtraCharge
} from './supabase';

// Define a type for creating orders that includes measurements
export type CreateOrderData = Omit<Order, 'id' | 'order_id' | 'created_at' | 'updated_at'> & {
  measurements?: Partial<OrderMeasurement>;
  designFile?: File | null;
};

// User API functions
export const userAPI = {
  // Get current user profile
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  },

  // Update user profile
  updateUserProfile: async (userData: Partial<User>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  },

  // Create new user
  createUser: async (userData: Omit<User, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  },
};

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Category[];
  },

  // Get category by ID
  getCategoryById: async (id: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  },

  // Create new category
  createCategory: async (name: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  },
};

// Clothing type API functions
export const clothingTypeAPI = {
  // Get all clothing types
  getClothingTypes: async () => {
    const { data, error } = await supabase
      .from('clothing_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as ClothingType[];
  },

  // Get clothing types by category
  getClothingTypesByCategory: async (categoryId: string) => {
    const { data, error } = await supabase
      .from('clothing_types')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as ClothingType[];
  },

  // Create new clothing type
  createClothingType: async (name: string, categoryId: string) => {
    const { data, error } = await supabase
      .from('clothing_types')
      .insert([{ name, category_id: categoryId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ClothingType;
  },
};

// Order API functions
export const orderAPI = {
  // Get all orders for a customer
  getCustomerOrders: async (customerId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Order[];
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_measurements (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw new Error(error.message);
    return data as Order & { order_measurements: OrderMeasurement[] };
  },

  // Create new order
  createOrder: async (orderData: CreateOrderData) => {
    // Generate order ID (Simplified)
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const orderNumber = (count || 0) + 1;
    const orderId = `TS-${orderNumber.toString().padStart(3, '0')}`;

    // Extract measurements and file from order data
    const { measurements, designFile, ...orderWithoutExtras } = orderData;
    let designReferenceUrl = '';

    // Upload design reference if provided
    if (designFile) {
      const fileExt = designFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `design_refs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, designFile);

      if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);

      designReferenceUrl = publicUrl;
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ...orderWithoutExtras,
        order_id: orderId,
        design_reference_url: designReferenceUrl || undefined
      }])
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Insert measurements if provided
    if (measurements && Object.keys(measurements).length > 0) {
      // Map camelCase keys to snake_case for the database
      const mappedMeasurements: any = {};
      Object.entries(measurements).forEach(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        mappedMeasurements[snakeKey] = value;
      });

      const { data: mData, error: measurementError } = await supabase
        .from('order_measurements')
        .insert([{
          order_id: order.id,
          ...mappedMeasurements
        }])
        .select();

      console.log('Measurement Save Result:', { data: mData, error: measurementError });
      if (measurementError) throw new Error(measurementError.message);
    }

    return order as Order;
  },

  // Update order
  updateOrder: async (orderId: string, orderData: Partial<CreateOrderData>) => {
    const { measurements, designFile, ...orderWithoutExtras } = orderData;
    let designReferenceUrl = '';

    // Upload new design reference if provided
    if (designFile) {
      const fileExt = designFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `design_refs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, designFile);

      if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);

      designReferenceUrl = publicUrl;
    }

    const updatePayload: any = { ...orderWithoutExtras };
    if (designReferenceUrl) updatePayload.design_reference_url = designReferenceUrl;
    updatePayload.updated_at = new Date().toISOString();

    // Update order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Update measurements if provided
    if (measurements && Object.keys(measurements).length > 0) {
      const mappedMeasurements: any = {};
      Object.entries(measurements).forEach(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        mappedMeasurements[snakeKey] = value;
      });

      const { error: measurementError } = await supabase
        .from('order_measurements')
        .upsert({
          order_id: orderId,
          ...mappedMeasurements,
          updated_at: new Date().toISOString()
        }, { onConflict: 'order_id' });

      if (measurementError) throw new Error(measurementError.message);
    }

    return order as Order;
  },

  // Delete order
  deleteOrder: async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw new Error(error.message);
    return true;
  },

  // Add extra charge
  addExtraCharge: async (orderId: string, amount: number, description: string) => {
    const { data, error } = await supabase
      .from('order_extra_charges')
      .insert({ order_id: orderId, amount, description })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as OrderExtraCharge;
  },

  // Get extra charges for an order
  getExtraCharges: async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_extra_charges')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data as OrderExtraCharge[];
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Order;
  },

  // Get orders by status
  getOrdersByStatus: async (status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Order[];
  },
};

// Staff API functions
export const staffAPI = {
  // Get all staff members
  getStaff: async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*, users (full_name, email, phone)')
      .order('users.full_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as (Staff & { users: User })[];
  },

  // Get staff by role
  getStaffByRole: async (role: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*, users (full_name, email, phone)')
      .eq('role', role)
      .order('users.full_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as (Staff & { users: User })[];
  },

  // Get only tailors
  getTailors: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'tailor')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as User[];
  },
};

// Authentication API functions
export const authAPI = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // Sign in with phone number (OTP)
  signInWithPhone: async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  },
};
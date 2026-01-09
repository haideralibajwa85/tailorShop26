import { NextRequest, NextResponse } from 'next/server';
import { orderAPI } from '../../../lib/api';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.customer_id || !orderData.category || !orderData.clothing_type) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, category, or clothing_type' },
        { status: 400 }
      );
    }

    // Create the order
    const newOrder = await orderAPI.createOrder(orderData);
    
    return NextResponse.json(
      { message: 'Order created successfully', order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    
    let orders;
    
    if (customerId) {
      // Get orders for a specific customer
      orders = await orderAPI.getCustomerOrders(customerId);
    } else if (status) {
      // Get orders by status
      orders = await orderAPI.getOrdersByStatus(status);
    } else {
      return NextResponse.json(
        { error: 'Either customer_id or status parameter is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}